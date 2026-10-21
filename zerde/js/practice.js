/* Зерде — «Практика»: серия пробных вариантов по образцу настоящих экзаменов.
 * Схема (blueprint) повторяет оригинал задача в задачу: № k варианта — та же тема, уровень и тип,
 * что № k экзамена, но с новыми числами и рисунками. Каждый вариант немного труднее оригинала:
 * часть слотов поднимается на уровень, часть получает соседний тип (alt).
 * Разборы оригиналов: materials/BIL_OFFICIAL_ANALYSIS.md.
 * Слот: { t: тема, l: уровень 1–4, f: id формата (необязательно), alt: [соседние темы] }. */
(function (root) {
  'use strict';
  var Z = root.Z;
  function S(t, l, f, alt) { var o = { t: t, l: l }; if (f) o.f = f; if (alt) o.alt = alt; return o; }
  function P(t, l, f) { var o = S(t, l, f); o.same = true; return o; }   // вторая задача общего условия

  Z.blueprints = Z.blueprints || {};

  // БИЛ 2023 (онлайн сынақ, нұсқа 2001): 50 задач «математика және логика» по возрастанию трудности.
  Z.blueprints.BIL_2023 = { year: 2023, slots: [
    S('m_order', 1, 'bil.compare_expr'), S('m_order', 1, null, ['m_neg']), S('m_frac', 2, 'bil.frac_between'), S('l_seq', 1, 'bil.odd_word'),
    S('l_seq', 1), S('l_seq', 1), S('l_visual', 2, 'vis.odd'), S('m_ratio', 2),
    S('m_frac', 1, null, ['m_dec']), S('m_word', 2), S('m_time', 1), S('m_order', 2, 'bil.subst'),
    S('l_puzzles', 1), S('m_ratio', 1), S('l_visual', 2, 'bil.top_view'), S('m_geom', 1, 'bil.ruler'),
    S('m_time', 2, 'bil.units_chain'), S('l_seq', 2, 'bil.figurate'), S('m_divis', 1), S('l_count', 2, 'bil.prob_letter'),
    S('m_ratio', 1), S('m_frac', 2, 'bil.cancel_product'), S('m_order', 2, 'bil.subst'), S('l_seq', 2, null, ['l_fig']),
    S('m_volume', 1), S('l_op', 2, 'bil.think_number'), S('l_seq', 2, 'ktl.ap_sum'), S('m_divis', 2, 'ktl.fact_zeros'),
    S('l_visual', 3, 'bil.net_remove'), S('m_percent', 2, 'bil.pie_table'), S('m_geom', 2, 'bil.grid_areas'), S('m_frac', 1, null, ['m_dec', 'm_order']),
    S('l_cal', 3, 'bil.clock_hands'), S('m_angles', 3, 'bil.fold'), S('l_count', 3, 'bil.beads'), S('m_geom', 2, 'bil.l_shape'),
    S('m_volume', 3, 'bil.slab_holes'), S('m_order', 2, 'bil.alt_sum'), S('l_seq', 2, 'bil.odd_squares'), S('m_volume', 3, 'bil.box_paint'),
    S('m_ratio', 2, null, ['m_percent']), S('l_visual', 3, 'vis.odd'), S('m_word', 2, null, ['m_setup']), S('l_fig', 3, 'bil.table_rule'),
    S('m_time', 3, 'bil.units_chain'), S('l_op', 2, 'bil.triangle_op'), S('l_fig', 2, 'ktl.pyramid'), S('l_visual', 3, 'vis.squares'),
    S('l_digits', 3, 'ktl.last_digit'), S('l_visual', 4, 'vis.overlay')
  ] };

  // БИЛ 2024 (онлайн сынақ): сложность ровная (2,0–2,4 по десяткам), больше алгебры и геометрии
  // с окружностями при π = 3; появились пары задач с общим условием (9–10, 14–15, 25–26, 31–32).
  Z.blueprints.BIL_2024 = { year: 2024, slots: [
    S('l_visual', 2, 'vis.squares'), S('m_eq', 2, 'b24.frac_eq'), S('l_visual', 2, 'vis.odd'), S('l_op', 2, 'b24.digit_ops'),
    S('m_frac', 2, 'b24.shaded_part'), S('l_visual', 2, 'b24.rotate_sectors'), S('m_frac', 1, 'b24.frac_chain'), S('m_time', 2, 'bil.units_chain'),
    S('m_ratio', 3, 'b24.bolts1'), P('m_ratio', 3, 'b24.bolts2'), S('m_eq', 2, 'b24.ineq_frac'), S('l_op', 2, 'b24.student_error'),
    S('m_divis', 1, 'b24.multiples_between'), S('m_eq', 3, 'b24.towers1'), P('m_volume', 3, 'b24.towers2'), S('l_visual', 3, 'b24.painted_shape'),
    S('l_op', 2, 'b24.symbol_ops'), S('l_count', 3, 'b24.pattern_string'), S('m_frac', 3, 'b24.sticks'), S('m_motion', 2, 'b24.catch_up'),
    S('m_eq', 3, 'ktl.cont_frac'), S('m_percent', 2, 'b24.hist_pie'), S('m_frac', 2, 'b24.complex_frac'), S('m_geom', 2, 'b24.park_path'),
    S('m_geom', 3, 'b24.quarter_rows1'), P('m_geom', 4, 'b24.quarter_rows2'), S('m_frac', 2, 'b24.mixed_numbers'), S('m_geom', 2, 'b24.tri_squares'),
    S('m_percent', 1, 'b24.percent_simple'), S('m_divis', 3, 'b24.ab_bc_sum'), S('m_word', 2, 'b24.files1'), P('m_word', 2, 'b24.promo'),
    S('m_geom', 2, 'b24.tri_area_grid'), S('l_visual', 2, 'b24.not_net'), S('m_frac', 2, 'b24.two_storey_sum'), S('m_geom', 1, 'b24.cross_perimeter'),
    S('m_geom', 3, 'b24.corner_square'), S('m_geom', 3, 'b24.semicircle_chain'), S('m_divis', 2, 'b24.consec_odd'), S('m_eq', 2, 'b24.lin_ineq'),
    S('m_abs', 3, 'b24.abs_int_count'), S('m_abs', 2, 'b24.abs_eq_dec'), S('m_frac', 1, 'b24.quarter_shaded'), S('l_op', 2, 'b24.place_digits'),
    S('m_dec', 1, 'b24.numray'), S('m_ratio', 2, 'b24.fruit_prices'), S('l_visual', 3, 'b24.dice_rotate'), S('m_volume', 3, 'b24.box_on_side'),
    S('l_digits', 2, 'b24.rebus_add'), S('l_visual', 3, 'b24.vessels')
  ] };

  // БИЛ 2025 (онлайн сынақ, нұсқа 20251001): трудные задачи в середине («горб» 1,9 → 2,8 → 1,8),
  // в конце — короткая школьная алгебра и статистика 6 класса.
  Z.blueprints.BIL_2025 = { year: 2025, slots: [
    S('m_eq', 2, 'b25.ratio_expr'), S('m_frac', 1, 'b25.express_var'), S('l_digits', 2, 'b25.same_digit_rebus'), S('m_time', 2, 'b25.pill_schedule'),
    S('m_dec', 1, 'b25.frac_sum_dec'), S('m_geom', 3, 'b25.perimeter_cutouts'), S('l_count', 2, 'b25.graph_roads'), S('m_divis', 2, 'b25.prod_max_sum'),
    S('m_order', 2, 'b25.fix_by_one'), S('m_percent', 2, 'b25.pie_diff'), S('l_cal', 3, 'b25.clock_digits_perm'), S('m_eq', 2, 'b25.x_frac_self'),
    S('m_geom', 4, 'b25.arcs_perimeter'), S('l_digits', 2, 'ktl.last_digit'), S('l_digits', 3, 'b25.rebus_mult'), S('m_word', 3, 'b25.bottle'),
    S('m_percent', 2, 'b25.price_drop_count'), S('l_visual', 3, 'b25.cube_color'), S('m_dec', 1, 'b25.dec_brackets'), S('m_avg', 3, 'b25.mode_mean'),
    S('m_word', 3, 'b25.nested_carts'), S('l_digits', 3, 'ktl.pages'), S('m_volume', 2, 'b25.cube_area_vol'), S('l_op', 3, 'b25.op_statements'),
    S('l_count', 3, 'b25.sets3'), S('m_word', 2, 'b25.periodic_days'), S('m_volume', 4, 'b25.stair_paint'), S('m_frac', 3, 'b25.numline_ticks'),
    S('m_work', 2, 'b25.pipes_one'), S('m_geom', 3, 'b25.cut_square_perims'), S('m_ratio', 1, 'b25.stairs'), S('l_fig', 2, 'b25.strip_sums'),
    S('l_balance', 3, 'b25.mobile'), S('m_motion', 2, 'b25.walkers_meet'), S('m_geom', 2, 'b25.chain_squares'), S('m_eq', 3, 'ktl.cont_frac'),
    S('m_eq', 2, 'b25.ineq_system'), S('m_abs', 2, 'b25.abs_ineq'), S('l_count', 2, 'b25.books_adjacent'), S('m_work', 2, 'b25.work_hm'),
    S('m_gcdlcm', 2, 'b25.gcd_lcm_interval'), S('m_gcdlcm', 2, 'b25.pool_dates'), S('l_visual', 3, 'b25.solid_complete'), S('m_eq', 1, 'b25.lin_frac_eq'),
    S('m_eq', 1, 'b25.word_ineq'), S('m_avg', 2, 'b25.stats_table'), S('m_avg', 2, 'b25.weather_mean'), S('m_geom', 1, 'b25.point_shift'),
    S('l_op', 1, 'b25.op_eval'), S('l_visual', 3, 'b25.card_flip')
  ] };

  /* Тексты для чтения в «Практике» идут по кругу по номеру варианта: соседние варианты не повторяют
   * друг друга, а пара текстов каждый раз новая (банк — тексты уровней 2–4). */
  function pickTexts(seed, np) {
    var list = Z.bank.reading.filter(function (p) { return p.lvl >= 2; }).sort(function (a, b) { return a.lvl - b.lvl || (a.id < b.id ? -1 : 1); });
    var n = Math.max(1, Math.round((seed - 70000) / 131)), out = [];
    for (var k = 0; k < np; k++) out.push(list[((n - 1) * np + k) % list.length].id);
    return out;
  }

  // Форматы «Практики»: по одному на каждый год-образец. Скрыты из обычного списка тестов.
  function practiceFormat(year) {
    return { id: 'BIL_P' + year, school: 'BIL', practice: true, full: true, year: year, minutes: 110,
      kk: 'БИЛ ' + year + ' үлгісі', ru: 'По образцу БИЛ ' + year,
      sections: [{ kk: 'Математика және логика', ru: 'Математика и логика', kinds: ['math', 'logic'], blueprint: 'BIL_' + year, count: Z.blueprints['BIL_' + year].slots.length, harder: 0.25 },
                 { kk: 'Оқу сауаттылығы', ru: 'Грамотность чтения', kinds: ['reading'], count: 10, pick: pickTexts }],
      answer: 'mc', options: 4, scoring: { correct: 4, wrong: -1, skip: 0 } };
  }

  /* Серия вариантов: № n → год-образец по кругу и свой seed. Один и тот же № всегда даёт
   * один и тот же вариант (можно сравнить результат с друзьями и пересдать). */
  Z.practice = {
    count: 30,
    years: function () { return Object.keys(Z.blueprints).filter(function (k) { return /^BIL_\d+$/.test(k); }).map(function (k) { return Z.blueprints[k].year; }).sort(); },
    test: function (n) {
      var ys = Z.practice.years(), year = ys[(n - 1) % ys.length];
      return { n: n, format: 'BIL_P' + year, year: year, seed: 70000 + n * 131 };
    },
    register: function () { Z.practice.years().forEach(function (y) { Z.examFormats['BIL_P' + y] = practiceFormat(y); }); }
  };
  if (Z.examFormats) Z.practice.register();
})(typeof window !== 'undefined' ? window : globalThis);
