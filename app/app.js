/* My Beanie v0.5 — 콩팥 건강 일지 / Kidney Health Journal (PWA, ko/en)
   mode: general (default, everyone) · hd / pd = optional dialysis add-on (Settings)
   data: S = { profile:{name,year,sex,visit,mode,dry,fluidGoal,goals:{hiK,hiP,hiNa},meds:[{id,name}]}, entries:[...], dx:[...] }
   entry: { id,date,ts, cr,k,p,sbp,dbp,wt, sym:[], meals:{breakfast|lunch|dinner|snack:{text,tags:[],caution:[],photo}}, fluid, meds:{id:true}, note, egfr }
   dx (hd): { id,date,ts, pre,post,gain, sym:[], acc:[], note }   dx (pd): { id,date,ts, ex,uf,wt, sym:[], acc:[], note } */
(() => {
  const DEMO = /[?&]demo/.test(location.search);
  const DEMO_HD = /demo=hd/.test(location.search);
  const DEMO_PRE = /demo=pre/.test(location.search);
  const KEY = DEMO ? (DEMO_HD ? 'mybeanie.demo.hd' : DEMO_PRE ? 'mybeanie.demo.pre' : 'mybeanie.demo') : 'mybeanie.v1';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const today = () => new Date().toISOString().slice(0, 10);
  const fmt = d => d.replace(/-/g, '.').slice(2);
  const r1 = n => Math.round(n * 10) / 10;
  const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'], CAUT = ['hiK', 'hiP', 'hiNa'], FOODS = ['eatout', 'delivery', 'soup', 'fruit', 'nuts', 'dairy', 'processed', 'alcohol'];
  const symName = k => (t('sym')[k] || k), foodName = k => (t('foods')[k] || t('caution')[k] || k), cautName = k => (t('caution')[k] || k);
  const isDx = () => S.profile && (S.profile.mode === 'hd' || S.profile.mode === 'pd');
  const showFluid = () => !!S.profile;

  // ---------- state ----------
  let S = load();
  function load() {
    try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && j.entries) return j; } catch (e) {}
    if (DEMO_PRE) return demoPre();
    if (DEMO) return demoData();
    return { profile: null, entries: [], dx: [] };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast(t('storage_err')); } }
  const SYM_LEGACY = { '붓기': 'swelling', '피로': 'fatigue', '가려움': 'itching', '식욕저하': 'appetite', '숨참': 'breath', '두통': 'headache', '거품뇨': 'foamy', '야간뇨': 'nocturia', '잠 설침': 'sleep' };
  function migrate() {
    if (!S.dx) S.dx = [];
    if (S.profile) { if (!['hd', 'pd'].includes(S.profile.mode)) S.profile.mode = 'general'; S.profile.goals ||= {}; S.profile.meds ||= []; }
    (S.entries || []).forEach(e => {
      e.sym = (e.sym || []).map(x => SYM_LEGACY[x] || x);
      if (e.food && !e.meals) { e.meals = { lunch: { text: e.food.text || '', tags: e.food.tags || [], caution: [], photo: e.food.photo || null } }; delete e.food; }
      e.meals ||= {}; e.meds ||= {};
    });
  }
  migrate(); if (S.profile) save();

  // prevention persona: 40s office worker, first caution at a health checkup (no CKD diagnosis)
  function demoPre() {
    const T = new Date(), d = n => { const x = new Date(T); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
    const v = new Date(T); v.setDate(v.getDate() + 5);
    const en = LANG === 'en';
    const M = (text, tags = [], caution = []) => ({ text, tags, caution, photo: null });
    const rows = [
      [88, 1.02, 139, 89, 78.4, ['sleep'], en ? 'Checkup said my blood pressure is high — recheck in 3 months' : '검진에서 혈압이 높다고 3개월 뒤 재검 권유받았어요', { lunch: M(en ? 'Jjamppong at work' : '회사 앞 짬뽕', ['eatout', 'soup'], ['hiNa']), dinner: M(en ? 'Team dinner, samgyeopsal' : '회식 삼겹살·소주', ['eatout', 'alcohol'], ['hiNa']) }, 4],
      [80, null, 138, 88, 78.1, ['fatigue'], '', { lunch: M(en ? 'Ramen and gimbap' : '라면·김밥', ['eatout', 'processed'], ['hiNa']), dinner: M(en ? 'Late-night chicken delivery' : '야식 치킨 배달', ['delivery', 'processed'], ['hiNa', 'hiP']) }, 4],
      [72, null, 137, 87, 77.9, [], '', { lunch: M(en ? 'Kimchi stew' : '김치찌개', ['eatout', 'soup'], ['hiNa']), dinner: M(en ? 'Beer at home' : '집에서 맥주', ['alcohol'], []) }, 5],
      [63, null, 135, 86, 77.6, ['foamy'], en ? 'Sometimes I see foam in my urine — worth asking?' : '소변에 거품이 가끔 보여요. 물어봐도 될까요?', { lunch: M(en ? 'Salad bowl' : '샐러드 도시락', [], []), dinner: M(en ? 'Tteokbokki delivery' : '떡볶이 배달', ['delivery'], ['hiNa']) }, 5],
      [52, null, 133, 85, 77.3, [], en ? 'Started skipping soup broth at lunch' : '점심에 국물은 남기기 시작했어요', { lunch: M(en ? 'Soybean stew, left the broth' : '된장찌개(국물 남김)', ['eatout', 'soup'], []), snack: M(en ? 'Nuts' : '견과류', ['nuts'], []) }, 6],
      [41, null, 131, 84, 77.0, [], '', { breakfast: M(en ? 'Yogurt, fruit' : '요거트·과일', ['dairy', 'fruit'], []), dinner: M(en ? 'Home-cooked rice and fish' : '집밥 생선구이', [], []) }, 6],
      [30, null, 130, 83, 76.8, ['sleep'], en ? 'Week 3 of no late-night snacks' : '야식 끊은 지 3주째', { lunch: M(en ? 'Bibimbap' : '비빔밥', ['eatout'], []), dinner: M(en ? 'Team dinner, one drink only' : '회식 — 한 잔만', ['eatout', 'alcohol'], ['hiNa']) }, 7],
      [19, null, 128, 82, 76.5, [], '', { lunch: M(en ? 'Brought lunch from home' : '도시락 싸옴', [], []), snack: M(en ? 'Apple' : '사과', ['fruit'], []) }, 7],
      [9, null, 127, 81, 76.3, [], en ? 'Home BP is lower in the morning — should I bring the log?' : '아침 혈압이 더 낮게 나와요. 기록 가져가면 될까요?', { lunch: M(en ? 'Noodles out' : '칼국수', ['eatout', 'soup'], ['hiNa']), dinner: M(en ? 'Grilled chicken, vegetables' : '닭가슴살·채소', [], []) }, 8],
      [2, null, 126, 80, 76.2, [], en ? 'Eating out 3 times a week now, down from 9' : '외식이 주 9번에서 3번으로 줄었어요', { breakfast: M(en ? 'Egg, toast' : '계란·토스트', [], []), dinner: M(en ? 'Home-cooked, low salt' : '집밥(싱겁게)', [], []) }, 8],
    ];
    const entries = rows.map(([n, cr, sbp, dbp, wt, sym, note, meals, fluid], i) => ({ id: 'pre' + i, date: d(n), ts: i, cr, k: null, p: null, sbp, dbp, wt, sym, note, meals, fluid, meds: {}, egfr: cr ? egfr(cr, 46, 'M') : null }));
    const profile = { name: en ? 'Minjun' : '민준', year: T.getFullYear() - 46, sex: 'M', visit: v.toISOString().slice(0, 10), mode: 'general', fluidGoal: 8, goals: { hiNa: 1 }, meds: [] };
    return { profile, entries, dx: [] };
  }

  // ---------- eGFR: CKD-EPI 2021 (race-free) ----------
  function egfr(cr, age, sex) {
    if (!cr || !age) return null;
    const f = sex === 'F', k = f ? 0.7 : 0.9, a = f ? -0.241 : -0.302, ratio = cr / k;
    return Math.round(142 * Math.pow(Math.min(ratio, 1), a) * Math.pow(Math.max(ratio, 1), -1.2) * Math.pow(0.9938, age) * (f ? 1.012 : 1));
  }
  const age = () => S.profile ? new Date().getFullYear() - S.profile.year : null;
  const stage = g => g >= 90 ? 'G1' : g >= 60 ? 'G2' : g >= 45 ? 'G3a' : g >= 30 ? 'G3b' : g >= 15 ? 'G4' : 'G5';

  // ---------- demo ----------
  function demoData() {
    const T = new Date(), d = n => { const x = new Date(T); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
    const v = new Date(T); v.setDate(v.getDate() + 3);
    const hd = DEMO_HD;
    const en = LANG === 'en';
    const M = (text, tags = [], caution = []) => ({ text, tags, caution, photo: null });
    const rows = [
      [92, 1.34, 5.1, 3.9, 142, 89, 63.4, ['fatigue'], '', { dinner: M(en ? 'Dinner out with friends' : '저녁 친구들과 외식', ['eatout', 'alcohol'], ['hiNa']) }],
      [80, null, null, null, 138, 86, 63.1, ['fatigue', 'nocturia'], '', { lunch: M(en ? 'Fried chicken delivery' : '치킨 배달', ['delivery', 'processed'], ['hiNa', 'hiP']) }],
      [68, null, null, null, 135, 84, 62.9, [], en ? 'Some days I feel dizzy after taking my pills' : '약 먹고 나서 어지러운 날이 있어요', { breakfast: M(en ? 'Oatmeal, banana' : '오트밀, 바나나', ['fruit'], ['hiK']) }],
      [56, 1.29, 4.7, 3.7, 133, 82, 62.6, ['swelling'], en ? 'My ankles swell every evening — is that okay?' : '저녁마다 발목이 붓는데 괜찮은가요?', { dinner: M(en ? 'Kimchi stew' : '김치찌개', ['soup'], ['hiNa']) }],
      [44, null, null, null, 131, 81, 62.5, ['swelling', 'nocturia'], '', { lunch: M(en ? 'Lunch out' : '점심 외식', ['eatout'], ['hiNa']), dinner: M(en ? 'Soybean soup at home' : '집에서 된장국', ['soup'], []) }],
      [30, null, null, null, 129, 80, 62.3, [], '', { snack: M(en ? 'Apple' : '사과', ['fruit'], []) }],
      [18, 1.22, 4.4, 3.6, 128, 79, 62.1, [], en ? 'Is my protein intake about right?' : '단백질 섭취량이 적당한지 궁금해요', { breakfast: M(en ? 'Rice, egg roll' : '밥, 계란말이') }],
      [9, null, null, null, 127, 78, 62.0, ['fatigue'], '', { snack: M(en ? 'Yogurt' : '요거트', ['dairy'], ['hiP']) }],
      [2, null, null, null, 126, 78, 61.9, [], en ? 'Less eating out seems to mean less swelling' : '외식을 줄였더니 붓기가 덜한 것 같아요', { dinner: M(en ? 'Grilled fish, vegetables' : '생선구이, 나물') }],
    ];
    const entries = rows.map(([n, cr, k, p, sbp, dbp, wt, sym, note, meals], i) => ({ id: 'demo' + i, date: d(n), ts: i, cr, k, p, sbp, dbp, wt, sym, note, meals, fluid: hd ? 4 + (i % 3) : null, meds: {}, egfr: cr ? egfr(cr, 61, 'F') : null }));
    const profile = hd
      ? { name: t('demo_name_hd'), year: T.getFullYear() - 66, sex: 'M', visit: v.toISOString().slice(0, 10), mode: 'hd', dry: 62.0, fluidGoal: 5, goals: { hiK: 1, hiP: 1, hiNa: 2 }, meds: [{ id: 'm1', name: en ? 'Phosphate binder' : '인결합제' }, { id: 'm2', name: en ? 'BP medication' : '혈압약' }] }
      : { name: t('demo_name'), year: T.getFullYear() - 61, sex: 'F', visit: v.toISOString().slice(0, 10), mode: 'general', goals: { hiNa: 2 }, meds: [] };
    const dx = hd ? [[27, 64.3, 62.1, ['cramp'], []], [25, 63.9, 62.0, [], []], [22, 64.6, 62.2, ['lowbp', 'dizzy'], []], [20, 63.8, 62.0, [], []], [18, 64.1, 62.1, [], ['swelling']], [15, 64.9, 62.3, ['cramp'], []], [13, 63.7, 61.9, [], []], [11, 64.2, 62.0, [], []], [8, 64.0, 62.0, [], []], [6, 64.4, 62.1, ['tired'], []], [4, 63.9, 62.0, [], []], [1, 64.7, 62.2, ['cramp', 'lowbp'], []]]
      .map(([n, pre, post, sym, acc], i, arr) => ({ id: 'dx' + i, date: d(n), ts: i, pre, post, gain: i ? r1(pre - arr[i - 1][2]) : null, sym, acc, note: '' })) : [];
    if (hd) entries.forEach(e => { e.meds = { m1: true, m2: true }; });
    return { profile, entries, dx };
  }

  // ---------- nav ----------
  function go(v) {
    $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
    $$('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.go === v));
    $('#tabbar').classList.toggle('hidden', v === 'onboard');
    $('#tabbar').classList.toggle('dx', !!isDx());
    window.scrollTo(0, 0);
    ({ home: renderHome, log: renderLog, dx: renderDx, trend: renderTrend, report: renderReport, settings: renderSettings }[v] || (() => {}))();
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });
  function segInit(id, initial, cb) {
    const seg = $(id);
    seg.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', b.dataset.v === initial);
      b.onclick = () => { seg.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); cb && cb(b.dataset.v); };
    });
  }
  const segVal = id => ($(id).querySelector('.on') || {}).dataset?.v;

  // ---------- onboarding ----------
  segInit('#ob-sex', 'F');
  $('#ob-go').onclick = () => {
    const name = $('#ob-name').value.trim() || t('friend'), year = +$('#ob-year').value;
    if (!year || year < 1920 || year > 2020) return toast(t('year_check'));
    S.profile = { name, year, sex: segVal('#ob-sex'), visit: $('#ob-visit').value || '', mode: 'general', goals: {}, meds: [] };
    save(); go('home'); toast(t('welcome', { name }));
  };

  // ---------- helpers ----------
  const entries = () => [...S.entries].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.ts - b.ts);
  const labs = () => entries().filter(e => e.egfr != null);
  const dxs = () => [...(S.dx || [])].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.ts - b.ts);
  const mealsOf = e => Object.values(e.meals || {});
  const cautCount = (e, c) => mealsOf(e).reduce((n, m) => n + ((m.caution || []).includes(c) ? 1 : 0), 0);
  const foodTags = e => mealsOf(e).flatMap(m => m.tags || []);
  const since = n => { const x = new Date(today()); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
  const avg = arr => arr.length ? r1(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  // ---------- home ----------
  function renderHome() {
    const p = S.profile, es = entries();
    $('#home-hello').textContent = t('hello', { name: p.name });
    $('#home-mode').textContent = isDx() ? t('modes_short')[p.mode] : '';
    const L = labs(), l = L[L.length - 1], lp = L[L.length - 2];
    const bps = es.filter(e => e.sbp), b = bps[bps.length - 1];
    const wts = es.filter(e => e.wt), w = wts[wts.length - 1];
    const tiles = [];
    const kpi = (cls, k, v, d, dcls = '') => `<div class="kpi ${cls}"><div class="k">${k}</div><div class="v en">${v}</div><div class="d ${dcls}">${d}</div></div>`;
    if (isDx()) {
      const D = dxs(), last = D[D.length - 1];
      const gains = D.filter(x => x.gain != null).slice(-5).map(x => x.gain);
      tiles.push(kpi('pink', t('dx_kpi_last'), last ? (p.mode === 'hd' ? `${last.post ?? last.pre}<small> kg</small>` : `${last.ex ?? '–'}<small> ×</small>`) : '–', last ? fmt(last.date) : t('dx_empty')));
      tiles.push(kpi('mint', t('idwg'), gains.length ? `${avg(gains) > 0 ? '+' : ''}${avg(gains)}<small> kg</small>` : '–', t('dx_kpi_gain')));
      const todayE = es.find(e => e.date === today());
      tiles.push(kpi('blue', t('fluid'), todayE && todayE.fluid != null ? `${todayE.fluid}<small> ${t('cup')}</small>` : '–', p.fluidGoal ? t('of_goal', { n: p.fluidGoal }) : t('today_lbl')));
    } else {
      let d = '', dcls = '';
      if (l && lp) { const dd = l.egfr - lp.egfr; d = t('vs_last', { d: (dd > 0 ? '+' : '') + dd }); dcls = dd > 0 ? 'up' : dd < 0 ? 'down' : ''; } else d = l ? fmt(l.date) : t('enter_cr');
      tiles.push(kpi('pink', 'eGFR', l ? `${l.egfr}<small> ${stage(l.egfr)}</small>` : '–', d, dcls));
      tiles.push(kpi('mint', t('bp'), b ? `${b.sbp}<small>/${b.dbp || '–'}</small>` : '–', b ? fmt(b.date) : t('no_record')));
      tiles.push(kpi('blue', t('weight'), w ? `${w.wt}<small> kg</small>` : '–', w ? fmt(w.date) : t('no_record')));
    }
    $('#kpis').innerHTML = tiles.join('');
    // caution today
    const todayE = es.find(e => e.date === today());
    const counts = CAUT.map(c => [c, todayE ? cautCount(todayE, c) : 0]);
    $('#caution-today').innerHTML = `<div class="ct-t">${t('today_caution')}</div><div class="ct-row">${counts.map(([c, n]) => { const g = p.goals?.[c]; const over = g != null && n > g; return `<div class="ct ${c}${over ? ' over' : ''}"><b>${n}</b><span>${cautName(c)}${g != null ? ` · ${t('goal_lbl', { n: g })}` : ''}</span></div>`; }).join('')}</div>`;
    // visit
    const vc = $('#visit-card');
    if (p.visit) { const dd = Math.ceil((new Date(p.visit) - new Date(today())) / 864e5); vc.innerHTML = `<div><div class="l">${t('next_visit', { date: p.visit.replace(/-/g, '.') })}</div><div class="n">${dd >= 0 ? 'D-' + dd : t('passed')}<small>${dd === 0 ? t('today_lbl') : ''}</small></div></div><button class="btn primary" data-go="report">${t('one_pager_btn')}</button>`; }
    else vc.innerHTML = `<div class="l">${t('set_visit')}</div><button class="btn ghost" data-go="settings">${t('settings')}</button>`;
    $('#nudge').innerHTML = nudge(es, p);
    const list = $('#home-list'), rec = es.slice(-5).reverse();
    list.innerHTML = rec.length ? rec.map(item).join('') : `<div class="empty">${t('empty_home')}</div>`;
    list.querySelectorAll('.del').forEach(btn => btn.onclick = () => { if (confirm(t('del_confirm'))) { S.entries = S.entries.filter(e => e.id !== btn.dataset.id); save(); renderHome(); } });
  }
  function item(e) {
    const m = [];
    if (e.egfr != null) m.push(`eGFR <b>${e.egfr}</b>`);
    if (e.sbp) m.push(`${t('bp')} <b>${e.sbp}/${e.dbp || '–'}</b>`);
    if (e.wt) m.push(`<b>${e.wt}</b>kg`);
    if (e.fluid != null) m.push(`${t('fluid')} <b>${e.fluid}</b>`);
    const ms = MEALS.filter(k => e.meals?.[k]).map(k => { const x = e.meals[k]; return `${t('meal_names')[k]} ${esc(x.text) || (x.tags || []).map(foodName).join('·')}${(x.caution || []).length ? ` <i class="ci">${x.caution.map(cautName).join('·')}</i>` : ''}`; });
    const photo = MEALS.map(k => e.meals?.[k]?.photo).find(Boolean);
    return `<div class="item"><div><div class="dt">${e.date}</div><div class="m">${m.join(' · ') || (ms.length ? t('meal') : e.note ? t('memo') : t('record'))}</div>${e.sym?.length ? `<div class="sy">${e.sym.map(symName).join(' · ')}</div>` : ''}${ms.length ? `<div class="fd">${ms.join(' / ')}</div>` : ''}</div>${photo ? `<img class="ft" src="${photo}" alt="">` : ''}<button class="del" data-id="${e.id}" aria-label="${t('delete')}">×</button></div>`;
  }
  function nudge(es, p) {
    const last = es[es.length - 1], days = last ? Math.floor((new Date(today()) - new Date(last.date)) / 864e5) : null;
    if (p.visit) { const dd = Math.ceil((new Date(p.visit) - new Date(today())) / 864e5); if (dd >= 0 && dd <= 3) return `<div>${t('n_visit', { d: dd })}</div>`; }
    if (isDx()) { const g = dxs().filter(x => x.gain != null).map(x => x.gain); if (g.length >= 4) { const lastG = g[g.length - 1], base = avg(g.slice(-6, -1)); if (lastG > base + 0.7) return `<div>${t('n_idwg')}</div>`; } }
    const bp3 = es.filter(e => e.sbp).slice(-3);
    if (bp3.length === 3 && bp3.every(e => e.sbp >= 140 || (e.dbp || 0) >= 90)) return `<div>${t('n_bp')}</div>`;
    const swell = es.slice(-3).flatMap(e => e.sym || []).filter(s => s === 'swelling').length;
    if (swell >= 2) return `<div>${t('n_swell')}</div>`;
    if (!last) return `<div>${t('n_first')}</div>`;
    if (days >= 7) return `<div>${t('n_days', { d: days })}</div>`;
    return `<div>${t('n_ok', { name: p.name })}</div>`;
  }

  // ---------- log ----------
  let sym = new Set(), fluid = 0, medsChecked = new Set(), mealState = {}, photoTarget = null;
  const blankMeal = () => ({ text: '', tags: new Set(), caution: new Set(), photo: null });
  function renderLog() {
    $('#log-date').textContent = today();
    $('#fluid-block').style.display = showFluid() ? '' : 'none';
    $('#fluid-goal').textContent = S.profile.fluidGoal ? ` ${t('of_goal', { n: S.profile.fluidGoal })}` : '';
    $('#fluid-n').textContent = fluid;
    const meds = S.profile.meds || [];
    $('#meds-block').style.display = meds.length ? '' : 'none';
    $('#meds-chips').innerHTML = meds.map(m => `<button type="button" data-med="${m.id}" class="${medsChecked.has(m.id) ? 'on' : ''}">${esc(m.name)}</button>`).join('');
    MEALS.forEach(k => mealState[k] ||= blankMeal());
    renderMeals();
  }
  function renderMeals() {
    $('#meals').innerHTML = MEALS.map(k => { const m = mealState[k]; return `<div class="meal" data-meal="${k}">
      <div class="meal-h"><b>${t('meal_names')[k]}</b><div class="ci-row">${CAUT.map(c => `<button type="button" class="ci-btn ${c} ${m.caution.has(c) ? 'on' : ''}" data-c="${c}" title="${t('caution_hint')[c]}">${cautName(c)}</button>`).join('')}</div></div>
      <div class="meal-in"><input type="text" maxlength="80" data-text placeholder="${t('meal_ph')}" value="${esc(m.text)}"><label class="photo-btn sm" data-photo>${t('food_photo')}</label>${m.photo ? `<img class="mp" src="${m.photo}" data-rmphoto alt="">` : ''}</div>
      <div class="chips sm">${FOODS.map(f => `<button type="button" data-f="${f}" class="${m.tags.has(f) ? 'on' : ''}">${foodName(f)}</button>`).join('')}</div></div>`; }).join('');
  }
  $('#meals').addEventListener('click', e => {
    const wrap = e.target.closest('.meal'); if (!wrap) return; const m = mealState[wrap.dataset.meal];
    const c = e.target.closest('[data-c]'); if (c) { const k = c.dataset.c; m.caution.has(k) ? m.caution.delete(k) : m.caution.add(k); c.classList.toggle('on'); return; }
    const f = e.target.closest('[data-f]'); if (f) { const k = f.dataset.f; m.tags.has(k) ? m.tags.delete(k) : m.tags.add(k); f.classList.toggle('on'); return; }
    if (e.target.closest('[data-photo]')) { photoTarget = wrap.dataset.meal; $('#meal-photo').click(); return; }
    if (e.target.closest('[data-rmphoto]')) { m.photo = null; renderMeals(); }
  });
  $('#meals').addEventListener('input', e => { const wrap = e.target.closest('.meal'); if (wrap && e.target.matches('[data-text]')) mealState[wrap.dataset.meal].text = e.target.value; });
  $('#meal-photo').onchange = e => {
    const f = e.target.files[0]; if (!f || !photoTarget) return;
    const img = new Image(), url = URL.createObjectURL(f);
    img.onload = () => { const max = 480, s = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); mealState[photoTarget].photo = c.toDataURL('image/jpeg', 0.6); URL.revokeObjectURL(url); renderMeals(); if (s < 1) toast(t('photo_big')); };
    img.src = url; e.target.value = '';
  };
  $('#sym-chips').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; b.classList.toggle('on'); b.classList.contains('on') ? sym.add(b.dataset.s) : sym.delete(b.dataset.s); });
  $('#meds-chips').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; b.classList.toggle('on'); b.classList.contains('on') ? medsChecked.add(b.dataset.med) : medsChecked.delete(b.dataset.med); });
  $('#fluid-plus').onclick = () => { fluid = Math.min(20, fluid + 1); $('#fluid-n').textContent = fluid; };
  $('#fluid-minus').onclick = () => { fluid = Math.max(0, fluid - 1); $('#fluid-n').textContent = fluid; };
  $('#log-form').cr.addEventListener('input', e => { const g = egfr(+e.target.value, age(), S.profile?.sex); $('#egfr-preview').textContent = g ? `→ eGFR ${g} (${stage(g)}) · CKD-EPI 2021` : ''; });
  $('#log-form').onsubmit = ev => {
    ev.preventDefault();
    const f = ev.target, n = k => f[k].value === '' ? null : +f[k].value;
    const meals = {}; MEALS.forEach(k => { const m = mealState[k]; if (m.text.trim() || m.tags.size || m.caution.size || m.photo) meals[k] = { text: m.text.trim(), tags: [...m.tags], caution: [...m.caution], photo: m.photo }; });
    const medsObj = {}; medsChecked.forEach(id => medsObj[id] = true);
    const e = { id: Date.now().toString(36), date: today(), ts: Date.now(), cr: n('cr'), k: n('k'), p: n('p'), sbp: n('sbp'), dbp: n('dbp'), wt: n('wt'), sym: [...sym], meals, fluid: showFluid() && fluid > 0 ? fluid : null, meds: medsObj, note: f.note.value.trim() };
    e.egfr = e.cr ? egfr(e.cr, age(), S.profile.sex) : null;
    const empty = !e.cr && !e.k && !e.p && !e.sbp && !e.wt && !e.sym.length && !Object.keys(meals).length && e.fluid == null && !medsChecked.size && !e.note;
    if (empty) return toast(t('need_one'));
    // merge into today's existing entry if any (one day = one card)
    const ex = S.entries.find(x => x.date === e.date);
    if (ex) { ['cr', 'k', 'p', 'sbp', 'dbp', 'wt', 'egfr', 'fluid'].forEach(k => { if (e[k] != null) ex[k] = e[k]; }); ex.sym = [...new Set([...(ex.sym || []), ...e.sym])]; Object.assign(ex.meals ||= {}, meals); Object.assign(ex.meds ||= {}, medsObj); if (e.note) ex.note = ex.note ? ex.note + ' / ' + e.note : e.note; }
    else S.entries.push(e);
    save();
    f.reset(); sym.clear(); medsChecked.clear(); fluid = 0; mealState = {}; $$('#sym-chips button').forEach(b => b.classList.remove('on')); $('#egfr-preview').textContent = '';
    toast(t('saved')); go('home');
  };

  // ---------- dialysis ----------
  let dxSym = new Set(), dxAcc = new Set();
  function renderDx() {
    const p = S.profile, hd = p.mode === 'hd';
    $('#dx-title').textContent = hd ? t('dx_title') : t('dx_pd_title');
    $('#dx-dry').textContent = p.dry ? t('dx_dry_now', { w: p.dry }) : t('dx_dry_set');
    $('#dx-hd').style.display = hd ? '' : 'none'; $('#dx-pd').style.display = hd ? 'none' : '';
    $('#dx-sym-chips').innerHTML = Object.keys(t('dx_syms')).map(k => `<button type="button" data-s="${k}" class="${dxSym.has(k) ? 'on' : ''}">${t('dx_syms')[k]}</button>`).join('');
    $('#dx-acc-chips').innerHTML = Object.keys(t('dx_accesses')).map(k => `<button type="button" data-a="${k}" class="${dxAcc.has(k) ? 'on' : ''}">${t('dx_accesses')[k]}</button>`).join('');
    const D = dxs(), last = D[D.length - 1], gains = D.filter(x => x.gain != null).slice(-5).map(x => x.gain), n30 = D.filter(x => x.date > since(30)).length;
    $('#dx-kpis').innerHTML = hd
      ? `<div class="kpi pink"><div class="k">${t('dx_kpi_last')}</div><div class="v en">${last ? `${last.pre ?? '–'}<small>→${last.post ?? '–'}</small>` : '–'}</div><div class="d">${last ? fmt(last.date) : ''}</div></div>
         <div class="kpi mint"><div class="k">${t('dx_kpi_gain')}</div><div class="v en">${gains.length ? `${avg(gains) > 0 ? '+' : ''}${avg(gains)}<small> kg</small>` : '–'}</div><div class="d">${p.dry ? t('dx_dry_now', { w: p.dry }) : ''}</div></div>
         <div class="kpi blue"><div class="k">${t('dx_kpi_n')}</div><div class="v en">${n30}<small> ×</small></div><div class="d"></div></div>`
      : `<div class="kpi pink"><div class="k">${t('pd_ex')}</div><div class="v en">${last ? `${last.ex ?? '–'}<small> ×</small>` : '–'}</div><div class="d">${last ? fmt(last.date) : ''}</div></div>
         <div class="kpi mint"><div class="k">${t('pd_uf')}</div><div class="v en">${last && last.uf != null ? `${last.uf}<small> ml</small>` : '–'}</div><div class="d"></div></div>
         <div class="kpi blue"><div class="k">${t('weight')}</div><div class="v en">${last && last.wt != null ? `${last.wt}<small> kg</small>` : '–'}</div><div class="d">${p.dry ? t('dx_dry_now', { w: p.dry }) : ''}</div></div>`;
    const list = $('#dx-list'), rec = D.slice(-6).reverse();
    list.innerHTML = rec.length ? rec.map(x => `<div class="item"><div><div class="dt">${x.date}</div><div class="m">${hd ? `${x.pre ?? '–'} → <b>${x.post ?? '–'}</b> kg${x.gain != null ? ` · ${t('idwg')} <b>${x.gain > 0 ? '+' : ''}${x.gain}</b>` : ''}` : `${x.ex ?? '–'}× · ${x.uf != null ? x.uf + ' ml' : ''} ${x.wt != null ? '· ' + x.wt + ' kg' : ''}`}</div>${(x.sym || []).length || (x.acc || []).length ? `<div class="sy">${[...(x.sym || []).map(k => t('dx_syms')[k]), ...(x.acc || []).map(k => t('dx_accesses')[k])].join(' · ')}</div>` : ''}</div><button class="del" data-id="${x.id}">×</button></div>`).join('') : `<div class="empty">${t('dx_empty')}</div>`;
    list.querySelectorAll('.del').forEach(btn => btn.onclick = () => { if (confirm(t('del_confirm'))) { S.dx = S.dx.filter(e => e.id !== btn.dataset.id); save(); renderDx(); } });
  }
  $('#dx-sym-chips').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; b.classList.toggle('on'); b.classList.contains('on') ? dxSym.add(b.dataset.s) : dxSym.delete(b.dataset.s); });
  $('#dx-acc-chips').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; b.classList.toggle('on'); b.classList.contains('on') ? dxAcc.add(b.dataset.a) : dxAcc.delete(b.dataset.a); });
  $('#dx-form').pre.addEventListener('input', () => { const D = dxs(), last = D[D.length - 1], v = +$('#dx-form').pre.value; $('#dx-gain').textContent = last && last.post != null && v ? `${t('dx_gain')}: ${r1(v - last.post) > 0 ? '+' : ''}${r1(v - last.post)} kg (${t('dx_gain_hint')})` : ''; });
  $('#dx-form').onsubmit = ev => {
    ev.preventDefault(); const f = ev.target, n = k => f[k].value === '' ? null : +f[k].value, hd = S.profile.mode === 'hd';
    const D = dxs(), last = D[D.length - 1];
    const x = { id: Date.now().toString(36), date: today(), ts: Date.now(), sym: [...dxSym], acc: [...dxAcc], note: f.note.value.trim() };
    if (hd) { x.pre = n('pre'); x.post = n('post'); x.gain = last && last.post != null && x.pre != null ? r1(x.pre - last.post) : null; if (x.pre == null && x.post == null) return toast(t('dx_need')); }
    else { x.ex = n('ex'); x.uf = n('uf'); x.wt = n('pdwt'); if (x.ex == null && x.uf == null && x.wt == null) return toast(t('dx_need')); }
    S.dx.push(x); save(); f.reset(); dxSym.clear(); dxAcc.clear(); $('#dx-gain').textContent = ''; toast(t('dx_saved')); renderDx();
  };

  // ---------- trend ----------
  let metric = 'egfr';
  $('#trend-seg').querySelectorAll('button').forEach(b => b.onclick = () => { $$('#trend-seg button').forEach(x => x.classList.remove('on')); b.classList.add('on'); metric = b.dataset.m; renderTrend(); });
  function renderTrend() { drawChart(); renderTimeTravel(); }
  function drawChart() {
    const c = $('#chart'), ctx = c.getContext('2d'), W = c.clientWidth || 340, H = 220, dpr = devicePixelRatio || 1;
    c.width = W * dpr; c.height = H * dpr; ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H);
    const es = entries();
    const series = metric === 'egfr' ? [{ c: '#E85C72', d: es.filter(e => e.egfr != null).map(e => [e.date, e.egfr]) }]
      : metric === 'bp' ? [{ c: '#E85C72', d: es.filter(e => e.sbp).map(e => [e.date, e.sbp]) }, { c: '#3B7F94', d: es.filter(e => e.dbp).map(e => [e.date, e.dbp]) }]
      : [{ c: '#4FA98A', d: es.filter(e => e.wt).map(e => [e.date, e.wt]) }];
    const all = series.flatMap(s => s.d);
    $('#chart-empty').style.display = all.length < 1 ? 'grid' : 'none'; if (!all.length) return;
    const pad = { l: 36, r: 12, t: 16, b: 28 }, xs = [...new Set(all.map(p => p[0]))].sort(), ys = all.map(p => p[1]);
    let y0 = Math.min(...ys), y1 = Math.max(...ys); if (metric === 'egfr') { y0 = Math.min(y0, 15); y1 = Math.max(y1, 90); }
    const span = Math.max(y1 - y0, 4); y0 = Math.max(0, y0 - span * .15); y1 += span * .15;
    const X = d => xs.length === 1 ? W / 2 : pad.l + (xs.indexOf(d) / (xs.length - 1)) * (W - pad.l - pad.r), Y = v => pad.t + (1 - (v - y0) / (y1 - y0)) * (H - pad.t - pad.b);
    if (metric === 'egfr') [[90, 999, '#E6F6F0'], [60, 90, '#F0F8F4'], [30, 60, '#FFF6F0'], [0, 30, '#FFE9ED']].forEach(([a, b, col]) => { const ya = Y(Math.min(b, y1)), yb = Y(Math.max(a, y0)); if (yb > ya) { ctx.fillStyle = col; ctx.fillRect(pad.l, ya, W - pad.l - pad.r, yb - ya); } });
    if (metric === 'wt' && S.profile.dry) { const y = Y(S.profile.dry); if (y > pad.t && y < H - pad.b) { ctx.setLineDash([4, 4]); ctx.strokeStyle = '#3B7F94'; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#3B7F94'; ctx.font = '10px Poppins, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(t('dry'), pad.l + 4, y - 4); } }
    ctx.strokeStyle = '#E6EDEF'; ctx.lineWidth = 1; ctx.fillStyle = '#8AA0A6'; ctx.font = '11px Poppins, sans-serif'; ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) { const v = y0 + (y1 - y0) * i / 4, y = Y(v); ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.fillText(Math.round(v), pad.l - 6, y + 4); }
    ctx.textAlign = 'center'; const step = Math.ceil(xs.length / 5); xs.forEach((d, i) => { if (i % step === 0 || i === xs.length - 1) ctx.fillText(fmt(d), X(d), H - 8); });
    series.forEach(s => { if (!s.d.length) return; ctx.strokeStyle = s.c; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.beginPath(); s.d.forEach(([d, v], i) => i ? ctx.lineTo(X(d), Y(v)) : ctx.moveTo(X(d), Y(v))); ctx.stroke(); s.d.forEach(([d, v]) => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X(d), Y(v), 4.5, 0, 7); ctx.fill(); ctx.strokeStyle = s.c; ctx.lineWidth = 2; ctx.stroke(); }); });
  }
  function renderTimeTravel() {
    const es = entries(), L = labs(), l = L[L.length - 1], lp = L[L.length - 2];
    const cur = es.filter(e => e.date > since(30)), prev = es.filter(e => e.date <= since(30) && e.date > since(60));
    const av = (arr, k) => avg(arr.filter(e => e[k] != null).map(e => e[k]));
    const cnt = (arr, fn) => arr.reduce((n, e) => n + fn(e), 0);
    const rows = [];
    const row = (label, a, b, unit = '', goodUp = false) => { if (a == null && b == null) return; let dl = ''; if (a != null && b != null) { const d = r1(b - a), cls = d === 0 ? 'flat' : ((d > 0) === goodUp ? 'up' : 'down'); dl = `<span class="delta ${cls}">${d > 0 ? '+' : ''}${d}</span>`; } rows.push(`<tr><td>${label}</td><td>${a ?? '–'}</td><td>${b ?? '–'}${unit}${dl}</td></tr>`); };
    row(`eGFR ${lp ? fmt(lp.date) + ' → ' + fmt(l.date) : ''}`, lp?.egfr, l?.egfr, '', true);
    row(t('tt_cr'), lp?.cr, l?.cr); row(t('tt_k'), lp?.k, l?.k);
    row(t('tt_sbp'), av(prev, 'sbp'), av(cur, 'sbp')); row(t('tt_dbp'), av(prev, 'dbp'), av(cur, 'dbp')); row(t('tt_wt'), av(prev, 'wt'), av(cur, 'wt'), 'kg');
    if (es.some(e => mealsOf(e).length)) { row(t('tt_eatout'), cnt(prev, e => foodTags(e).filter(x => x === 'eatout' || x === 'delivery').length), cnt(cur, e => foodTags(e).filter(x => x === 'eatout' || x === 'delivery').length)); CAUT.forEach(c => row(t('tt_' + c), cnt(prev, e => cautCount(e, c)), cnt(cur, e => cautCount(e, c)))); }
    if (isDx()) { const D = dxs(); const g = arr => avg(arr.filter(x => x.gain != null).map(x => x.gain)); row(t('tt_idwg'), g(D.filter(x => x.date <= since(30) && x.date > since(60))), g(D.filter(x => x.date > since(30)))); }
    $('#timetravel').innerHTML = `<div class="t">${t('tt_title')}<span>TIME TRAVEL</span></div>` + (rows.length ? `<table><tr><td style="color:#8AA0A6;font-size:11px">${t('item')}</td><td style="color:#8AA0A6;font-size:11px;text-align:right">${t('last')}</td><td style="color:#8AA0A6;font-size:11px;text-align:right">${t('now')}</td></tr>${rows.join('')}</table>` : `<div class="empty">${t('tt_empty')}</div>`);
  }

  // ---------- report: The One-Pager ----------
  $('#rep-range').onchange = renderReport;
  function renderReport() {
    const p = S.profile, days = +$('#rep-range').value, from = since(days);
    const es = entries().filter(e => e.date > from), L = es.filter(e => e.egfr != null).slice(-6);
    const stat = k => { const v = es.filter(e => e[k] != null).map(e => e[k]); return v.length ? { n: v.length, avg: avg(v), min: Math.min(...v), max: Math.max(...v) } : null; };
    const sb = stat('sbp'), db = stat('dbp'), wt = stat('wt'), fl = stat('fluid');
    const count = (fn) => { const c = {}; es.forEach(e => fn(e).forEach(s => c[s] = (c[s] || 0) + 1)); return Object.entries(c).sort((a, b) => b[1] - a[1]); };
    const syms = count(e => e.sym || []), foods = count(e => foodTags(e));
    const cauts = CAUT.map(c => [c, es.reduce((n, e) => n + cautCount(e, c), 0), es.filter(e => p.goals?.[c] != null && cautCount(e, c) > p.goals[c]).length]);
    const notes = es.filter(e => e.note).slice(-6).reverse(), mealNotes = es.flatMap(e => MEALS.filter(k => e.meals?.[k]?.text).map(k => [e.date, k, e.meals[k].text])).slice(-4).reverse();
    const first = L[0], last = L[L.length - 1];
    const meds = p.meds || [], medRate = meds.map(m => { const days = es.length; const c = es.filter(e => e.meds?.[m.id]).length; return `${esc(m.name)} ${days ? Math.round(100 * c / days) : 0}%`; });
    const D = dxs().filter(x => x.date > from), gains = D.filter(x => x.gain != null).map(x => x.gain), dxSyms = count.call(null, () => []) && (() => { const c = {}; D.forEach(x => (x.sym || []).forEach(s => c[s] = (c[s] || 0) + 1)); return Object.entries(c); })(), dxAccs = (() => { const c = {}; D.forEach(x => (x.acc || []).forEach(s => c[s] = (c[s] || 0) + 1)); return Object.entries(c); })();
    $('#onepager').innerHTML = `
      <div class="hd"><div><h3>${t('op_head', { name: p.name })}</h3><div class="en">The One-Pager · My Beanie</div></div>
      <div class="meta" style="text-align:right">${t('op_meta', { age: new Date().getFullYear() - p.year, sex: p.sex === 'F' ? t('f_short') : t('m_short'), mode: isDx() ? ' · ' + t('modes_short')[p.mode] : '' })}<br>${t('op_made', { date: today().replace(/-/g, '.') })}<br>${t('op_period', { d: days })}</div></div>
      <h4>${t('op_labs')}</h4>
      ${L.length ? `<table><tr><th>${t('date')}</th><th class="num">Cr</th><th class="num">eGFR</th><th class="num">K</th><th class="num">P</th></tr>${L.map(e => `<tr><td>${e.date}</td><td class="num">${e.cr}</td><td class="num"><b>${e.egfr}</b> ${stage(e.egfr)}</td><td class="num">${e.k ?? '–'}</td><td class="num">${e.p ?? '–'}</td></tr>`).join('')}</table>${first && last && first !== last ? `<div class="meta" style="margin-top:6px">${t('op_change', { a: first.egfr, b: last.egfr, d: (last.egfr - first.egfr > 0 ? '+' : '') + (last.egfr - first.egfr) })}</div>` : ''}` : `<div class="meta">${t('op_no_labs')}</div>`}
      ${isDx() ? `<h4 class="b">${t('op_dx')}</h4><div class="meta">${p.mode === 'hd' ? t('op_dx_row', { n: D.length, g: gains.length ? avg(gains) : '–', m: gains.length ? Math.max(...gains) : '–', w: p.dry ? p.dry + 'kg' : '–' }) : t('op_pd_row', { n: avg(D.filter(x => x.ex != null).map(x => x.ex)) ?? '–', u: avg(D.filter(x => x.uf != null).map(x => x.uf)) ?? '–' })}</div>${dxSyms.length ? `<div class="meta"><b>${t('op_dx_sym')}</b> · ${dxSyms.map(([s, n]) => `${t('dx_syms')[s]} ×${n}`).join(' · ')}</div>` : ''}${dxAccs.length ? `<div class="meta"><b>${t('op_dx_access')}</b> · ${dxAccs.map(([s, n]) => `${t('dx_accesses')[s]} ×${n}`).join(' · ')}</div>` : ''}` : ''}
      <h4 class="m">${t('op_daily')}</h4>
      <table><tr><th>${t('item')}</th><th class="num">${t('avg')}</th><th class="num">${t('range')}</th><th class="num">${t('count')}</th></tr>
      <tr><td>${t('op_sbp')}</td><td class="num">${sb ? sb.avg : '–'}</td><td class="num">${sb ? sb.min + '–' + sb.max : '–'}</td><td class="num">${sb ? sb.n : 0}</td></tr>
      <tr><td>${t('op_dbp')}</td><td class="num">${db ? db.avg : '–'}</td><td class="num">${db ? db.min + '–' + db.max : '–'}</td><td class="num">${db ? db.n : 0}</td></tr>
      <tr><td>${t('op_wt')}</td><td class="num">${wt ? wt.avg : '–'}</td><td class="num">${wt ? wt.min + '–' + wt.max : '–'}</td><td class="num">${wt ? wt.n : 0}</td></tr>
      ${fl ? `<tr><td>${t('op_fluid')}</td><td class="num">${fl.avg}</td><td class="num">${fl.min}–${fl.max}</td><td class="num">${fl.n}</td></tr>` : ''}</table>
      <h4 class="b">${t('op_signals')}</h4>
      ${syms.length ? syms.map(([s, n]) => `<span class="pill">${symName(s)} ×${n}</span>`).join('') : `<div class="meta">${t('op_no_sym')}</div>`}
      <h4 class="m">${t('op_caution')}</h4>
      ${cauts.map(([c, n, over]) => `<span class="pill ${c}">${cautName(c)} ×${n}</span>`).join('')}
      ${cauts.filter(([c, n, over]) => p.goals?.[c] != null).map(([c, n, over]) => `<div class="meta">${cautName(c)}: ${t('op_caution_goal', { n: p.goals[c], d: over })}</div>`).join('')}
      <h4 class="m">${t('op_food')}</h4>
      ${foods.length ? foods.map(([s, n]) => `<span class="pill f">${foodName(s)} ×${n}</span>`).join('') : `<div class="meta">${t('op_no_food')}</div>`}
      ${mealNotes.length ? `<div class="meta" style="margin-top:6px"><b>${t('op_food_recent')}</b> · ${mealNotes.map(([d, k, x]) => `${fmt(d)} ${t('meal_names')[k]} ${esc(x)}`).join(' · ')}</div>` : ''}
      ${meds.length ? `<h4>${t('op_meds')}</h4><div class="meta">${medRate.join(' · ')}</div>` : ''}
      <h4>${t('op_questions')}</h4>
      ${notes.length ? `<ul>${notes.map(e => `<li><span style="color:#8AA0A6;font-family:Poppins">${fmt(e.date)}</span> ${esc(e.note)}</li>`).join('')}</ul>` : `<div class="meta">${t('op_no_notes')}</div>`}
      <div class="foot">${t('op_foot')}</div>`;
  }
  $('#rep-print').onclick = () => window.print();
  $('#rep-share').onclick = async () => { const text = $('#onepager').innerText; if (navigator.share) { try { await navigator.share({ title: t('share_title'), text }); } catch (e) {} } else { try { await navigator.clipboard.writeText(text); toast(t('copied')); } catch (e) { toast(t('no_share')); } } };

  // ---------- Mirrored Care ----------
  const MKEY = 'mybeanie.mirrors';
  const loadMirrors = () => { try { return JSON.parse(localStorage.getItem(MKEY)) || []; } catch (e) { return []; } };
  const saveMirrors = list => { try { localStorage.setItem(MKEY, JSON.stringify(list)); } catch (e) { toast(t('storage_err')); } };
  let currentMirror = null;
  $('#mc-share').onclick = async () => {
    const items = $$('#mc-opts input:checked').map(i => i.dataset.k).filter(k => k !== 'name');
    if (!items.length) return toast(t('mc_none'));
    const payload = Mirror.build(S, { items, days: +$('#mc-range').value, depth: $('#mc-depth').value, showName: $('#mc-opts input[data-k=name]').checked });
    const code = await Mirror.encode(payload), url = location.origin + location.pathname + '?lang=' + LANG + '#m=' + code, text = t('mc_msg', { name: payload.n || t('friend') });
    if (navigator.share) { try { await navigator.share({ title: 'My Beanie', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(text + '\n' + url); toast(t('mc_copied')); } catch (e) { prompt('URL', url); }
  };
  async function openMirrorFromHash() {
    const m = location.hash.match(/#m=([^&]+)/); if (!m) return false;
    try { currentMirror = await Mirror.decode(m[1]); } catch (e) { toast(t('mr_bad')); return false; }
    history.replaceState(null, '', location.pathname + location.search); renderMirror(currentMirror); return true;
  }
  function renderMirror(p) {
    $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-mirror')); $('#tabbar').classList.toggle('hidden', !S.profile); $$('.tabbar button').forEach(b => b.classList.remove('on')); window.scrollTo(0, 0);
    const has = k => p.i.includes(k), E = p.e, num = v => v == null ? '–' : v, last = idx => [...E].reverse().find(r => r[idx] != null);
    $('#mr-title').textContent = p.n ? t('mr_title', { name: p.n }) : t('mr_anon'); $('#mr-sub').textContent = t('mr_sub'); $('#mr-badge').textContent = t('mr_badge', { date: p.at.replace(/-/g, '.'), d: p.d });
    const tiles = [], html = [];
    if (has('egfr')) { const r = last(1); tiles.push(`<div class="kpi pink"><div class="k">eGFR</div><div class="v en">${r ? r[1] + '<small> ' + stage(r[1]) + '</small>' : '–'}</div><div class="d">${r ? fmt(r[0]) : ''}</div></div>`); }
    if (has('bp')) { const r = last(3); tiles.push(`<div class="kpi mint"><div class="k">${t('bp')}</div><div class="v en">${r ? r[3] + '<small>/' + num(r[4]) + '</small>' : '–'}</div><div class="d">${r ? fmt(r[0]) : ''}</div></div>`); }
    if (has('wt')) { const r = last(5); tiles.push(`<div class="kpi blue"><div class="k">${t('weight')}</div><div class="v en">${r ? r[5] + '<small> kg</small>' : '–'}</div><div class="d">${r ? fmt(r[0]) : ''}</div></div>`); }
    if (tiles.length) html.push(`<div class="kpis" style="grid-template-columns:repeat(${tiles.length},1fr)">${tiles.join('')}</div>`);
    if (p.s === 'trend') {
      if (has('egfr')) { const rows = E.filter(r => r[1] != null); if (rows.length) html.push(`<div class="card mr-sec"><h4>${t('op_labs')}</h4><table>${rows.map(r => `<tr><td>${r[0]}</td><td class="num">Cr ${num(r[2])}</td><td class="num"><b>${r[1]}</b> ${stage(r[1])}</td></tr>`).join('')}</table></div>`); }
      if (has('bp') || has('wt')) { const rows = E.filter(r => r[3] != null || r[5] != null).slice(-10); if (rows.length) html.push(`<div class="card mr-sec m"><h4>${t('op_daily')}</h4><table>${rows.map(r => `<tr><td>${r[0]}</td><td class="num">${has('bp') && r[3] != null ? r[3] + '/' + num(r[4]) : ''}</td><td class="num">${has('wt') && r[5] != null ? r[5] + ' kg' : ''}</td></tr>`).join('')}</table></div>`); }
    }
    const pills = (idx, nameFn, style) => { const c = {}; E.forEach(r => (r[idx] || []).forEach(s => c[s] = (c[s] || 0) + 1)); const arr = Object.entries(c).sort((a, b) => b[1] - a[1]); return arr.length ? arr.map(([s, n]) => `<span class="pill" style="display:inline-block;${style};border-radius:999px;padding:2px 10px;font-size:12px;margin:2px 4px 2px 0">${nameFn(s)} ×${n}</span>`).join('') : null; };
    if (has('sym')) html.push(`<div class="card mr-sec b"><h4>${t('op_signals')}</h4>${pills(6, symName, 'background:var(--coral-soft);color:var(--coral-deep)') || `<div class="mr-empty">${t('op_no_sym')}</div>`}</div>`);
    if (has('food')) html.push(`<div class="card mr-sec m"><h4>${t('op_food')}</h4>${pills(7, foodName, 'background:var(--mint-soft);color:var(--mint-deep)') || `<div class="mr-empty">${t('op_no_food')}</div>`}</div>`);
    if (has('notes')) { const rows = E.filter(r => r[8]).slice(-6).reverse(); html.push(`<div class="card mr-sec"><h4>${t('op_questions')}</h4>${rows.length ? `<ul>${rows.map(r => `<li><span style="color:#8AA0A6;font-family:Poppins">${fmt(r[0])}</span> ${esc(r[8])}</li>`).join('')}</ul>` : `<div class="mr-empty">${t('op_no_notes')}</div>`}</div>`); }
    $('#mr-body').innerHTML = html.join(''); $('#mr-mine').textContent = S.profile ? t('mr_mine') : t('mr_start');
  }
  $('#mr-keep').onclick = () => { if (!currentMirror) return; const list = loadMirrors().filter(x => !(x.n === currentMirror.n && x.at === currentMirror.at)); list.unshift(currentMirror); saveMirrors(list.slice(0, 10)); toast(t('mr_kept')); };
  $('#mr-mine').onclick = () => go(S.profile ? 'home' : 'onboard');
  function renderMirrorList() {
    const list = loadMirrors(), card = $('#st-mirrors-card'); card.hidden = !list.length; if (!list.length) return;
    $('#st-mirrors').innerHTML = list.map((m, i) => `<div class="item"><div><div class="dt">${m.at}</div><div class="m">${esc(m.n || t('mr_anon'))} · ${t('op_period', { d: m.d })}</div></div><div style="display:flex;gap:4px"><button class="btn ghost" style="width:auto;margin:0;padding:8px 12px;font-size:13px" data-open="${i}">${t('mr_open')}</button><button class="del" data-del="${i}">×</button></div></div>`).join('');
    $$('#st-mirrors [data-open]').forEach(b => b.onclick = () => { currentMirror = loadMirrors()[+b.dataset.open]; renderMirror(currentMirror); });
    $$('#st-mirrors [data-del]').forEach(b => b.onclick = () => { const l = loadMirrors(); l.splice(+b.dataset.del, 1); saveMirrors(l); renderMirrorList(); });
  }

  // ---------- settings ----------
  function renderSettings() {
    renderMirrorList(); const p = S.profile;
    $('#st-name').value = p.name; $('#st-year').value = p.year; $('#st-visit').value = p.visit || ''; segInit('#st-sex', p.sex); segInit('#st-lang', LANG);
    segInit('#st-mode', p.mode, v => { $('#st-dx-fields').style.display = (v === 'hd' || v === 'pd') ? '' : 'none'; });
    $('#st-dx-fields').style.display = isDx() ? '' : 'none'; $('#st-dry').value = p.dry ?? ''; $('#st-fluid').value = p.fluidGoal ?? '';
    $('#st-gk').value = p.goals?.hiK ?? ''; $('#st-gp').value = p.goals?.hiP ?? ''; $('#st-gna').value = p.goals?.hiNa ?? '';
    renderMeds();
  }
  function renderMeds() {
    const meds = S.profile.meds || [];
    $('#st-meds').innerHTML = meds.map(m => `<div class="item"><div class="m">${esc(m.name)}</div><button class="del" data-id="${m.id}">×</button></div>`).join('');
    $$('#st-meds .del').forEach(b => b.onclick = () => { S.profile.meds = S.profile.meds.filter(m => m.id !== b.dataset.id); save(); renderMeds(); });
  }
  $('#st-med-add').onclick = () => { const v = $('#st-med-name').value.trim(); if (!v) return; (S.profile.meds ||= []).push({ id: Date.now().toString(36), name: v }); $('#st-med-name').value = ''; save(); renderMeds(); };
  $('#st-goals-save').onclick = () => { const g = {}; [['hiK', '#st-gk'], ['hiP', '#st-gp'], ['hiNa', '#st-gna']].forEach(([k, id]) => { const v = $(id).value; if (v !== '') g[k] = +v; }); S.profile.goals = g; save(); toast(t('saved')); };
  $('#st-save').onclick = () => {
    const p = S.profile;
    Object.assign(p, { name: $('#st-name').value.trim() || p.name, year: +$('#st-year').value || p.year, sex: segVal('#st-sex'), visit: $('#st-visit').value, mode: segVal('#st-mode') || p.mode, dry: $('#st-dry').value === '' ? null : +$('#st-dry').value, fluidGoal: $('#st-fluid').value === '' ? null : +$('#st-fluid').value });
    save(); const nl = segVal('#st-lang'); if (nl && nl !== LANG) { try { localStorage.setItem('mybeanie.lang', nl); } catch (e) {} location.href = location.pathname + (DEMO ? (DEMO_HD ? '?demo=hd&' : DEMO_PRE ? '?demo=pre&' : '?demo&') : '?') + 'lang=' + nl; return; }
    toast(t('saved')); go('home');
  };
  $('#st-export').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); a.download = `mybeanie-${today()}.json`; a.click(); };
  $('#st-import').onclick = () => $('#st-file').click();
  $('#st-file').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(txt => { const j = JSON.parse(txt); if (!j.entries) throw 0; S = j; migrate(); save(); toast(t('imported')); go('home'); }).catch(() => toast(t('bad_file'))); };
  $('#st-reset').onclick = () => { if (confirm(t('reset_confirm'))) { localStorage.removeItem(KEY); location.reload(); } };

  // ---------- misc ----------
  let tt; function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 1800); }
  window.addEventListener('resize', () => $('#v-trend').classList.contains('on') && drawChart());
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (DEMO) { const b = document.createElement('div'); b.className = 'demo-bar'; b.innerHTML = `${t('demo_bar')} &nbsp;<a href="./?lang=${LANG}">${t('demo_link')}</a>`; document.body.prepend(b); try { if (!localStorage.getItem(KEY)) save(); } catch (e) {} }
  applyI18n(); $('#site-link').href = LANG === 'en' ? 'https://kidneybloom.com/en/' : 'https://kidneybloom.com'; const _lp = LANG === 'en' ? 'https://kidneybloom.com/en/' : 'https://kidneybloom.com/'; $('#terms-link').href = _lp + 'terms.html'; $('#privacy-link').href = _lp + 'privacy.html';
  segInit('#ob-lang', LANG, v => { try { localStorage.setItem('mybeanie.lang', v); } catch (e) {} location.href = location.pathname + (DEMO ? (DEMO_HD ? '?demo=hd&' : DEMO_PRE ? '?demo=pre&' : '?demo&') : '?') + 'lang=' + v; });
  const GO = new URLSearchParams(location.search).get('go');
  openMirrorFromHash().then(ok => { if (!ok) go(S.profile ? (['log', 'report', 'trend', 'dx'].includes(GO) ? GO : 'home') : 'onboard'); });
  window.addEventListener('hashchange', openMirrorFromHash);
})();
