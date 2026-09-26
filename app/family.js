/* My Beanie — 이용권(기관 스폰서) · 가족 연결 · 패밀리 플랜 · 보호자 화면  (v0.6, 설계 데모)
   원칙: 환자 기록 기능은 언제나 무료. 기관이 이용권을 일괄 구매해 초대 코드로 배포(B2B),
         보호자 쪽 기능만 유료(B2C). 기관 스폰서 환자는 보호자 1명 무료 포함.
   서버가 없는 단계라 코드 연결·결제·실시간 동기화는 데모에서만 동작 (정식 출시 전). */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const Q = new URLSearchParams(location.search);
  const DEMO = /[?&]demo/.test(location.search), FAM = Q.get('demo') === 'family';
  const EN = (window.LANG || 'ko') === 'en';
  const FKEY = DEMO ? 'mybeanie.family.demo' : 'mybeanie.family';
  const SKEY = DEMO ? (/demo=hd/.test(location.search) ? 'mybeanie.demo.hd' : /demo=pre/.test(location.search) ? 'mybeanie.demo.pre' : 'mybeanie.demo') : 'mybeanie.v1';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const K = {
    ko: {
      st_card: '이용권 · 서포터', st_card_sub: '병원·시설 초대 코드 · 함께 보는 서포터 · 서포터 플랜', st_open: '열기',
      plan_title: '이용권 · 서포터', my_pass: '내 이용권',
      free_t: '개인 무료 이용 중', free_d: '기록 · 추이 · 진료 전 한 장 · 미러 카드는 모두 무료예요.',
      code_t: '초대 코드가 있나요?', code_d: '다니는 신장내과 · 투석실이나 사는 곳(시니어 레지던스 등)에서 받은 코드를 입력하면 기관이 제공하는 이용권이 연결돼요.',
      code_ph: '예: MB-7K2Q-HANB', code_btn: '연결', code_bad: '코드 형식을 확인해 주세요', code_soon: '코드 연결은 정식 출시 후 가능해요 (지금은 데모에서만)',
      sp_badge: 'Sponsored', sp_by: '{org} 제공 이용권', sp_until: '{date}까지',
      sp_inc: ['모든 기록 기능 · 투석 Special', '진료 전 한 장을 병원과 공유 (내가 허락할 때)', '함께 보는 서포터 1명 무료'],
      sp_priv: '병원은 내가 허락한 기록만 볼 수 있어요. 허락은 언제든 거둘 수 있어요.',
      fa_inc: ['모든 기록 기능 · 나를 알아가는 기록', '웰니스 라운지 월 1회 기록 클래스', '함께 보는 서포터 1명 무료'],
      fa_priv: '시설에는 이름 없는 참여 통계만 전달돼요. 내 기록은 내가 허락한 가족과 병원만 봐요.', fa_badge: 'Community', fa_org: '[데모] 마곡 시니어 레지던스',
      sp_leave: '연결 해제',
      fam_t: '함께 보는 서포터', fam_d: '가족·친구·돌봄 담당자 누구든. 내가 고른 항목만 읽기 전용으로 봐요.',
      fam_free: '무료 포함', fam_paid: '패밀리 플랜', fam_on: '연결됨 · {date}', fam_add: '＋ 서포터 초대하기',
      fam_more: '두 번째 서포터부터는 패밀리 플랜, 포함된 1명분을 뺀 차액 월 4,900원', fam_more_free: '서포터 연결은 서포터 플랜(월 4,900원)부터예요. 링크 한 번 보내기(미러 카드)는 무료예요.',
      fam_invited: '초대 링크를 보냈어요 (데모)',
      share_t: '서포터가 볼 수 있는 것', share_d: '언제든 끄고 켤 수 있어요. 끈 항목은 서포터 화면에서 바로 사라져요.',
      sh: { days: '기록한 날짜', bp: '혈압', wt: '체중', labs: '검사 수치', sym: '몸의 신호', food: '식사 패턴', notes: '의사에게 물어볼 것' },
      see_plans: '서포터 플랜 보기', see_guard: '보호자 화면 미리보기',
      price_title: '서포터 플랜', price_lead: '기록하는 사람은 언제나 무료. 곁에서 함께 보는 서포터를 위한 구독이에요. 가족이 아니어도 괜찮아요.',
      price_tag: '출시 전 · 가격은 가정',
      p_free: '무료', p_basic: '기본', p_free_d: ['미러 카드 링크로 한 번씩 공유', '받은 카드 저장 10개'],
      p_one: '서포터', p_one_d: ['함께 보는 사람 1명 연결 (가족·친구·돌봄 담당자)', '자동 갱신되는 서포터 화면', '기록 멈춤 · 진료일 알림', '안부 보내기'],
      p_fam: '패밀리', p_fam_d: ['서포터 3명까지 연결', '서포터 플랜의 모든 기능', '서포터끼리 서로 안부 보기'],
      p_plus: '패밀리 플러스', p_plus_d: ['부모님 두 분 이상 함께 관리', '서포터 5명까지', '진료 전 한 장 함께 쓰기', '진료 동행 메모'],
      mo: '/월', yr: '연 {v}원', per: '1인당 월 {v}원', pop: '추천',
      sp_note: '병원·시설 이용권이 있으면 보호자 1명은 무료예요. 상위 플랜은 1인분(4,900원)을 뺀 차액만 내요.', sp_fam: '이용권 서포터 월 {v}원', sp_in: '병원·시설 이용권에 포함', trial: '월 또는 연 단위 결제 · 언제든 해지',
      notify: '출시 알림 받기', notified: '출시되면 알려드릴게요 (데모)',
      g_title: '{name} 님의 기록', g_sub: '{me} 님이 보는 보호자 화면', g_badge: '{name} 님이 허락한 항목만 보여요 · 읽기 전용',
      g_last: '마지막 기록', g_days: '최근 28일 기록', g_visit: '다음 진료', g_ago: '{n}일 전', g_today: '오늘', g_cnt: '{n}일',
      g_cal: '기록한 날', g_recent: '최근 혈압 · 체중', g_q: '진료 때 물어볼 것',
      g_alert_t: '알림', g_alerts: ['기록이 3일 멈추면 알려주기', '진료 전날 알려주기', '새 질문이 생기면 알려주기'],
      g_no_judge: '수치가 좋다·나쁘다를 판단하는 알림은 보내지 않아요. 판단은 의료진과 함께해요.',
      g_cheer: '안부 보내기', g_cheered: '안부를 보냈어요 (데모)', g_back: '환자 화면으로',
      org: '[데모] 한빛내과의원', me: '지은', rel: '딸', me2: '민호', rel2: '아들', mom: '엄마',
      won: '원'
    },
    en: {
      st_card: 'Pass · Supporters', st_card_sub: 'Sponsor code · supporters · Supporter plans', st_open: 'Open',
      plan_title: 'Pass · Supporters', my_pass: 'My pass',
      free_t: 'Using My Beanie for free', free_d: 'Logging, trends, the pre-visit one-pager and mirror cards are all free.',
      code_t: 'Have an invite code?', code_d: 'Enter the code from your kidney clinic, dialysis unit or residence to link the pass they provide.',
      code_ph: 'e.g. MB-7K2Q-HANB', code_btn: 'Link', code_bad: 'Please check the code format', code_soon: 'Code linking opens at launch (demo only for now)',
      sp_badge: 'Sponsored', sp_by: 'Pass provided by {org}', sp_until: 'until {date}',
      sp_inc: ['All logging · Dialysis Special', 'Share the one-pager with the clinic (when you allow)', '1 family viewer included'],
      sp_priv: 'The clinic sees only the records you allow. You can withdraw that any time.',
      fa_inc: ['All logging · know-yourself records', 'Monthly logging class in the wellness lounge', '1 family viewer included'],
      fa_priv: 'The residence only receives anonymous participation stats. Your records go only to family and clinics you allow.', fa_badge: 'Community', fa_org: '[Demo] Magok Senior Residence',
      sp_leave: 'Unlink',
      fam_t: 'Supporters who can see', fam_d: 'Family, a friend or a care worker. They see only the items you pick, read-only.',
      fam_free: 'Included', fam_paid: 'Family plan', fam_on: 'Linked · {date}', fam_add: '＋ Invite a supporter',
      fam_more: 'A Family plan from the second supporter; you pay only the 4,900 KRW difference', fam_more_free: 'Linking a supporter starts with the Supporter plan (4,900 KRW/mo). One-off mirror card links stay free.',
      fam_invited: 'Invite link sent (demo)',
      share_t: 'What supporters can see', share_d: 'Toggle any time. Items you switch off disappear from their screen.',
      sh: { days: 'Days logged', bp: 'Blood pressure', wt: 'Weight', labs: 'Lab values', sym: 'Body signals', food: 'Meal patterns', notes: 'Questions for the doctor' },
      see_plans: 'See Supporter plans', see_guard: 'Preview caregiver view',
      price_title: 'Supporter Plans', price_lead: 'The person logging is always free. A subscription for the supporters beside them. They need not be family.',
      price_tag: 'Pre-launch · prices are assumptions',
      p_free: 'Free', p_basic: 'Basic', p_free_d: ['Share via one-off mirror card links', 'Keep up to 10 received cards'],
      p_one: 'Supporter', p_one_d: ['1 supporter (family, friend or care worker)', 'Auto-updating family view', 'Paused-logging & visit reminders', 'Send a check-in'],
      p_fam: 'Family', p_fam_d: ['Up to 3 supporters', 'Everything in Supporter', 'Supporters see each other\'s check-ins'],
      p_plus: 'Family Plus', p_plus_d: ['Care for two or more parents', 'Up to 5 supporters', 'Co-write the one-pager', 'Visit companion notes'],
      mo: '/mo', yr: '{v} KRW / yr', per: '{v} KRW per person', pop: 'Popular',
      sp_note: 'With a clinic or residence pass, one viewer is free. Higher plans cost only the difference (minus 4,900 KRW).', sp_fam: 'Pass supporter {v} KRW/mo', sp_in: 'Included with your pass', trial: 'Monthly or annual billing · cancel any time',
      notify: 'Notify me at launch', notified: 'We will let you know (demo)',
      g_title: "{name}'s records", g_sub: 'Caregiver view for {me}', g_badge: 'Only items {name} allowed · read-only',
      g_last: 'Last log', g_days: 'Last 28 days', g_visit: 'Next visit', g_ago: '{n}d ago', g_today: 'Today', g_cnt: '{n} days',
      g_cal: 'Days logged', g_recent: 'Recent BP · weight', g_q: 'Questions for the visit',
      g_alert_t: 'Alerts', g_alerts: ['Tell me if logging pauses for 3 days', 'Remind me the day before a visit', 'Tell me when a new question is added'],
      g_no_judge: 'No alerts judge values as good or bad. That judgement belongs with the care team.',
      g_cheer: 'Send a check-in', g_cheered: 'Check-in sent (demo)', g_back: 'Back to patient view',
      org: '[Demo] Hanbit Clinic', me: 'Jieun', rel: 'daughter', me2: 'Minho', rel2: 'son', mom: 'Mom',
      won: ' KRW'
    }
  };
  const L = K[EN ? 'en' : 'ko'];
  const f = (s, o = {}) => s.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? '');
  const toast = m => { const el = $('#toast'); el.textContent = m; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 1800); };
  const dstr = n => { const x = new Date(); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10).replace(/-/g, '.'); };

  // ---------- state ----------
  function demoFam(state) {
    if (state === 'none') return { sponsor: null, family: [], share: { days: 1, bp: 1, wt: 1, labs: 0, sym: 1, food: 0, notes: 1 } };
    if (state === 'facility') return { sponsor: { org: L.fa_org, until: dstr(340), code: 'MB-RS26-MAGK', kind: 'facility' }, family: [{ name: L.me, rel: L.rel, since: dstr(-20), free: 1 }], share: { days: 1, bp: 1, wt: 1, labs: 0, sym: 1, food: 0, notes: 1 } };
    return { sponsor: { org: L.org, until: dstr(280), code: 'MB-7K2Q-HANB' }, family: [{ name: L.me, rel: L.rel, since: dstr(-41), free: 1 }], share: { days: 1, bp: 1, wt: 1, labs: 0, sym: 1, food: 0, notes: 1 } };
  }
  let F;
  try { F = JSON.parse(localStorage.getItem(FKEY)); } catch (e) {}
  if (FAM && Q.get('state')) F = demoFam(Q.get('state'));
  if (!F) F = DEMO ? demoFam(FAM ? 'sponsored' : 'none') : { sponsor: null, family: [], share: { days: 1, bp: 1, wt: 1, labs: 0, sym: 1, food: 0, notes: 1 } };
  const saveF = () => { try { localStorage.setItem(FKEY, JSON.stringify(F)); } catch (e) {} };
  const S = () => { try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) { return {}; } };

  // ---------- views ----------
  const app = $('#app');
  const view = (id, html) => { const s = document.createElement('section'); s.className = 'view'; s.id = id; s.innerHTML = html; app.appendChild(s); return s; };
  view('v-plan', ''); view('v-price', ''); view('v-guard', '');
  function show(id) {
    $$('.view').forEach(x => x.classList.toggle('on', x.id === id));
    $$('.tabbar button').forEach(b => b.classList.remove('on'));
    $('#tabbar').classList.toggle('hidden', id !== 'v-plan');
    window.scrollTo(0, 0);
    ({ 'v-plan': renderPlan, 'v-price': renderPrice, 'v-guard': renderGuard })[id]();
  }
  const toSettings = () => { const b = $('#v-home .icon-btn[data-go=settings]'); if (b) b.click(); };

  // settings entry card
  const card = document.createElement('div'); card.className = 'card form fam-entry';
  card.innerHTML = `<div class="grp-t">${L.st_card} <span class="en tag">Pass · Supporters</span></div><p class="tiny" style="text-align:left;margin:4px 0 0">${L.st_card_sub}</p><button class="btn ghost" id="fam-open">${L.st_open}</button>`;
  const anchor = $('#v-settings .card.form'); anchor && anchor.after(card);
  $('#fam-open').onclick = () => show('v-plan');

  function renderPlan() {
    const sp = F.sponsor, fam = F.family, freeSlots = sp ? 1 : 0;
    const passHtml = sp ? `
      <div class="card fam-pass sp">
        <div class="fp-top"><span class="fp-badge en">${sp.kind === 'facility' ? L.fa_badge : L.sp_badge}</span><span class="fp-until">${f(L.sp_until, { date: sp.until })}</span></div>
        <div class="fp-org">${f(L.sp_by, { org: esc(sp.org) })}</div>
        <ul class="fp-inc">${(sp.kind === 'facility' ? L.fa_inc : L.sp_inc).map(x => `<li>${x}</li>`).join('')}</ul>
        <p class="fp-priv">${sp.kind === 'facility' ? L.fa_priv : L.sp_priv}</p>
        <div class="fp-code en">${esc(sp.code)}</div>
      </div>` : `
      <div class="card fam-pass">
        <div class="fp-org">${L.free_t}</div><p class="fp-priv" style="margin-top:4px">${L.free_d}</p>
        <div class="fp-sep"></div>
        <div class="grp-t" style="margin-top:0">${L.code_t}</div><p class="fp-priv" style="margin-top:4px">${L.code_d}</p>
        <div class="linkrow"><input id="fam-code" class="en" placeholder="${L.code_ph}" maxlength="16" autocapitalize="characters"><button class="btn primary" id="fam-link" style="width:auto;margin:6px 0 0;padding:12px 18px">${L.code_btn}</button></div>
      </div>`;
    const famRows = fam.map((m, i) => `<div class="item"><div class="fam-av">${esc(m.name).slice(0, 1)}</div><div style="flex:1"><div class="m"><b style="font-family:var(--ko);font-weight:800">${esc(m.name)}</b> <span style="color:var(--ink-3);font-size:12px">${esc(m.rel)}</span></div><div class="dt">${f(L.fam_on, { date: m.since })}</div></div><span class="fam-pill ${i < freeSlots ? 'free' : 'paid'}">${i < freeSlots ? L.fam_free : L.fam_paid}</span></div>`).join('');
    const needPlan = fam.length >= freeSlots;
    $('#v-plan').innerHTML = `
      <header class="top"><button class="icon-btn" id="fam-back">←</button><h1>${L.plan_title}</h1><span class="en tag">Pass · Supporters</span></header>
      <h2 class="h" style="margin-top:4px">${L.my_pass}</h2>${passHtml}
      <h2 class="h">${L.fam_t}</h2><p class="fam-lead">${L.fam_d}</p>
      <div class="list">${famRows}</div>
      <button class="btn ghost" id="fam-add">${L.fam_add}</button>
      ${needPlan ? `<p class="fam-hint">${sp ? L.fam_more : L.fam_more_free}</p>` : ''}
      <h2 class="h">${L.share_t}</h2>
      <div class="card"><p class="fam-lead" style="margin:0 0 6px">${L.share_d}</p>
        ${Object.keys(L.sh).map(k => `<label class="fam-tg"><span>${L.sh[k]}</span><input type="checkbox" data-k="${k}" ${F.share[k] ? 'checked' : ''}><i></i></label>`).join('')}
      </div>
      <div class="row2"><button class="btn ghost" id="fam-guard">${L.see_guard}</button><button class="btn primary" id="fam-price">${L.see_plans}</button></div>
      ${DEMO ? '' : `<p class="tiny">${L.code_soon}</p>`}`;
    $('#fam-back').onclick = toSettings;
    $('#fam-price').onclick = () => show('v-price');
    $('#fam-guard').onclick = () => show('v-guard');
    $$('#v-plan .fam-tg input').forEach(i => i.onchange = () => { F.share[i.dataset.k] = i.checked ? 1 : 0; saveF(); });
    $('#fam-add').onclick = () => {
      if (fam.length >= freeSlots) return show('v-price');
      F.family.push({ name: L.me2, rel: L.rel2, since: dstr(0), free: 1 }); saveF(); toast(L.fam_invited); renderPlan();
    };
    const lk = $('#fam-link');
    if (lk) lk.onclick = () => {
      const v = $('#fam-code').value.trim().toUpperCase();
      if (!/^MB-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(v)) return toast(L.code_bad);
      if (!DEMO) return toast(L.code_soon);
      F.sponsor = { org: L.org, until: dstr(280), code: v }; saveF(); renderPlan();
    };
  }

  function renderPrice() {
    const sp = !!F.sponsor;
    const plan = (name, price, yr, items, hi, per, spv) => `<div class="card fam-plan ${hi ? 'hi' : ''}">${hi ? `<span class="fam-pop en">${L.pop}</span>` : ''}
      <div class="fpl-name">${name}</div>
      <div class="fpl-price">${price ? `<b class="en">${price}</b><span>${L.won}${L.mo}</span>` : `<b>${L.p_free}</b>`}</div>
      ${yr ? `<div class="fpl-yr">${f(L.yr, { v: yr })}${per ? ' · ' + f(L.per, { v: per }) : ''}</div>` : ''}${sp && spv ? `<div class="fpl-sp">${spv === '0' ? L.sp_in : f(L.sp_fam, { v: spv })}</div>` : ''}
      <ul>${items.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
    $('#v-price').innerHTML = `
      <header class="top"><button class="icon-btn" id="pr-back">←</button><h1>${L.price_title}</h1><span class="en tag">Supporter Plans</span></header>
      <p class="fam-lead" style="font-size:15px;color:var(--ink)">${L.price_lead}</p>
      <div class="fam-assume">${L.price_tag}</div> <div class="fam-trial">${L.trial}</div>
      ${plan(L.p_basic, null, null, L.p_free_d)}
      ${plan(L.p_one, '4,900', '49,000', L.p_one_d, false, null, sp ? '0' : null)}
      ${plan(L.p_fam, '9,900', '99,000', L.p_fam_d, true, '3,300', '4,900')}
      ${plan(L.p_plus, '14,900', '149,000', L.p_plus_d, false, '2,980', '10,000')}
      <p class="fam-hint" style="text-align:left">${L.sp_note}</p>
      <button class="btn primary" id="pr-notify">${L.notify}</button>`;
    $('#pr-back').onclick = () => show('v-plan');
    $('#pr-notify').onclick = () => toast(L.notified);
  }

  function renderGuard() {
    const st = S(), p = st.profile || {}, E = (st.entries || []).slice().sort((a, b) => a.date < b.date ? -1 : 1), sh = F.share;
    const name = p.name || L.mom, me = (F.family[0] || {}).name || L.me;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const ago = s => Math.round((now - new Date(s + 'T00:00:00')) / 864e5);
    const last = E[E.length - 1], set = new Set(E.map(e => e.date));
    let n28 = 0; const cells = [];
    for (let i = 27; i >= 0; i--) { const x = new Date(now); x.setDate(x.getDate() - i); const k = x.toISOString().slice(0, 10); const on = set.has(k); n28 += on; cells.push(`<i class="${on ? 'on' : ''} ${i === 0 ? 'td' : ''}"></i>`); }
    const vd = p.visit ? Math.round((new Date(p.visit + 'T00:00:00') - now) / 864e5) : null;
    const rec = E.filter(e => e.sbp != null || e.wt != null).slice(-5).reverse();
    const qs = E.filter(e => e.note).slice(-3).reverse();
    $('#v-guard').innerHTML = `
      <header class="top"><div><div class="hello">${f(L.g_sub, { me: esc(me) })}</div><h1>${f(L.g_title, { name: esc(name) })}</h1></div><span class="en tag">Caregiver</span></header>
      <div class="mirror-badge">${f(L.g_badge, { name: esc(name) })}</div>
      <div class="kpis" style="grid-template-columns:repeat(3,1fr)">
        <div class="kpi mint"><div class="k">${L.g_last}</div><div class="v en" style="font-size:20px">${last ? (ago(last.date) ? f(L.g_ago, { n: ago(last.date) }) : L.g_today) : '–'}</div></div>
        <div class="kpi pink"><div class="k">${L.g_days}</div><div class="v en" style="font-size:20px">${f(L.g_cnt, { n: n28 })}</div></div>
        <div class="kpi blue"><div class="k">${L.g_visit}</div><div class="v en" style="font-size:20px">${vd != null && vd >= 0 ? 'D-' + vd : '–'}</div></div>
      </div>
      ${sh.days ? `<div class="card"><h4 class="g-h">${L.g_cal}</h4><div class="g-cal">${cells.join('')}</div></div>` : ''}
      ${(sh.bp || sh.wt) && rec.length ? `<div class="card mr-sec m"><h4 class="g-h">${L.g_recent}</h4><table class="g-tb">${rec.map(e => `<tr><td class="en">${e.date.slice(5).replace('-', '.')}</td><td class="num en">${sh.bp && e.sbp != null ? e.sbp + '/' + e.dbp : ''}</td><td class="num en">${sh.wt && e.wt != null ? e.wt + ' kg' : ''}</td></tr>`).join('')}</table></div>` : ''}
      ${sh.notes && qs.length ? `<div class="card"><h4 class="g-h">${L.g_q}</h4><ul class="g-q">${qs.map(e => `<li>${esc(e.note)}</li>`).join('')}</ul></div>` : ''}
      <div class="card"><h4 class="g-h">${L.g_alert_t}</h4>
        ${L.g_alerts.map((a, i) => `<label class="fam-tg"><span>${a}</span><input type="checkbox" ${i < 2 ? 'checked' : ''}><i></i></label>`).join('')}
        <p class="fam-lead" style="margin:10px 0 0">${L.g_no_judge}</p></div>
      <div class="row2"><button class="btn ghost" id="g-back">${L.g_back}</button><button class="btn primary" id="g-cheer">${L.g_cheer}</button></div>`;
    $('#g-back').onclick = () => show('v-plan');
    $('#g-cheer').onclick = () => toast(L.g_cheered);
  }

  // deep link for demo / screenshots: ?demo=family&view=plan|price|guard
  const V = Q.get('view');
  if (V && ['plan', 'price', 'guard'].includes(V)) setTimeout(() => show('v-' + V), 60);
  window.MBFamily = { show };
})();
