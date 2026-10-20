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

  Z.blueprints = Z.blueprints || {};

  // БИЛ 2023 (онлайн сынақ, нұсқа 2001): 50 задач «математика және логика» по возрастанию трудности.
  Z.blueprints.BIL_2023 = { year: 2023, slots: [
    S('m_order', 1, 'bil.compare_expr'), S('m_order', 1, null, ['m_neg']), S('m_frac', 2, 'bil.frac_between'), S('l_seq', 1, 'bil.odd_word'),
    S('l_seq', 1), S('l_seq', 1), S('l_visual', 2), S('m_ratio', 2),
    S('m_frac', 1, null, ['m_dec']), S('m_word', 2), S('m_time', 1), S('m_order', 2, 'bil.subst'),
    S('l_puzzles', 1), S('m_ratio', 1), S('l_visual', 2, 'bil.top_view'), S('m_geom', 1, 'bil.ruler'),
    S('m_time', 1, 'bil.units_chain'), S('l_seq', 2, 'bil.figurate'), S('m_divis', 1), S('l_count', 2, 'bil.prob_letter'),
    S('m_ratio', 1), S('m_frac', 2, 'bil.cancel_product'), S('m_order', 2, 'bil.subst'), S('l_seq', 2, null, ['l_fig']),
    S('m_volume', 1), S('l_op', 2, 'bil.think_number'), S('l_seq', 2, 'ktl.ap_sum'), S('m_divis', 2, 'ktl.fact_zeros'),
    S('l_visual', 3, 'bil.net_remove'), S('m_percent', 2, 'bil.pie_table'), S('m_geom', 2, 'bil.grid_areas'), S('m_frac', 1, null, ['m_dec', 'm_order']),
    S('l_cal', 3, 'bil.clock_hands'), S('m_angles', 3, 'bil.fold'), S('l_count', 3, 'bil.beads'), S('m_geom', 2, 'bil.l_shape'),
    S('l_visual', 3, 'bil.slab_holes'), S('m_order', 2, 'bil.alt_sum'), S('l_seq', 2, 'bil.odd_squares'), S('m_volume', 3, 'bil.box_paint'),
    S('m_ratio', 2, null, ['m_percent']), S('l_visual', 3), S('m_word', 2, null, ['m_setup']), S('l_fig', 3, 'bil.table_rule'),
    S('m_time', 3, 'bil.units_chain'), S('l_op', 2, 'bil.triangle_op'), S('l_fig', 2, 'ktl.pyramid'), S('l_visual', 3),
    S('l_digits', 3, 'ktl.last_digit'), S('l_visual', 4)
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

  // Форматы «Практики»: по одному на каждый год-образец. Скрыты из обычного списка тестов.
  function practiceFormat(year) {
    return { id: 'BIL_P' + year, school: 'BIL', practice: true, full: true, year: year, minutes: 110,
      kk: 'БИЛ ' + year + ' үлгісі', ru: 'По образцу БИЛ ' + year,
      sections: [{ kk: 'Математика және логика', ru: 'Математика и логика', kinds: ['math', 'logic'], blueprint: 'BIL_' + year, count: Z.blueprints['BIL_' + year].slots.length, harder: 0.25 },
                 { kk: 'Оқу сауаттылығы', ru: 'Грамотность чтения', kinds: ['reading'], count: 10 }],
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
