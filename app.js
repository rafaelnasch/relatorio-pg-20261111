/* The access key remains in the URL fragment and is never sent to the server. */
(() => {
 'use strict';
 const root = document.getElementById('report-root');
 const params = new URLSearchParams(location.hash.slice(1));
 const keyText = params.get('k');
 window.addEventListener('hashchange', () => location.reload());
 const bytes = value => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')), c => c.charCodeAt(0));
 const message = (title, body) => {
  document.getElementById('access-title').textContent = title;
  document.getElementById('access-message').textContent = body;
 };
 function selectTab(button) {
  const tabs = [...button.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
  for (const tab of tabs) {
   const selected = tab === button;
   tab.setAttribute('aria-selected', String(selected));
   tab.tabIndex = selected ? 0 : -1;
   document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  }
 }
 function interactions() {
  for (const group of root.querySelectorAll('[role="tablist"]')) {
   group.addEventListener('click', event => {
    const button = event.target.closest('[role="tab"]');
    if (button) selectTab(button);
   });
   group.addEventListener('keydown', event => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabs[next]); tabs[next].focus(); }
   });
  }
  document.addEventListener('click', event => {
   const link = event.target.closest('a[href^="#"]');
   if (!link) return;
   const target = document.getElementById(link.getAttribute('href').slice(1));
   if (!target) return;
   event.preventDefault();
   const detail = target.closest('details');
   if (detail) detail.open = true;
   target.scrollIntoView({ behavior: 'instant', block: 'start' });
   if (link.classList.contains('skip')) { target.tabIndex = -1; target.focus({preventScroll:true}); }
  });
  const navLinks = [...root.querySelectorAll('.nav a')];
  if ('IntersectionObserver' in window) {
   const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
     if (entry.isIntersecting) for (const link of navLinks) link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
    }
   }, {rootMargin:'-15% 0px -60% 0px',threshold:0});
   for (const link of navLinks) observer.observe(document.querySelector(link.getAttribute('href')));
  }
  document.getElementById('print-report').addEventListener('click', () => window.print());
 }
 async function open() {
  if (!keyText) { message('Seu relatório está pronto.', 'Abra esta página pelo link completo que recebeu da GrowAI.'); return; }
  try {
   const response = await fetch('payload.json', {cache:'no-store',referrerPolicy:'no-referrer'});
   if (!response.ok) throw new Error('payload unavailable');
   const payload = await response.json();
   const key = await crypto.subtle.importKey('raw', bytes(keyText), {name:'AES-GCM'}, false, ['decrypt']);
   const plaintext = await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(payload.iv)}, key, bytes(payload.data));
   const report = JSON.parse(new TextDecoder().decode(plaintext));
   document.title = report.title;
   root.innerHTML = report.html;
   interactions();
  } catch (_) {
   message('Não foi possível abrir o relatório.', 'Confira se o link está completo e tente abrir a página novamente.');
  }
 }
 open();
})();
