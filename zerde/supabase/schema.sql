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
  school text check (school in ('BIL', 'RFMSH', 'NIS')),
  grade int,
  child_code text unique,                 -- код ребёнка: родитель вводит его, чтобы видеть результаты
  sub_until timestamptz,                  -- оплачено до
  trial_until timestamptz,                -- пробный период до
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);
insert into public.settings (key, value) values
  ('prices', '{"m1": {"months": 1, "amount": 30000}, "m3": {"months": 3, "amount": 75000}, "m6": {"months": 6, "amount": 120000}}'),
  ('trial_days', '3'),
  ('kaspi', '{"phone": "", "name": ""}'),
  ('prizes', '{"kk": "", "ru": ""}')
on conflict (key) do nothing;

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
  insert into public.profiles (id, role, name, school, grade, child_code, trial_until)
  values (new.id, r, coalesce(new.raw_user_meta_data->>'name', ''),
          nullif(new.raw_user_meta_data->>'school', ''), nullif(new.raw_user_meta_data->>'grade', '')::int,
          upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6)),
          case when r = 'student' then now() + make_interval(days => days) end)
  on conflict (id) do nothing;
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
  insert into public.payments (user_id, plan, months, amount, promo) values (uid, p_plan, m, amt, case when pct > 0 then upper(trim(p_promo)) end) returning id into pid;
  return jsonb_build_object('ok', true, 'id', pid, 'amount', amt, 'months', m);
end $$;

-- Админ подтверждает или отклоняет оплату.
create or replace function public.decide_payment(p_id bigint, p_ok boolean, p_note text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare pay public.payments; base timestamptz;
begin
  if not public.is_admin() then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  select * into pay from public.payments where id = p_id for update;
  if not found or pay.status <> 'pending' then return jsonb_build_object('ok', false, 'error', 'state'); end if;
  update public.payments set status = case when p_ok then 'approved' else 'rejected' end, note = p_note, decided_at = now(), decided_by = auth.uid() where id = p_id;
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

grant execute on function public.redeem_promo, public.request_payment, public.decide_payment, public.grant_access,
  public.link_child, public.add_points, public.leaderboard to authenticated;
