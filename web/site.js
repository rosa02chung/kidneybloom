/* shared nav + footer */
(() => {
  const APP = 'https://app.kidneybloom.com';
  const bean = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 8c-9 0-14 8-14 18 0 9 5 13 8 19 3 5 6 11 14 11 8 0 11-6 14-11 3-6 8-10 8-19C50 16 45 8 36 8c-4 0-6 2-8 2s-4-2-8-2z" fill="#7ECFB3"/><circle cx="23" cy="30" r="2.6" fill="#17383F"/><circle cx="37" cy="30" r="2.6" fill="#17383F"/><path d="M24 39q6 5 12 0" stroke="#17383F" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="18" cy="37" r="3" fill="#FF7B8E" opacity=".7"/><circle cx="42" cy="37" r="3" fill="#FF7B8E" opacity=".7"/></svg>';
  const pages = [['index.html', '홈'], ['problem.html', '문제와 시장'], ['product.html', 'My Beanie'], ['strategy.html', '전략과 사업구조'], ['company.html', '회사와 연구']];
  const here = location.pathname.split('/').pop() || 'index.html';
  const nav = document.createElement('nav'); nav.className = 'top';
  nav.innerHTML = `<div class="wrap"><a class="logo" href="index.html">${bean}Kidney Bloom</a>
    <ul id="menu">${pages.map(([h, t]) => `<li><a href="${h}" class="${h === here ? 'on' : ''}">${t}</a></li>`).join('')}</ul>
    <a class="btn btn-primary btn-sm" href="${APP}">My Beanie 시작하기</a>
    <button class="menu-btn" aria-label="메뉴">☰</button></div>`;
  document.body.prepend(nav);
  nav.querySelector('.menu-btn').onclick = () => nav.querySelector('#menu').classList.toggle('open');
  const foot = document.createElement('footer');
  foot.innerHTML = `<div class="wrap"><div><div class="en" style="color:var(--ink);font-weight:600">Root to Life · Kidney Bloom · My Beanie</div>
    <div class="links">${pages.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}<a href="${APP}">앱 열기</a></div>
    <div style="margin-top:10px">© 2026 Root to Life. All rights reserved.</div></div>
    <div class="disc">본 사이트와 My Beanie 앱은 개인 건강기록·소통 보조 도구이며 의료기기가 아닙니다. 질병의 진단·치료·예방을 목적으로 하지 않으며, 의료적 결정은 반드시 담당 의료진과 상의하시기 바랍니다. 인용 수치는 각 페이지의 출처 항목을 따르며, 자료원별 정의 차이로 값이 다를 수 있습니다.</div></div>`;
  document.body.append(foot);
})();
