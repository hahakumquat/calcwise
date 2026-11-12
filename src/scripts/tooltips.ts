/** One floating tooltip for every [data-tip] element: hover/focus on desktop, tap on touch. */
export function initTooltips() {
  if ((window as unknown as { __tips?: boolean }).__tips) return;
  (window as unknown as { __tips?: boolean }).__tips = true;
  const tip = document.createElement('div');
  tip.className = 'tooltip';
  tip.id = 'tooltip';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  let owner: HTMLElement | null = null;

  const place = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - tw - 12));
    let top = r.bottom + 8;
    if (top + th > window.innerHeight - 8) top = r.top - th - 8;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  };
  const show = (el: HTMLElement) => {
    owner?.setAttribute('aria-expanded', 'false');
    owner = el;
    tip.textContent = el.dataset.tip ?? '';
    el.setAttribute('aria-describedby', 'tooltip');
    el.setAttribute('aria-expanded', 'true');
    tip.classList.add('show');
    place(el);
  };
  const hide = () => {
    owner?.setAttribute('aria-expanded', 'false');
    owner?.removeAttribute('aria-describedby');
    owner = null;
    tip.classList.remove('show');
  };
  const target = (e: Event) => (e.target as HTMLElement | null)?.closest?.<HTMLElement>('[data-tip]') ?? null;

  document.addEventListener('pointerover', (e) => {
    if ((e as PointerEvent).pointerType === 'touch') return;
    const t = target(e);
    if (t) show(t);
  });
  document.addEventListener('pointerout', (e) => {
    if ((e as PointerEvent).pointerType === 'touch') return;
    const t = target(e);
    if (t && t === owner && !t.contains((e as PointerEvent).relatedTarget as Node)) hide();
  });
  document.addEventListener('focusin', (e) => {
    const t = target(e);
    if (t) show(t);
  });
  document.addEventListener('focusout', (e) => {
    if (target(e) === owner) hide();
  });
  document.addEventListener('click', (e) => {
    const t = target(e);
    if (t) {
      e.preventDefault();
      const touch = (e as PointerEvent).pointerType === 'touch' || (e as PointerEvent).pointerType === 'pen';
      // Mouse: hover already opened it — keep it open. Touch/keyboard: toggle.
      if (owner === t && touch) hide();
      else show(t);
    } else if (owner) hide();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
  window.addEventListener('scroll', () => owner && place(owner), { passive: true });
}
