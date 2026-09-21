/* Family page — Mirrored Care viewer on the website (no login; link = key). Shares payload format with app/mirror.js */
(() => {
  const EN = document.documentElement.lang === 'en';
  const T = EN ? {
    sym: { swelling: 'Swelling', fatigue: 'Fatigue', itching: 'Itching', appetite: 'Low appetite', breath: 'Short of breath', headache: 'Headache', foamy: 'Foamy urine', nocturia: 'Night urination', sleep: 'Poor sleep' },
    foods: { eatout: 'Ate out', delivery: 'Delivery', soup: 'Soup / stew', fruit: 'Fruit', nuts: 'Nuts', dairy: 'Dairy', processed: 'Processed food', alcohol: 'Alcohol' },
    title: n => n ? `${n}'s mirror card` : 'A family mirror card', badge: (d, n) => `As of ${d} · last ${n} days · read-only`,
    labs: 'Lab values (eGFR, CKD-EPI 2021)', daily: 'Blood pressure · weight', signals: 'Body signals (count)', food: 'Meal patterns (count)', q: 'Questions for the doctor',
    none: 'Nothing logged', keep: 'Keep in this browser', kept: 'Saved', remove: 'Remove', bad: 'Could not read this link. Paste the whole link the sender shared.',
    demoName: 'Jane', demoNote1: 'My ankles swell every evening — is that okay?', demoNote2: 'Is my protein intake about right?', empty: 'No saved cards yet.',
    bp: 'Blood pressure', wt: 'Weight', latest: 'Latest',
  } : {
    sym: { swelling: '붓기', fatigue: '피로', itching: '가려움', appetite: '식욕저하', breath: '숨참', headache: '두통', foamy: '거품뇨', nocturia: '야간뇨', sleep: '잠 설침' },
    foods: { eatout: '외식', delivery: '배달', soup: '국·찌개', fruit: '과일', nuts: '견과', dairy: '유제품', processed: '가공식품', alcohol: '음주' },
    title: n => n ? `${n}님의 미러 카드` : '가족의 미러 카드', badge: (d, n) => `${d} 기준 · 최근 ${n}일 · 읽기 전용`,
    labs: '검사 수치 (eGFR, CKD-EPI 2021)', daily: '혈압 · 체중', signals: '몸의 신호 (횟수)', food: '식사 패턴 (횟수)', q: '의사에게 물어볼 것',
    none: '기록 없음', keep: '이 브라우저에 저장', kept: '저장했어요', remove: '삭제', bad: '링크를 읽을 수 없어요. 보낸 사람이 공유한 링크 전체를 붙여넣어 주세요.',
    demoName: '영희', demoNote1: '저녁마다 발목이 붓는데 괜찮은가요?', demoNote2: '단백질 섭취량이 적당한지 궁금해요', empty: '저장된 카드가 아직 없어요.',
    bp: '혈압', wt: '체중', latest: '최근 값',
  };
  const stage = g => g >= 90 ? 'G1' : g >= 60 ? 'G2' : g >= 45 ? 'G3a' : g >= 30 ? 'G3b' : g >= 15 ? 'G4' : 'G5';
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const fmt = d => d.replace(/-/g, '.').slice(2);
  const KEY = 'kb.family.cards';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = l => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} };

  // ---- render one card (desktop layout) ----
  function card(p, opts = {}) {
    const has = k => p.i.includes(k), E = p.e, num = v => v == null ? '–' : v;
    const last = idx => [...E].reverse().find(r => r[idx] != null);
    const tiles = [];
    if (has('egfr')) { const r = last(1); tiles.push(`<div class="mk pink"><div class="k">eGFR</div><div class="v en">${r ? r[1] + '<small> ' + stage(r[1]) + '</small>' : '–'}</div><div class="d">${r ? fmt(r[0]) : ''}</div></div>`); }
    if (has('bp')) { const r = last(3); tiles.push(`<div class="mk mint"><div class="k">${T.bp}</div><div class="v en">${r ? r[3] + '<small>/' + num(r[4]) + '</small>' : '–'}</div><div class="d">${r ? fmt(r[0]) : ''}</div></div>`); }
    if (has('wt')) { const r = last(5); tiles.push(`<div class="mk blue"><div class="k">${T.wt}</div><div class="v en">${r ? r[5] + '<small> kg</small>' : '–'}</div><div class="d">${r ? fmt(r[0]) : ''}</div></div>`); }
    const secs = [];
    if (p.s === 'trend' && has('egfr')) { const rows = E.filter(r => r[1] != null); secs.push(`<div class="ms"><h5>${T.labs}</h5>${rows.length ? `<table>${rows.map(r => `<tr><td>${r[0]}</td><td class="num">Cr ${num(r[2])}</td><td class="num"><b>${r[1]}</b> ${stage(r[1])}</td></tr>`).join('')}</table>` : `<div class="none">${T.none}</div>`}</div>`); }
    if (p.s === 'trend' && (has('bp') || has('wt'))) { const rows = E.filter(r => r[3] != null || r[5] != null).slice(-10); secs.push(`<div class="ms m"><h5>${T.daily}</h5>${rows.length ? `<table>${rows.map(r => `<tr><td>${r[0]}</td><td class="num">${has('bp') && r[3] != null ? r[3] + '/' + num(r[4]) : ''}</td><td class="num">${has('wt') && r[5] != null ? r[5] + ' kg' : ''}</td></tr>`).join('')}</table>` : `<div class="none">${T.none}</div>`}</div>`); }
    const pills = (idx, dict, cls) => { const c = {}; E.forEach(r => (r[idx] || []).forEach(s => c[s] = (c[s] || 0) + 1)); const a = Object.entries(c).sort((x, y) => y[1] - x[1]); return a.length ? a.map(([s, n]) => `<span class="pl ${cls}">${dict[s] || s} ×${n}</span>`).join('') : `<div class="none">${T.none}</div>`; };
    if (has('sym')) secs.push(`<div class="ms b"><h5>${T.signals}</h5>${pills(6, T.sym, 'c')}</div>`);
    if (has('food')) secs.push(`<div class="ms m"><h5>${T.food}</h5>${pills(7, T.foods, 'g')}</div>`);
    if (has('notes')) { const rows = E.filter(r => r[8]).slice(-6).reverse(); secs.push(`<div class="ms"><h5>${T.q}</h5>${rows.length ? `<ul>${rows.map(r => `<li><span class="en dt">${fmt(r[0])}</span> ${esc(r[8])}</li>`).join('')}</ul>` : `<div class="none">${T.none}</div>`}</div>`); }
    return `<article class="mcard${opts.demo ? ' demo' : ''}">
      <header><div><div class="mt">${esc(T.title(p.n))}</div><div class="mb">${T.badge(p.at.replace(/-/g, '.'), p.d)}</div></div>${opts.actions || ''}</header>
      ${tiles.length ? `<div class="mks" style="grid-template-columns:repeat(${tiles.length},1fr)">${tiles.join('')}</div>` : ''}
      <div class="msecs">${secs.join('')}</div></article>`;
  }

  // ---- demo payload (same shape the app produces) ----
  function demoPayload() {
    const t = new Date(), d = n => { const x = new Date(t); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
    const rows = [[92, 47, 1.34, 142, 89, 63.4, ['fatigue'], ['eatout', 'alcohol'], ''], [80, null, null, 138, 86, 63.1, ['fatigue', 'nocturia'], ['delivery', 'processed'], ''], [68, null, null, 135, 84, 62.9, [], [], ''],
      [56, 51, 1.29, 133, 82, 62.6, ['swelling'], [], T.demoNote1], [44, null, null, 131, 81, 62.5, ['swelling', 'nocturia'], ['eatout', 'soup'], ''], [30, null, null, 129, 80, 62.3, [], ['fruit', 'soup'], ''],
      [18, 54, 1.22, 128, 79, 62.1, [], [], T.demoNote2], [9, null, null, 127, 78, 62.0, ['fatigue'], ['fruit', 'dairy'], ''], [2, null, null, 126, 78, 61.9, [], [], '']];
    return { v: 1, n: T.demoName, d: 90, s: 'trend', at: t.toISOString().slice(0, 10), i: ['egfr', 'bp', 'food', 'notes'], e: rows.map(([n, g, cr, s, di, w, sy, fo, no]) => [d(n), g, cr, s, di, w, sy, fo, no]) };
  }

  // ---- wire up ----
  const $ = s => document.querySelector(s);
  const demoBox = $('#demo-card');
  if (demoBox) { const p = demoPayload(); demoBox.innerHTML = card(p, { demo: true }); $('#demo-latest').onclick = () => { demoBox.innerHTML = card({ ...p, s: 'latest', i: ['egfr', 'bp'] }, { demo: true }); }; $('#demo-trend').onclick = () => { demoBox.innerHTML = card(p, { demo: true }); }; }

  const viewer = $('#viewer'), saved = $('#saved');
  let current = null;
  function showCurrent() {
    if (!current) { viewer.innerHTML = ''; return; }
    viewer.innerHTML = card(current, { actions: `<button class="btn btn-primary btn-sm" id="keep">${T.keep}</button>` });
    $('#keep').onclick = () => { const l = load().filter(x => !(x.n === current.n && x.at === current.at)); l.unshift(current); save(l.slice(0, 12)); renderSaved(); $('#keep').textContent = T.kept; };
  }
  function renderSaved() {
    const l = load();
    saved.innerHTML = l.length ? l.map((p, i) => card(p, { actions: `<button class="btn btn-ghost btn-sm" data-rm="${i}">${T.remove}</button>` })).join('') : `<p class="note">${T.empty}</p>`;
    saved.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { const x = load(); x.splice(+b.dataset.rm, 1); save(x); renderSaved(); });
  }
  async function openCode(code) {
    try { current = await Mirror.decode(code.trim()); showCurrent(); viewer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    catch (e) { viewer.innerHTML = `<p class="note" style="color:var(--coral-deep)">${T.bad}</p>`; }
  }
  function fromHash() { const m = location.hash.match(/#m=([^&]+)/); if (m) { openCode(m[1]); history.replaceState(null, '', location.pathname + location.search); return true; } return false; }
  $('#open-link').onclick = () => { const v = $('#link-input').value.trim(); const m = v.match(/#m=([^&\s]+)/); openCode(m ? m[1] : v); };
  renderSaved(); if (!fromHash()) showCurrent();
  window.addEventListener('hashchange', fromHash);
})();
