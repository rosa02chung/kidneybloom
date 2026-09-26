/* shared nav + footer, KO/EN */
(() => {
  const APP = 'https://app.kidneybloom.com';
  const EN = location.pathname.startsWith('/en/') || location.pathname.includes('/en/');
  const base = EN ? '../' : './';
  const bean = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 8c-9 0-14 8-14 18 0 9 5 13 8 19 3 5 6 11 14 11 8 0 11-6 14-11 3-6 8-10 8-19C50 16 45 8 36 8c-4 0-6 2-8 2s-4-2-8-2z" fill="#7ECFB3"/><circle cx="23" cy="30" r="2.6" fill="#17383F"/><circle cx="37" cy="30" r="2.6" fill="#17383F"/><path d="M24 39q6 5 12 0" stroke="#17383F" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="18" cy="37" r="3" fill="#FF7B8E" opacity=".7"/><circle cx="42" cy="37" r="3" fill="#FF7B8E" opacity=".7"/></svg>';
  // information architecture: 5 top-level items (home = logo)
  const menu = [
    { h: 'manifesto.html', ko: '매니페스토', en: 'Manifesto' },
    { ko: 'My Beanie', en: 'My Beanie', sub: [['product.html', '제품 소개', 'Product'], ['family.html', '가족과 함께', 'Family'], ['dialysis.html', '투석 기록', 'Dialysis Log']] },
    { h: 'problem.html', ko: '왜 콩팥인가', en: 'Why Kidneys' },
    { ko: '회사', en: 'Company', sub: [['company.html', '회사 소개', 'About Root to Life'], ['strategy.html', '사업 구조', 'Business Structure']] },
  ];
  const pages = [['index.html', '홈', 'Home']].concat(menu.flatMap(m => m.sub ? m.sub : [[m.h, m.ko, m.en]]));
  const here = location.pathname.split('/').pop() || 'index.html';
  const t = (ko, en) => EN ? en : ko;
  const nav = document.createElement('nav'); nav.className = 'top';
  nav.innerHTML = `<div class="wrap"><a class="logo" href="index.html">${bean}Kidney Bloom</a>
    <ul id="menu">${menu.map(m => m.sub
      ? `<li class="has-sub ${m.sub.some(x => x[0] === here) ? 'on' : ''}"><a href="${m.sub[0][0]}" class="${m.sub.some(x => x[0] === here) ? 'on' : ''}">${t(m.ko, m.en)}<i>▾</i></a><ul class="sub">${m.sub.map(([h, ko, en]) => `<li><a href="${h}" class="${h === here ? 'on' : ''}">${t(ko, en)}</a></li>`).join('')}</ul></li>`
      : `<li><a href="${m.h}" class="${m.h === here ? 'on' : ''}">${t(m.ko, m.en)}</a></li>`).join('')}
      <li class="lang"><a href="${EN ? '../' + here : 'en/' + here}" lang="${EN ? 'ko' : 'en'}">${EN ? '한국어' : 'EN'}</a></li></ul>
    <a class="btn btn-primary btn-sm" href="${APP}${EN ? '/?lang=en' : ''}">${t('My Beanie 시작하기', 'Open My Beanie')}</a>
    <button class="menu-btn" aria-label="${t('메뉴', 'Menu')}">☰</button></div>`;
  document.body.prepend(nav);
  nav.querySelector('.menu-btn').onclick = () => nav.querySelector('#menu').classList.toggle('open');
  nav.querySelectorAll('li.has-sub > a').forEach(a => a.addEventListener('click', e => { if (window.matchMedia('(max-width:820px)').matches) { e.preventDefault(); a.parentElement.classList.toggle('open'); } }));
  const foot = document.createElement('footer');
  foot.innerHTML = `<div class="wrap"><div><div class="en" style="color:var(--ink);font-weight:600">Root to Life · Kidney Bloom · My Beanie</div>
    <div class="links">${pages.slice(1).map(([h, ko, en]) => `<a href="${h}">${t(ko, en)}</a>`).join('')}<a href="${APP}${EN ? '/?lang=en' : ''}">${t('앱 열기', 'Open the app')}</a><a href="${EN ? '../' + here : 'en/' + here}">${EN ? '한국어' : 'English'}</a><a href="terms.html">${t('이용약관', 'Terms of Use')}</a><a href="privacy.html">${t('개인정보처리방침', 'Privacy Policy')}</a></div>
    <div style="margin-top:10px">© 2026 Root to Life. All rights reserved.</div>
    <div class="copy">${t('이 사이트와 My Beanie 앱의 문구·디자인·일러스트·코드는 Root to Life의 저작물입니다. 사전 서면 동의 없는 복제·배포·변형·모방을 금합니다. 협업·투자 검토 자료는 비밀유지계약(NDA) 체결 후 제공합니다.',
      'The copy, design, illustrations and code of this site and the My Beanie app are the work of Root to Life. Reproduction, distribution, adaptation or imitation without prior written consent is prohibited. Materials for partnership or investment review are shared only under an NDA.')} <a href="terms.html">${t('이용약관 보기', 'See Terms')}</a></div></div>
    <div class="disc">${t('본 사이트와 My Beanie 앱은 개인 건강기록·소통 보조 도구이며 의료기기가 아닙니다. 질병의 진단·치료·예방을 목적으로 하지 않으며, 의료적 결정은 반드시 담당 의료진과 상의하시기 바랍니다. 인용 수치는 각 페이지의 출처 항목을 따르며, 자료원별 정의 차이로 값이 다를 수 있습니다.',
      'This site and the My Beanie app are personal health-record and communication aids, not medical devices. They are not intended to diagnose, treat, or prevent disease; medical decisions should always be made with your care team. Figures follow the sources cited on each page and may differ across data sources.')}</div></div>`;
  document.body.append(foot);
})();
