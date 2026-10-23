-- Зерде — схема базы для Supabase (Postgres).
-- Выполнить целиком в Supabase → SQL Editor → New query → Run. Повторный запуск безопасен.
--
-- Принцип: всё, что связано с деньгами, доступом, промокодами и баллами, решает сервер.
-- Страница (публичный код) только просит: «активируй промокод», «запиши баллы», «создай заявку на оплату».
-- Права доступа — Row Level Security: каждый видит только своё; родитель — данные привязанного ребёнка;
-- админ — всё.

create extension if not exists pgcrypto;

-- ---------- профили ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'student' check (role in ('student', 'parent', 'admin')),
  name text not null default '',
  school text default 'BIL' check (school = 'BIL'),   -- готовим только к БИЛ
  grade int,
  child_code text unique,                 -- код ребёнка: родитель вводит его, чтобы видеть результаты
  sub_until timestamptz,                  -- оплачено до
  trial_until timestamptz,                -- пробный период до
  created_at timestamptz not null default now()
);
-- Для админки: почта (копия из auth.users) и когда пользователь был на сайте последний раз.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists last_seen timestamptz;
-- Согласие с офертой и политикой конфиденциальности: когда и с какой редакцией документов (ставит handle_new_user).
alter table public.profiles add column if not exists consent_at timestamptz;
alter table public.profiles add column if not exists consent_version text;
-- Школа — только БИЛ: старые значения переводим на 'BIL' и пересоздаём ограничение
-- (имя старого ограничения ищем по определению — так скрипт можно запускать повторно).
update public.profiles set school = 'BIL' where school is not null and school <> 'BIL';
do $$
declare c record;
begin
  for c in select con.conname from pg_constraint con
           where con.conrelid = 'public.profiles'::regclass and con.contype = 'c'
             and pg_get_constraintdef(con.oid) ilike '%school%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end $$;
alter table public.profiles add constraint profiles_school_check check (school = 'BIL');
alter table public.profiles alter column school set default 'BIL';

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);
insert into public.settings (key, value) values
  ('prices', '{"m1": {"months": 1, "amount": 30000}, "m3": {"months": 3, "amount": 75000}, "m6": {"months": 6, "amount": 120000}}'),
  ('trial_days', '3'),
  ('kaspi', '{"phone": "", "name": ""}'),
  ('prizes', '{"kk": "", "ru": ""}'),
  ('legal', '{"name": "", "bin": "", "address": "", "phone": "", "email": "", "whatsapp": "", "telegram": ""}')
on conflict (key) do nothing;

-- ---------- журнал активности (кто, что, когда) ----------
-- Пишется только серверными функциями ниже; читает сам пользователь и админ.
create table if not exists public.activity (
  id bigserial primary key,
  user_id uuid not null references public.profiles on delete cascade,
  kind text not null,
  info jsonb not null default '{}',
  at timestamptz not null default now()
);
create index if not exists activity_user_at on public.activity (user_id, at desc);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Новый пользователь: профиль с ролью ученик/родитель (админом стать можно только промокодом),
-- пробный период и код ребёнка.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare r text := coalesce(new.raw_user_meta_data->>'role', 'student');
        days int := coalesce((select (value)::text::int from public.settings where key = 'trial_days'), 3);
begin
  if r not in ('student', 'parent') then r := 'student'; end if;
  insert into public.profiles (id, role, email, last_seen, name, school, grade, child_code, trial_until, consent_at, consent_version)
  values (new.id, r, lower(new.email), now(), left(coalesce(new.raw_user_meta_data->>'name', ''), 40),
          case when r = 'student' then 'BIL' end, nullif(new.raw_user_meta_data->>'grade', '')::int,
          upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6)),
          case when r = 'student' then now() + make_interval(days => days) end,
          -- согласие: страница присылает consent=true и версию документов; время — серверное
          case when coalesce(new.raw_user_meta_data->>'consent', '') = 'true' then now() end,
          left(nullif(new.raw_user_meta_data->>'consent_version', ''), 40))
  on conflict (id) do nothing;
  insert into public.activity (user_id, kind, info) values (new.id, 'signup', jsonb_build_object('role', r));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Пользователь может менять имя, школу и класс, но не роль, оплату и код.
create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.role := old.role; new.sub_until := old.sub_until; new.trial_until := old.trial_until; new.child_code := old.child_code;
    new.email := old.email; new.created_at := old.created_at;
    new.consent_at := old.consent_at; new.consent_version := old.consent_version;
    new.name := left(new.name, 40);
  end if;
  return new;
end $$;
drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile before update on public.profiles for each row execute function public.guard_profile();

-- ---------- прогресс ученика ----------
create table if not exists public.progress (
  user_id uuid primary key references public.profiles on delete cascade,
  state jsonb not null default '{}',      -- сжатое состояние сайта (темы, план, пробные, ошибки)
  summary jsonb not null default '{}',    -- короткая сводка для родителя и админа
  updated_at timestamptz not null default now()
);

create table if not exists public.parent_links (
  parent_id uuid references public.profiles on delete cascade,
  child_id uuid references public.profiles on delete cascade,
  primary key (parent_id, child_id)
);

create or replace function public.is_parent_of(child uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.parent_links where parent_id = auth.uid() and child_id = child);
$$;

-- ---------- промокоды ----------
-- kind: admin — даёт роль админа; free — бесплатный доступ на days дней (null = навсегда); discount — скидка percent %.
create table if not exists public.promo_codes (
  code text primary key,
  kind text not null check (kind in ('admin', 'free', 'discount')),
  days int,
  percent int check (percent between 1 and 100),
  max_uses int,
  used int not null default 0,
  expires_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);
create table if not exists public.promo_redemptions (
  code text references public.promo_codes on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  at timestamptz not null default now(),
  primary key (code, user_id)
);

-- ---------- оплата (Kaspi-перевод → подтверждение админом) ----------
create table if not exists public.payments (
  id bigserial primary key,
  user_id uuid not null references public.profiles on delete cascade,
  plan text not null,
  months int not null,
  amount int not null,
  promo text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid
);
-- «Төледім / Я оплатил»: имя отправителя в Kaspi и 4 последние цифры его телефона — чтобы админ нашёл перевод.
-- Код платежа для комментария к переводу считается из id: 'ZRD-' || (1000 + id).
alter table public.payments add column if not exists payer_name text;
alter table public.payments add column if not exists payer_phone4 text;
alter table public.payments add column if not exists paid_at timestamptz;
alter table public.payments add column if not exists payer_comment text;
create index if not exists payments_status on public.payments (status, created_at desc);

-- ---------- баллы ----------
create table if not exists public.points (
  id bigserial primary key,
  user_id uuid not null references public.profiles on delete cascade,
  kind text not null,
  ref text not null,
  amount int not null,
  at timestamptz not null default now(),
  unique (user_id, kind, ref)             -- одно и то же действие дважды не засчитывается
);
create index if not exists points_month on public.points (at);

-- ---------- права (RLS) ----------
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.parent_links enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;
alter table public.payments enable row level security;
alter table public.points enable row level security;
alter table public.settings enable row level security;
alter table public.activity enable row level security;

drop policy if exists p_activity_read on public.activity;
create policy p_activity_read on public.activity for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists p_profiles_read on public.profiles;
create policy p_profiles_read on public.profiles for select using (id = auth.uid() or public.is_admin() or public.is_parent_of(id));
drop policy if exists p_profiles_update on public.profiles;
create policy p_profiles_update on public.profiles for update using (id = auth.uid() or public.is_admin());

drop policy if exists p_progress_read on public.progress;
create policy p_progress_read on public.progress for select using (user_id = auth.uid() or public.is_admin() or public.is_parent_of(user_id));
drop policy if exists p_progress_write on public.progress;
create policy p_progress_write on public.progress for insert with check (user_id = auth.uid());
drop policy if exists p_progress_update on public.progress;
create policy p_progress_update on public.progress for update using (user_id = auth.uid());

drop policy if exists p_links_read on public.parent_links;
create policy p_links_read on public.parent_links for select using (parent_id = auth.uid() or child_id = auth.uid() or public.is_admin());
drop policy if exists p_links_delete on public.parent_links;
create policy p_links_delete on public.parent_links for delete using (parent_id = auth.uid() or public.is_admin());

drop policy if exists p_promo_admin on public.promo_codes;
create policy p_promo_admin on public.promo_codes for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists p_redeem_read on public.promo_redemptions;
create policy p_redeem_read on public.promo_redemptions for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists p_pay_read on public.payments;
create policy p_pay_read on public.payments for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists p_points_read on public.points;
create policy p_points_read on public.points for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists p_settings_read on public.settings;
create policy p_settings_read on public.settings for select using (true);
drop policy if exists p_settings_admin on public.settings;
create policy p_settings_admin on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- ---------- серверные действия ----------

-- Активировать промокод.
create or replace function public.redeem_promo(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare pc public.promo_codes; uid uuid := auth.uid(); base timestamptz;
begin
  if uid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  select * into pc from public.promo_codes where code = upper(trim(p_code)) for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if pc.expires_at is not null and pc.expires_at < now() then return jsonb_build_object('ok', false, 'error', 'expired'); end if;
  if pc.max_uses is not null and pc.used >= pc.max_uses then return jsonb_build_object('ok', false, 'error', 'used_up'); end if;
  if exists (select 1 from public.promo_redemptions where code = pc.code and user_id = uid) then return jsonb_build_object('ok', false, 'error', 'already'); end if;
  if pc.kind = 'admin' then
    update public.profiles set role = 'admin' where id = uid;
  elsif pc.kind = 'free' then
    select greatest(coalesce(sub_until, now()), now()) into base from public.profiles where id = uid;
    update public.profiles set sub_until = case when pc.days is null then 'infinity'::timestamptz else base + make_interval(days => pc.days) end where id = uid;
  end if;
  insert into public.promo_redemptions (code, user_id) values (pc.code, uid);
  insert into public.activity (user_id, kind, info) values (uid, 'promo', jsonb_build_object('kind', pc.kind));
  update public.promo_codes set used = used + 1 where code = pc.code;
  return jsonb_build_object('ok', true, 'kind', pc.kind, 'days', pc.days, 'percent', pc.percent);
end $$;

-- Заявка на оплату: сумму считает сервер по тарифу (и скидочному промокоду, если он активирован).
create or replace function public.request_payment(p_plan text, p_promo text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare pr jsonb; amt int; m int; pct int := 0; uid uuid := auth.uid(); pid bigint;
begin
  if uid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  select value->p_plan into pr from public.settings where key = 'prices';
  if pr is null then return jsonb_build_object('ok', false, 'error', 'plan'); end if;
  amt := (pr->>'amount')::int; m := (pr->>'months')::int;
  if p_promo is not null then
    select coalesce(percent, 0) into pct from public.promo_codes
      where code = upper(trim(p_promo)) and kind = 'discount' and (expires_at is null or expires_at > now()) and (max_uses is null or used < max_uses);
    pct := coalesce(pct, 0);
  end if;
  amt := round(amt * (100 - pct) / 100.0);
  -- Та же неоплаченная заявка уже есть — возвращаем её, а не создаём новую.
  select id into pid from public.payments
    where user_id = uid and status = 'pending' and plan = p_plan and amount = amt and paid_at is null
    order by id desc limit 1;
  if pid is not null then
    return jsonb_build_object('ok', true, 'id', pid, 'code', 'ZRD-' || (1000 + pid), 'amount', amt, 'months', m, 'plan', p_plan);
  end if;
  if (select count(*) from public.payments where user_id = uid and status = 'pending') >= 5 then
    return jsonb_build_object('ok', false, 'error', 'too_many');
  end if;
  insert into public.payments (user_id, plan, months, amount, promo) values (uid, p_plan, m, amt, case when pct > 0 then upper(trim(p_promo)) end) returning id into pid;
  insert into public.activity (user_id, kind, info) values (uid, 'pay', jsonb_build_object('plan', p_plan, 'amount', amt, 'code', 'ZRD-' || (1000 + pid)));
  return jsonb_build_object('ok', true, 'id', pid, 'code', 'ZRD-' || (1000 + pid), 'amount', amt, 'months', m, 'plan', p_plan);
end $$;

-- «Төледім / Я оплатил»: пользователь сообщает, от кого пришёл перевод. Только своя заявка и только пока она на проверке.
-- (старая версия без комментария — удаляем, чтобы не было двух функций с одним именем)
drop function if exists public.mark_paid(bigint, text, text);
create or replace function public.mark_paid(p_id bigint, p_name text, p_phone4 text, p_comment text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); pay public.payments; nm text := left(btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g')), 60);
begin
  if uid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  select * into pay from public.payments where id = p_id and user_id = uid for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if pay.status <> 'pending' then return jsonb_build_object('ok', false, 'error', 'state'); end if;
  if nm = '' then return jsonb_build_object('ok', false, 'error', 'payer_name'); end if;
  if coalesce(p_phone4, '') !~ '^[0-9]{4}$' then return jsonb_build_object('ok', false, 'error', 'payer_phone4'); end if;
  update public.payments set payer_name = nm, payer_phone4 = p_phone4, payer_comment = nullif(left(btrim(coalesce(p_comment, '')), 200), ''), paid_at = now() where id = p_id;
  insert into public.activity (user_id, kind, info) values (uid, 'pay', jsonb_build_object('act', 'paid', 'code', 'ZRD-' || (1000 + p_id), 'amount', pay.amount));
  return jsonb_build_object('ok', true);
end $$;

-- Админ подтверждает или отклоняет оплату.
create or replace function public.decide_payment(p_id bigint, p_ok boolean, p_note text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare pay public.payments; base timestamptz;
begin
  if not public.is_admin() then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  select * into pay from public.payments where id = p_id for update;
  if not found or pay.status <> 'pending' then return jsonb_build_object('ok', false, 'error', 'state'); end if;
  update public.payments set status = case when p_ok then 'approved' else 'rejected' end, note = left(p_note, 200), decided_at = now(), decided_by = auth.uid() where id = p_id;
  insert into public.activity (user_id, kind, info) values (auth.uid(), 'admin', jsonb_build_object('act', case when p_ok then 'approve' else 'reject' end, 'payment', p_id, 'user', pay.user_id));
  if p_ok then
    select greatest(coalesce(sub_until, now()), now()) into base from public.profiles where id = pay.user_id;
    update public.profiles set sub_until = base + make_interval(months => pay.months) where id = pay.user_id;
  end if;
  return jsonb_build_object('ok', true);
end $$;

-- Админ вручную даёт доступ (например, близким) на N дней.
create or replace function public.grant_access(p_user uuid, p_days int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare base timestamptz;
begin
  if not public.is_admin() then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  select greatest(coalesce(sub_until, now()), now()) into base from public.profiles where id = p_user;
  update public.profiles set sub_until = base + make_interval(days => p_days) where id = p_user;
  insert into public.activity (user_id, kind, info) values (auth.uid(), 'admin', jsonb_build_object('act', 'grant', 'user', p_user, 'days', p_days));
  return jsonb_build_object('ok', true);
end $$;

-- Родитель привязывает ребёнка по коду.
create or replace function public.link_child(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare child uuid; uid uuid := auth.uid();
begin
  if uid is null or not exists (select 1 from public.profiles where id = uid and role in ('parent', 'admin')) then
    return jsonb_build_object('ok', false, 'error', 'role'); end if;
  select id into child from public.profiles where child_code = upper(trim(p_code)) and role = 'student';
  if child is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  insert into public.parent_links (parent_id, child_id) values (uid, child) on conflict do nothing;
  return jsonb_build_object('ok', true, 'child', child);
end $$;

-- Баллы: сервер ограничивает сумму за одно действие и за день; повтор того же действия не засчитывается.
create or replace function public.add_points(p_kind text, p_ref text, p_amount int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare cap int; today_sum int; uid uuid := auth.uid(); amt int;
begin
  if uid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  cap := case p_kind when 'hw' then 100 when 'quick' then 20 when 'review' then 30 when 'mock' then 150 when 'test' then 50
                     when 'diag' then 50 when 'day' then 30 when 'cards' then 20 when 'game' then 30 else 0 end;
  amt := least(greatest(p_amount, 0), cap);
  select coalesce(sum(amount), 0) into today_sum from public.points where user_id = uid and at >= date_trunc('day', now());
  amt := least(amt, greatest(0, 500 - today_sum));
  if amt <= 0 then return jsonb_build_object('ok', true, 'amount', 0); end if;
  insert into public.points (user_id, kind, ref, amount) values (uid, p_kind, left(p_ref, 120), amt) on conflict do nothing;
  return jsonb_build_object('ok', true, 'amount', amt);
end $$;

-- Рейтинг месяца: только имя, школа и сумма баллов (без почты и других данных).
create or replace function public.leaderboard(p_month date default date_trunc('month', now())::date, p_school text default null)
returns table (user_id uuid, name text, school text, points bigint, is_me boolean)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.school, sum(pt.amount) as points, p.id = auth.uid()
  from public.points pt join public.profiles p on p.id = pt.user_id
  where pt.at >= p_month and pt.at < (p_month + interval '1 month') and p.role = 'student'
    and (p_school is null or p.school = p_school)
  group by p.id, p.name, p.school
  order by points desc
  limit 100;
$$;

-- Журнал: только разрешённые виды, не больше 400 записей в день, маленький размер, без чужого user_id.
create or replace function public.log_activity(p_kind text, p_info jsonb default '{}') returns boolean
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then return false; end if;
  if p_kind not in ('login', 'visit', 'hw', 'quick', 'review', 'mock', 'test', 'diag', 'cards', 'game', 'lesson', 'pay') then return false; end if;
  if length(coalesce(p_info, '{}')::text) > 1000 then p_info := '{}'; end if;
  select count(*) into n from public.activity where user_id = uid and at >= date_trunc('day', now());
  if n >= 400 then return false; end if;
  insert into public.activity (user_id, kind, info) values (uid, p_kind, coalesce(p_info, '{}'));
  update public.profiles set last_seen = now() where id = uid;
  return true;
end $$;

-- «Был на сайте»: обновляем last_seen; первое посещение за день попадает в журнал.
create or replace function public.touch_seen() returns boolean
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); prev timestamptz;
begin
  if uid is null then return false; end if;
  select last_seen into prev from public.profiles where id = uid;
  if prev is null or prev < date_trunc('day', now()) then
    insert into public.activity (user_id, kind, info) values (uid, 'visit', '{}');
  end if;
  update public.profiles set last_seen = now() where id = uid;
  return true;
end $$;

-- Админ-промокод — самый опасный: по умолчанию одноразовый и на 7 дней.
create or replace function public.guard_admin_promo() returns trigger
language plpgsql as $$
begin
  if new.kind = 'admin' then
    new.max_uses := coalesce(new.max_uses, 1);
    new.expires_at := coalesce(new.expires_at, now() + interval '7 days');
  end if;
  return new;
end $$;
drop trigger if exists guard_admin_promo on public.promo_codes;
create trigger guard_admin_promo before insert on public.promo_codes for each row execute function public.guard_admin_promo();

-- Заполнить почту у тех, кто зарегистрировался до появления колонки.
update public.profiles p set email = lower(u.email) from auth.users u where u.id = p.id and p.email is null;

grant execute on function public.log_activity, public.touch_seen to authenticated;
grant execute on function public.redeem_promo, public.request_payment, public.decide_payment, public.grant_access,
  public.link_child, public.add_points, public.leaderboard, public.mark_paid, public.is_admin to authenticated;
-- Гостям (не вошедшим) серверные действия не нужны: юридические страницы и тарифы читают только settings.
revoke execute on function public.mark_paid from anon, public;
