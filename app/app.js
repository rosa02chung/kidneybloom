/* My Beanie v0.1 — 콩팥 건강 일지 (PWA) */
(() => {
  const KEY = 'mybeanie.v1';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const today = () => new Date().toISOString().slice(0, 10);
  const fmt = d => d.replace(/-/g, '.').slice(2); // 26.09.17
  const r1 = n => Math.round(n * 10) / 10;

  // ---------- state ----------
  let S = load();
  function load() {
    try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && j.entries) return j; } catch (e) {}
    return { profile: null, entries: [], symChips: [] };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('저장 공간을 사용할 수 없어요'); } }

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
    const name = $('#ob-name').value.trim() || '친구', year = +$('#ob-year').value;
    if (!year || year < 1920 || year > 2020) return toast('출생연도를 확인해 주세요');
    S.profile = { name, year, sex: segVal('#ob-sex'), visit: $('#ob-visit').value || '' };
    save(); go('home'); toast(`반가워요, ${name}님`);
  };

  // ---------- home ----------
  const entries = () => [...S.entries].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.ts - b.ts);
  const labs = () => entries().filter(e => e.egfr != null);
  function renderHome() {
    const p = S.profile, es = entries();
    $('#home-hello').textContent = `안녕하세요, ${p.name}님`;
    // kpis
    const L = labs(), l = L[L.length - 1], lp = L[L.length - 2];
    $('#kpi-egfr').innerHTML = l ? `${l.egfr}<small> ${stage(l.egfr)}</small>` : '–';
    const dE = $('#kpi-egfr-d'); dE.className = 'd';
    if (l && lp) { const d = l.egfr - lp.egfr; dE.textContent = `지난번 대비 ${d > 0 ? '+' : ''}${d}`; dE.classList.add(d > 0 ? 'up' : d < 0 ? 'down' : ''); }
    else dE.textContent = l ? fmt(l.date) : '크레아티닌을 입력하면 계산돼요';
    const bps = es.filter(e => e.sbp), b = bps[bps.length - 1];
    $('#kpi-bp').innerHTML = b ? `${b.sbp}<small>/${b.dbp || '–'}</small>` : '–';
    $('#kpi-bp-d').textContent = b ? fmt(b.date) : '최근 기록 없음';
    const wts = es.filter(e => e.wt), w = wts[wts.length - 1];
    $('#kpi-wt').innerHTML = w ? `${w.wt}<small> kg</small>` : '–';
    $('#kpi-wt-d').textContent = w ? fmt(w.date) : '최근 기록 없음';
    // visit
    const vc = $('#visit-card');
    if (p.visit) {
      const dd = Math.ceil((new Date(p.visit) - new Date(today())) / 864e5);
      vc.innerHTML = `<div><div class="l">다음 진료 · ${p.visit.replace(/-/g, '.')}</div><div class="n">${dd >= 0 ? 'D-' + dd : '지남'}<small>${dd === 0 ? '오늘' : ''}</small></div></div><button class="btn primary" data-go="report">한 장 리포트</button>`;
    } else vc.innerHTML = `<div class="l">다음 진료일을 설정하면 리포트 준비를 알려드려요</div><button class="btn ghost" data-go="settings">설정</button>`;
    // nudge
    $('#nudge').innerHTML = nudge(es, p);
    // list
    const list = $('#home-list'); const rec = es.slice(-5).reverse();
    list.innerHTML = rec.length ? rec.map(item).join('') : '<div class="empty">아직 기록이 없어요. 아래 ＋ 기록에서 시작해 보세요.</div>';
    list.querySelectorAll('.del').forEach(btn => btn.onclick = () => { if (confirm('이 기록을 삭제할까요?')) { S.entries = S.entries.filter(e => e.id !== btn.dataset.id); save(); renderHome(); } });
  }
  function item(e) {
    const m = [];
    if (e.egfr != null) m.push(`eGFR <b>${e.egfr}</b>`);
    if (e.sbp) m.push(`혈압 <b>${e.sbp}/${e.dbp || '–'}</b>`);
    if (e.wt) m.push(`<b>${e.wt}</b>kg`);
    if (e.k) m.push(`K <b>${e.k}</b>`);
    return `<div class="item"><div><div class="dt">${e.date}</div><div class="m">${m.join(' · ') || (e.note ? '메모' : '기록')}</div>${e.sym?.length ? `<div class="sy">${e.sym.join(' · ')}</div>` : ''}</div><button class="del" data-id="${e.id}" aria-label="삭제">×</button></div>`;
  }
  // The Quiet Nudge — 한 번에 한 줄만
  function nudge(es, p) {
    const last = es[es.length - 1];
    const days = last ? Math.floor((new Date(today()) - new Date(last.date)) / 864e5) : null;
    if (p.visit) {
      const dd = Math.ceil((new Date(p.visit) - new Date(today())) / 864e5);
      if (dd >= 0 && dd <= 3) return `<div><b>진료 D-${dd}.</b> 한 장 리포트가 준비돼 있어요. 궁금한 점을 메모에 적어두면 함께 정리돼요.</div>`;
    }
    const bp3 = es.filter(e => e.sbp).slice(-3);
    if (bp3.length === 3 && bp3.every(e => e.sbp >= 140 || (e.dbp || 0) >= 90)) return `<div><b>최근 세 번 혈압이 높은 편이에요.</b> 진료 때 꼭 이야기해 보세요.</div>`;
    const sym = es.slice(-3).flatMap(e => e.sym || []); const swell = sym.filter(s => s === '붓기').length;
    if (swell >= 2) return `<div><b>붓기가 이어지고 있네요.</b> 오늘 체중을 함께 적어두면 진료 때 도움이 돼요.</div>`;
    if (!last) return `<div><b>첫 기록을 남겨 볼까요?</b> 검사 결과지가 없어도 혈압이나 몸의 신호만으로 충분해요.</div>`;
    if (days >= 7) return `<div><b>${days}일 만이에요.</b> 오늘 몸은 어떤가요? 한 줄이면 충분해요.</div>`;
    return `<div>잘 이어가고 있어요, ${p.name}님. <b>오늘도 한 줄</b>이면 충분해요.</div>`;
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
    if (!e.cr && !e.sbp && !e.wt && !e.sym.length && !e.note && !e.k && !e.p) return toast('한 가지라도 적어 주세요');
    S.entries.push(e); save();
    f.reset(); sym.clear(); $$('#sym-chips button').forEach(b => b.classList.remove('on')); $('#egfr-preview').textContent = '';
    toast('저장했어요'); go('home');
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
    const t = today(), d30 = new Date(t); d30.setDate(d30.getDate() - 30); const d60 = new Date(t); d60.setDate(d60.getDate() - 60);
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
    row('크레아티닌', lp?.cr, l?.cr, '', false);
    row('칼륨 K', lp?.k, l?.k, '', false);
    row('수축기 혈압 (30일 평균)', avg(prev, 'sbp'), avg(cur, 'sbp'), '', false);
    row('이완기 혈압 (30일 평균)', avg(prev, 'dbp'), avg(cur, 'dbp'), '', false);
    row('체중 (30일 평균)', avg(prev, 'wt'), avg(cur, 'wt'), 'kg', false);
    $('#timetravel').innerHTML = `<div class="t">지난번 대비 비교<span>TIME TRAVEL</span></div>` + (rows.length ? `<table><tr><td style="color:#8AA0A6;font-size:11px">항목</td><td style="color:#8AA0A6;font-size:11px;text-align:right">지난번</td><td style="color:#8AA0A6;font-size:11px;text-align:right">이번</td></tr>${rows.join('')}</table>` : `<div class="empty">두 번 이상 기록하면 비교가 시작돼요</div>`);
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
      <div class="hd"><div><h3>${p.name}님의 진료 전 한 장</h3><div class="en">The One-Pager · My Beanie</div></div>
      <div class="meta" style="text-align:right">${new Date().getFullYear() - p.year}세 · ${p.sex === 'F' ? '여' : '남'}<br>작성 ${today().replace(/-/g, '.')}<br>최근 ${days}일</div></div>
      <h4>검사 수치 (eGFR: CKD-EPI 2021)</h4>
      ${L.length ? `<table><tr><th>날짜</th><th class="num">Cr</th><th class="num">eGFR</th><th class="num">K</th><th class="num">P</th></tr>${L.map(e => `<tr><td>${e.date}</td><td class="num">${e.cr}</td><td class="num"><b>${e.egfr}</b> ${stage(e.egfr)}</td><td class="num">${e.k ?? '–'}</td><td class="num">${e.p ?? '–'}</td></tr>`).join('')}</table>
      ${first && last && first !== last ? `<div class="meta" style="margin-top:6px">기간 내 변화: eGFR ${first.egfr} → ${last.egfr} (${last.egfr - first.egfr > 0 ? '+' : ''}${last.egfr - first.egfr})</div>` : ''}` : `<div class="meta">기간 내 검사 수치 기록 없음</div>`}
      <h4 class="m">일상 측정</h4>
      <table><tr><th>항목</th><th class="num">평균</th><th class="num">범위</th><th class="num">횟수</th></tr>
      <tr><td>수축기 혈압</td><td class="num">${sb ? sb.avg : '–'}</td><td class="num">${sb ? sb.min + '–' + sb.max : '–'}</td><td class="num">${sb ? sb.n : 0}</td></tr>
      <tr><td>이완기 혈압</td><td class="num">${db ? db.avg : '–'}</td><td class="num">${db ? db.min + '–' + db.max : '–'}</td><td class="num">${db ? db.n : 0}</td></tr>
      <tr><td>체중 (kg)</td><td class="num">${wt ? wt.avg : '–'}</td><td class="num">${wt ? wt.min + '–' + wt.max : '–'}</td><td class="num">${wt ? wt.n : 0}</td></tr></table>
      <h4 class="b">몸의 신호 (기간 내 횟수)</h4>
      ${syms.length ? syms.map(([s, n]) => `<span class="pill">${s} ×${n}</span>`).join('') : '<div class="meta">기록된 증상 없음</div>'}
      <h4>의사에게 물어볼 것</h4>
      ${notes.length ? `<ul>${notes.map(e => `<li><span style="color:#8AA0A6;font-family:Poppins">${fmt(e.date)}</span> ${esc(e.note)}</li>`).join('')}</ul>` : '<div class="meta">메모 없음 — 기록 화면에서 궁금한 점을 적어두세요</div>'}
      <div class="foot">환자가 직접 기록한 개인 건강기록이며 의료기기가 아닙니다. eGFR은 CKD-EPI 2021(인종 미포함) 식으로 계산한 참고값이며, 판단은 담당 의료진에게 있습니다. kidneybloom.com</div>`;
  }
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  $('#rep-print').onclick = () => window.print();
  $('#rep-share').onclick = async () => {
    const text = $('#onepager').innerText;
    if (navigator.share) { try { await navigator.share({ title: 'My Beanie 진료 전 한 장', text }); } catch (e) {} }
    else { try { await navigator.clipboard.writeText(text); toast('텍스트를 복사했어요'); } catch (e) { toast('공유를 지원하지 않는 브라우저예요'); } }
  };

  // ---------- settings ----------
  function renderSettings() {
    const p = S.profile; $('#st-name').value = p.name; $('#st-year').value = p.year; $('#st-visit').value = p.visit || ''; segInit('#st-sex', p.sex);
  }
  $('#st-save').onclick = () => { S.profile = { name: $('#st-name').value.trim() || S.profile.name, year: +$('#st-year').value || S.profile.year, sex: segVal('#st-sex'), visit: $('#st-visit').value }; save(); toast('저장했어요'); go('home'); };
  $('#st-export').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); a.download = `mybeanie-${today()}.json`; a.click(); };
  $('#st-import').onclick = () => $('#st-file').click();
  $('#st-file').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { const j = JSON.parse(t); if (!j.entries) throw 0; S = j; save(); toast('가져왔어요'); go('home'); }).catch(() => toast('파일을 읽을 수 없어요')); };
  $('#st-reset').onclick = () => { if (confirm('모든 기록과 설정을 삭제할까요? 되돌릴 수 없어요.')) { localStorage.removeItem(KEY); location.reload(); } };

  // ---------- misc ----------
  let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800); }
  window.addEventListener('resize', () => $('#v-trend').classList.contains('on') && drawChart());
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  go(S.profile ? 'home' : 'onboard');
})();
