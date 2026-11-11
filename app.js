(() => {
 'use strict';
 const root=document.getElementById('report-root');
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
 interactions();
})();
