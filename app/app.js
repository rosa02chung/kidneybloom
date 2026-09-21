/* My Beanie v0.2 — 콩팥 건강 일지 / Kidney Health Journal (PWA, ko/en) */
(() => {
  const DEMO = /[?&]demo/.test(location.search);
  const KEY = DEMO ? 'mybeanie.demo' : 'mybeanie.v1';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const today = () => new Date().toISOString().slice(0, 10);
  const fmt = d => d.replace(/-/g, '.').slice(2); // 26.09.17
  const r1 = n => Math.round(n * 10) / 10;

  // ---------- state ----------
  let S = load();
  function load() {
    try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && j.entries) return j; } catch (e) {}
    if (DEMO) return demoData();
    return { profile: null, entries: [], symChips: [] };
  }
  // 데모 모드 (?demo) — 의료진·투자자 시연용 샘플 기록. 실제 기록과 별도 키에 저장
  function demoData() {
    const T = new Date(); const d = n => { const x = new Date(T); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
    const v = new Date(T); v.setDate(v.getDate() + 3);
    const rows = [
      [92, 1.34, 5.1, 3.9, 142, 89, 63.4, ['fatigue'], ''],
      [80, null, null, null, 138, 86, 63.1, ['fatigue', 'nocturia'], ''],
      [68, null, null, null, 135, 84, 62.9, [], LANG === 'en' ? 'Some days I feel dizzy after taking my pills' : '약 먹고 나서 어지러운 날이 있어요'],
      [56, 1.29, 4.7, 3.7, 133, 82, 62.6, ['swelling'], LANG === 'en' ? 'My ankles swell every evening — is that okay?' : '저녁마다 발목이 붓는데 괜찮은가요?'],
      [44, null, null, null, 131, 81, 62.5, ['swelling', 'nocturia'], ''],
      [30, null, null, null, 129, 80, 62.3, [], ''],
      [18, 1.22, 4.4, 3.6, 128, 79, 62.1, [], LANG === 'en' ? 'Is my protein intake about right?' : '단백질 섭취량이 적당한지 궁금해요'],
      [9, null, null, null, 127, 78, 62.0, ['fatigue'], ''],
      [2, null, null, null, 126, 78, 61.9, [], LANG === 'en' ? 'Less eating out seems to mean less swelling' : '외식을 줄였더니 붓기가 덜한 것 같아요'],
    ];
    const entries = rows.map(([n, cr, k, p, sbp, dbp, wt, sym, note], i) => ({ id: 'demo' + i, date: d(n), ts: i, cr, k, p, sbp, dbp, wt, sym, note, egfr: cr ? egfr(cr, 61, 'F') : null }));
    return { profile: { name: t('demo_name'), year: T.getFullYear() - 61, sex: 'F', visit: v.toISOString().slice(0, 10) }, entries, symChips: [] };
  }
  const SYM_LEGACY = { '붓기': 'swelling', '피로': 'fatigue', '가려움': 'itching', '식욕저하': 'appetite', '숨참': 'breath', '두통': 'headache', '거품뇨': 'foamy', '야간뇨': 'nocturia', '잠 설침': 'sleep' };
  const symName = k => (t('sym')[k] || k);
  function migrate() { (S.entries || []).forEach(e => { e.sym = (e.sym || []).map(x => SYM_LEGACY[x] || x); }); }
  migrate();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast(t('storage_err')); } }

  // ---------- eGFR: CKD-EPI 2021 (race-free) ----------
  function egfr(cr, age, sex) {
    if (!cr || !age) return null;
    const f = sex === 'F', k = f ? 0.7 : 0.9, a = f ? -0.241 : -0.302;
    const ratio = cr / k;
    const v = 142 * Math.pow(Math.min(ratio, 1), a) * Math.pow(Math.max(ratio, 1), -1.2) * Math.pow(0.9938, age) * (f ? 1.012 : 1);
    return Math.round(v);
  }
  const age = () => S.profile ? new Date().getFullYear() - S.profile.year : null;
  const stage = g => g >= 90 ? 'G1' : g >= 60 ? 'G2' : g >= 45 ? 'G3a' : g >= 30 ? 'G3b' : g >= 15 ? 'G4' : 'G5';

  // ---------- nav ----------
  function go(v) {
    $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
    $$('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.go === v));
    $('#tabbar').classList.toggle('hidden', v === 'onboard');
    window.scrollTo(0, 0);
    ({ home: renderHome, log: renderLog, trend: renderTrend, report: renderReport, settings: renderSettings }[v] || (() => {}))();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go);
  });

  // ---------- onboarding ----------
  function segInit(id, initial, cb) {
    const seg = $(id);
    seg.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', b.dataset.v === initial);
      b.onclick = () => { seg.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); cb && cb(b.dataset.v); };
    });
  }
  const segVal = id => ($(id).querySelector('.on') || {}).dataset?.v;
  segInit('#ob-sex', 'F');
  $('#ob-go').onclick = () => {
    const name = $('#ob-name').value.trim() || t('friend'), year = +$('#ob-year').value;
    if (!year || year < 1920 || year > 2020) return toast(t('year_check'));
    S.profile = { name, year, sex: segVal('#ob-sex'), visit: $('#ob-visit').value || '' };
    save(); go('home'); toast(t('welcome', { name }));
  };

  // ---------- home ----------
  const entries = () => [...S.entries].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.ts - b.ts);
  const labs = () => entries().filter(e => e.egfr != null);
  function renderHome() {
    const p = S.profile, es = entries();
    $('#home-hello').textContent = t('hello', { name: p.name });
    // kpis
    const L = labs(), l = L[L.length - 1], lp = L[L.length - 2];
    $('#kpi-egfr').innerHTML = l ? `${l.egfr}<small> ${stage(l.egfr)}</small>` : '–';
    const dE = $('#kpi-egfr-d'); dE.className = 'd';
    if (l && lp) { const d = l.egfr - lp.egfr; dE.textContent = t('vs_last', { d: (d > 0 ? '+' : '') + d }); dE.classList.add(d > 0 ? 'up' : d < 0 ? 'down' : ''); }
    else dE.textContent = l ? fmt(l.date) : t('enter_cr');
    const bps = es.filter(e => e.sbp), b = bps[bps.length - 1];
    $('#kpi-bp').innerHTML = b ? `${b.sbp}<small>/${b.dbp || '–'}</small>` : '–';
    $('#kpi-bp-d').textContent = b ? fmt(b.date) : t('no_record');
    const wts = es.filter(e => e.wt), w = wts[wts.length - 1];
    $('#kpi-wt').innerHTML = w ? `${w.wt}<small> ${t('kg')}</small>` : '–';
    $('#kpi-wt-d').textContent = w ? fmt(w.date) : t('no_record');
    // visit
    const vc = $('#visit-card');
    if (p.visit) {
      const dd = Math.ceil((new Date(p.visit) - new Date(today())) / 864e5);
      vc.innerHTML = `<div><div class="l">${t('next_visit', { date: p.visit.replace(/-/g, '.') })}</div><div class="n">${dd >= 0 ? 'D-' + dd : t('passed')}<small>${dd === 0 ? t('today_lbl') : ''}</small></div></div><button class="btn primary" data-go="report">${t('one_pager_btn')}</button>`;
    } else vc.innerHTML = `<div class="l">${t('set_visit')}</div><button class="btn ghost" data-go="settings">${t('settings')}</button>`;
    // nudge
    $('#nudge').innerHTML = nudge(es, p);
    // list
    const list = $('#home-list'); const rec = es.slice(-5).reverse();
    list.innerHTML = rec.length ? rec.map(item).join('') : `<div class="empty">${t('empty_home')}</div>`;
    list.querySelectorAll('.del').forEach(btn => btn.onclick = () => { if (confirm(t('del_confirm'))) { S.entries = S.entries.filter(e => e.id !== btn.dataset.id); save(); renderHome(); } });
  }
  function item(e) {
    const m = [];
    if (e.egfr != null) m.push(`eGFR <b>${e.egfr}</b>`);
    if (e.sbp) m.push(`${t('bp')} <b>${e.sbp}/${e.dbp || '–'}</b>`);
    if (e.wt) m.push(`<b>${e.wt}</b>kg`);
    if (e.k) m.push(`K <b>${e.k}</b>`);
    return `<div class="item"><div><div class="dt">${e.date}</div><div class="m">${m.join(' · ') || (e.note ? t('memo') : t('record'))}</div>${e.sym?.length ? `<div class="sy">${e.sym.map(symName).join(' · ')}</div>` : ''}</div><button class="del" data-id="${e.id}" aria-label="${t('delete')}">×</button></div>`;
  }
  // The Quiet Nudge — 한 번에 한 줄만
  function nudge(es, p) {
    const last = es[es.length - 1];
    const days = last ? Math.floor((new Date(today()) - new Date(last.date)) / 864e5) : null;
    if (p.visit) {
      const dd = Math.ceil((new Date(p.visit) - new Date(today())) / 864e5);
      if (dd >= 0 && dd <= 3) return `<div>${t('n_visit', { d: dd })}</div>`;
    }
    const bp3 = es.filter(e => e.sbp).slice(-3);
    if (bp3.length === 3 && bp3.every(e => e.sbp >= 140 || (e.dbp || 0) >= 90)) return `<div>${t('n_bp')}</div>`;
    const sym = es.slice(-3).flatMap(e => e.sym || []); const swell = sym.filter(s => s === 'swelling').length;
    if (swell >= 2) return `<div>${t('n_swell')}</div>`;
    if (!last) return `<div>${t('n_first')}</div>`;
    if (days >= 7) return `<div>${t('n_days', { d: days })}</div>`;
    return `<div>${t('n_ok', { name: p.name })}</div>`;
  }

  // ---------- log ----------
  let sym = new Set();
  $('#sym-chips').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    b.classList.toggle('on'); b.classList.contains('on') ? sym.add(b.dataset.s) : sym.delete(b.dataset.s);
  });
  $('#log-form').cr.addEventListener('input', e => {
    const g = egfr(+e.target.value, age(), S.profile?.sex);
    $('#egfr-preview').textContent = g ? `→ eGFR ${g} (${stage(g)}) · CKD-EPI 2021` : '';
  });
  function renderLog() { $('#log-date').textContent = today(); }
  $('#log-form').onsubmit = ev => {
    ev.preventDefault();
    const f = ev.target, n = k => f[k].value === '' ? null : +f[k].value;
    const e = { id: Date.now().toString(36), date: today(), ts: Date.now(), cr: n('cr'), k: n('k'), p: n('p'), sbp: n('sbp'), dbp: n('dbp'), wt: n('wt'), sym: [...sym], note: f.note.value.trim() };
    e.egfr = e.cr ? egfr(e.cr, age(), S.profile.sex) : null;
    if (!e.cr && !e.sbp && !e.wt && !e.sym.length && !e.note && !e.k && !e.p) return toast(t('need_one'));
    S.entries.push(e); save();
    f.reset(); sym.clear(); $$('#sym-chips button').forEach(b => b.classList.remove('on')); $('#egfr-preview').textContent = '';
    toast(t('saved')); go('home');
  };

  // ---------- trend ----------
  let metric = 'egfr';
  $('#trend-seg').querySelectorAll('button').forEach(b => b.onclick = () => { $$('#trend-seg button').forEach(x => x.classList.remove('on')); b.classList.add('on'); metric = b.dataset.m; renderTrend(); });
  function renderTrend() { drawChart(); renderTimeTravel(); }
  function drawChart() {
    const c = $('#chart'), ctx = c.getContext('2d');
    const W = c.clientWidth || 340, H = 220, dpr = devicePixelRatio || 1;
    c.width = W * dpr; c.height = H * dpr; ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H);
    const es = entries();
    const series = metric === 'egfr' ? [{ c: '#E85C72', d: es.filter(e => e.egfr != null).map(e => [e.date, e.egfr]) }]
      : metric === 'bp' ? [{ c: '#E85C72', d: es.filter(e => e.sbp).map(e => [e.date, e.sbp]) }, { c: '#3B7F94', d: es.filter(e => e.dbp).map(e => [e.date, e.dbp]) }]
      : [{ c: '#4FA98A', d: es.filter(e => e.wt).map(e => [e.date, e.wt]) }];
    const all = series.flatMap(s => s.d);
    $('#chart-empty').style.display = all.length < 1 ? 'grid' : 'none';
    if (!all.length) return;
    const pad = { l: 36, r: 12, t: 16, b: 28 };
    const xs = [...new Set(all.map(p => p[0]))].sort();
    const ys = all.map(p => p[1]); let y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (metric === 'egfr') { y0 = Math.min(y0, 15); y1 = Math.max(y1, 90); }
    const span = Math.max(y1 - y0, 4); y0 = Math.max(0, y0 - span * .15); y1 += span * .15;
    const X = d => xs.length === 1 ? W / 2 : pad.l + (xs.indexOf(d) / (xs.length - 1)) * (W - pad.l - pad.r);
    const Y = v => pad.t + (1 - (v - y0) / (y1 - y0)) * (H - pad.t - pad.b);
    // stage bands for eGFR
    if (metric === 'egfr') {
      [[90, 999, '#E6F6F0'], [60, 90, '#F0F8F4'], [30, 60, '#FFF6F0'], [0, 30, '#FFE9ED']].forEach(([a, b, col]) => {
        const ya = Y(Math.min(b, y1)), yb = Y(Math.max(a, y0)); if (yb > ya) { ctx.fillStyle = col; ctx.fillRect(pad.l, ya, W - pad.l - pad.r, yb - ya); }
      });
    }
    // grid
    ctx.strokeStyle = '#E6EDEF'; ctx.lineWidth = 1; ctx.fillStyle = '#8AA0A6'; ctx.font = '11px Poppins, sans-serif'; ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) { const v = y0 + (y1 - y0) * i / 4, y = Y(v); ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.fillText(Math.round(v), pad.l - 6, y + 4); }
    ctx.textAlign = 'center';
    const step = Math.ceil(xs.length / 5);
    xs.forEach((d, i) => { if (i % step === 0 || i === xs.length - 1) ctx.fillText(fmt(d), X(d), H - 8); });
    series.forEach(s => {
      if (!s.d.length) return;
      ctx.strokeStyle = s.c; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.beginPath();
      s.d.forEach(([d, v], i) => i ? ctx.lineTo(X(d), Y(v)) : ctx.moveTo(X(d), Y(v))); ctx.stroke();
      s.d.forEach(([d, v]) => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X(d), Y(v), 4.5, 0, 7); ctx.fill(); ctx.strokeStyle = s.c; ctx.lineWidth = 2; ctx.stroke(); });
    });
  }
  // Time Travel — 지난번 대비 비교
  function renderTimeTravel() {
    const es = entries(), L = labs(), l = L[L.length - 1], lp = L[L.length - 2];
    const td = today(), d30 = new Date(td); d30.setDate(d30.getDate() - 30); const d60 = new Date(td); d60.setDate(d60.getDate() - 60);
    const cur = es.filter(e => new Date(e.date) > d30), prev = es.filter(e => new Date(e.date) <= d30 && new Date(e.date) > d60);
    const avg = (arr, k) => { const v = arr.filter(e => e[k] != null).map(e => e[k]); return v.length ? r1(v.reduce((a, b) => a + b, 0) / v.length) : null; };
    const rows = [];
    const row = (label, a, b, unit = '', goodUp = false) => {
      if (a == null && b == null) return;
      let dl = '';
      if (a != null && b != null) { const d = r1(b - a); const cls = d === 0 ? 'flat' : ((d > 0) === goodUp ? 'up' : 'down'); dl = `<span class="delta ${cls}">${d > 0 ? '+' : ''}${d}</span>`; }
      rows.push(`<tr><td>${label}</td><td>${a ?? '–'}</td><td>${b ?? '–'}${unit}${dl}</td></tr>`);
    };
    row(`eGFR ${lp ? fmt(lp.date) + ' → ' + fmt(l.date) : ''}`, lp?.egfr, l?.egfr, '', true);
    row(t('tt_cr'), lp?.cr, l?.cr, '', false);
    row(t('tt_k'), lp?.k, l?.k, '', false);
    row(t('tt_sbp'), avg(prev, 'sbp'), avg(cur, 'sbp'), '', false);
    row(t('tt_dbp'), avg(prev, 'dbp'), avg(cur, 'dbp'), '', false);
    row(t('tt_wt'), avg(prev, 'wt'), avg(cur, 'wt'), 'kg', false);
    $('#timetravel').innerHTML = `<div class="t">${t('tt_title')}<span>TIME TRAVEL</span></div>` + (rows.length ? `<table><tr><td style="color:#8AA0A6;font-size:11px">${t('item')}</td><td style="color:#8AA0A6;font-size:11px;text-align:right">${t('last')}</td><td style="color:#8AA0A6;font-size:11px;text-align:right">${t('now')}</td></tr>${rows.join('')}</table>` : `<div class="empty">${t('tt_empty')}</div>`);
  }

  // ---------- report: The One-Pager ----------
  $('#rep-range').onchange = renderReport;
  function renderReport() {
    const p = S.profile, days = +$('#rep-range').value;
    const from = new Date(today()); from.setDate(from.getDate() - days);
    const es = entries().filter(e => new Date(e.date) > from);
    const L = es.filter(e => e.egfr != null).slice(-6);
    const stat = k => { const v = es.filter(e => e[k] != null).map(e => e[k]); return v.length ? { n: v.length, avg: r1(v.reduce((a, b) => a + b, 0) / v.length), min: Math.min(...v), max: Math.max(...v) } : null; };
    const sb = stat('sbp'), db = stat('dbp'), wt = stat('wt');
    const symCount = {}; es.forEach(e => (e.sym || []).forEach(s => symCount[s] = (symCount[s] || 0) + 1));
    const syms = Object.entries(symCount).sort((a, b) => b[1] - a[1]);
    const notes = es.filter(e => e.note).slice(-6).reverse();
    const first = L[0], last = L[L.length - 1];
    $('#onepager').innerHTML = `
      <div class="hd"><div><h3>${t('op_head', { name: p.name })}</h3><div class="en">The One-Pager · My Beanie</div></div>
      <div class="meta" style="text-align:right">${t('op_meta', { age: new Date().getFullYear() - p.year, sex: p.sex === 'F' ? t('f_short') : t('m_short') })}<br>${t('op_made', { date: today().replace(/-/g, '.') })}<br>${t('op_period', { d: days })}</div></div>
      <h4>${t('op_labs')}</h4>
      ${L.length ? `<table><tr><th>${t('date')}</th><th class="num">Cr</th><th class="num">eGFR</th><th class="num">K</th><th class="num">P</th></tr>${L.map(e => `<tr><td>${e.date}</td><td class="num">${e.cr}</td><td class="num"><b>${e.egfr}</b> ${stage(e.egfr)}</td><td class="num">${e.k ?? '–'}</td><td class="num">${e.p ?? '–'}</td></tr>`).join('')}</table>
      ${first && last && first !== last ? `<div class="meta" style="margin-top:6px">${t('op_change', { a: first.egfr, b: last.egfr, d: (last.egfr - first.egfr > 0 ? '+' : '') + (last.egfr - first.egfr) })}</div>` : ''}` : `<div class="meta">${t('op_no_labs')}</div>`}
      <h4 class="m">${t('op_daily')}</h4>
      <table><tr><th>${t('item')}</th><th class="num">${t('avg')}</th><th class="num">${t('range')}</th><th class="num">${t('count')}</th></tr>
      <tr><td>${t('op_sbp')}</td><td class="num">${sb ? sb.avg : '–'}</td><td class="num">${sb ? sb.min + '–' + sb.max : '–'}</td><td class="num">${sb ? sb.n : 0}</td></tr>
      <tr><td>${t('op_dbp')}</td><td class="num">${db ? db.avg : '–'}</td><td class="num">${db ? db.min + '–' + db.max : '–'}</td><td class="num">${db ? db.n : 0}</td></tr>
      <tr><td>${t('op_wt')}</td><td class="num">${wt ? wt.avg : '–'}</td><td class="num">${wt ? wt.min + '–' + wt.max : '–'}</td><td class="num">${wt ? wt.n : 0}</td></tr></table>
      <h4 class="b">${t('op_signals')}</h4>
      ${syms.length ? syms.map(([s, n]) => `<span class="pill">${symName(s)} ×${n}</span>`).join('') : `<div class="meta">${t('op_no_sym')}</div>`}
      <h4>${t('op_questions')}</h4>
      ${notes.length ? `<ul>${notes.map(e => `<li><span style="color:#8AA0A6;font-family:Poppins">${fmt(e.date)}</span> ${esc(e.note)}</li>`).join('')}</ul>` : `<div class="meta">${t('op_no_notes')}</div>`}
      <div class="foot">${t('op_foot')}</div>`;
  }
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  $('#rep-print').onclick = () => window.print();
  $('#rep-share').onclick = async () => {
    const text = $('#onepager').innerText;
    if (navigator.share) { try { await navigator.share({ title: t('share_title'), text }); } catch (e) {} }
    else { try { await navigator.clipboard.writeText(text); toast(t('copied')); } catch (e) { toast(t('no_share')); } }
  };

  // ---------- settings ----------
  function renderSettings() {
    const p = S.profile; $('#st-name').value = p.name; $('#st-year').value = p.year; $('#st-visit').value = p.visit || ''; segInit('#st-sex', p.sex); segInit('#st-lang', LANG);
  }
  $('#st-save').onclick = () => { S.profile = { name: $('#st-name').value.trim() || S.profile.name, year: +$('#st-year').value || S.profile.year, sex: segVal('#st-sex'), visit: $('#st-visit').value }; save(); const nl = segVal('#st-lang'); if (nl && nl !== LANG) { try { localStorage.setItem('mybeanie.lang', nl); } catch (e) {} location.href = location.pathname + (DEMO ? '?demo&' : '?') + 'lang=' + nl; return; } toast(t('saved')); go('home'); };
  $('#st-export').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); a.download = `mybeanie-${today()}.json`; a.click(); };
  $('#st-import').onclick = () => $('#st-file').click();
  $('#st-file').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(txt => { const j = JSON.parse(txt); if (!j.entries) throw 0; S = j; migrate(); save(); toast(t('imported')); go('home'); }).catch(() => toast(t('bad_file'))); };
  $('#st-reset').onclick = () => { if (confirm(t('reset_confirm'))) { localStorage.removeItem(KEY); location.reload(); } };

  // ---------- misc ----------
  let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800); }
  window.addEventListener('resize', () => $('#v-trend').classList.contains('on') && drawChart());
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  if (DEMO) { const b = document.createElement('div'); b.className = 'demo-bar'; b.innerHTML = `${t('demo_bar')} &nbsp;<a href="./?lang=${LANG}">${t('demo_link')}</a>`; document.body.prepend(b); }
  applyI18n(); $('#site-link').href = LANG === 'en' ? 'https://kidneybloom.com/en/' : 'https://kidneybloom.com'; segInit('#ob-lang', LANG, v => { try { localStorage.setItem('mybeanie.lang', v); } catch (e) {} location.href = location.pathname + (DEMO ? '?demo&' : '?') + 'lang=' + v; });
  go(S.profile ? 'home' : 'onboard');
})();
