interface Entry {
  t: string;
  d: string;
  u: string;
  c: string;
  h: number;
  k: string;
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s%-]/g, '');

function score(e: Entry, q: string): number {
  const t = norm(e.t);
  const terms = q.split(/\s+/).filter(Boolean);
  let s = 0;
  for (const term of terms) {
    if (t.startsWith(term)) s += 12;
    else if (t.split(/\s+/).some((w) => w.startsWith(term))) s += 8;
    else if (t.includes(term)) s += 5;
    else if (norm(e.k).includes(term)) s += 4;
    else if (norm(e.c).includes(term)) s += 2;
    else if (norm(e.d).includes(term)) s += 1;
    else return 0;
  }
  return s - t.length / 100;
}

export function initSearch() {
  const dialog = document.getElementById('search-dialog') as HTMLDialogElement | null;
  const input = document.getElementById('search-input') as HTMLInputElement | null;
  const list = document.getElementById('search-results');
  const raw = document.getElementById('search-index')?.textContent;
  if (!dialog || !input || !list || !raw) return;
  const index: Entry[] = JSON.parse(raw);
  let active = 0;
  let current: Entry[] = [];

  const render = () => {
    const q = norm(input.value.trim());
    current = q
      ? index
          .map((e) => [e, score(e, q)] as const)
          .filter(([, s]) => s > 0)
          .sort((a, b) => b[1] - a[1])
          .map(([e]) => e)
          .slice(0, 30)
      : index.slice(0, 0);
    if (!q) {
      list.innerHTML = `<li class="pal-empty">Try “mortgage”, “json”, “bmi”, “word count”…</li>`;
      return;
    }
    if (!current.length) {
      list.innerHTML = `<li class="pal-empty">No matches for “${input.value.replace(/[<>&"]/g, '')}”.</li>`;
      return;
    }
    active = Math.min(active, current.length - 1);
    list.innerHTML = current
      .map(
        (e, i) => `<li role="option" aria-selected="${i === active}">
          <a href="${e.u}" class="pal-item${i === active ? ' active' : ''}" style="--hue:${e.h}">
            <span class="pal-dot"></span>
            <span class="pal-text"><span class="pal-title">${e.t}</span><span class="pal-desc">${e.d}</span></span>
            <span class="pal-cat">${e.c}</span>
          </a></li>`,
      )
      .join('');
    list.querySelector('.active')?.scrollIntoView({ block: 'nearest' });
  };

  const open = () => {
    if (!dialog.open) dialog.showModal();
    input.value = '';
    active = 0;
    render();
    input.focus();
  };

  document.querySelectorAll('[data-open-search]').forEach((el) => el.addEventListener('click', open));
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open();
    } else if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      open();
    }
  });
  input.addEventListener('input', () => {
    active = 0;
    render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active = Math.min(active + 1, current.length - 1);
      render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      active = Math.max(active - 1, 0);
      render();
    } else if (e.key === 'Enter' && current[active]) {
      e.preventDefault();
      location.href = current[active].u;
    }
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  // Inline hero search on the home page reuses the palette.
  const hero = document.getElementById('hero-search') as HTMLInputElement | null;
  hero?.addEventListener('focus', () => {
    hero.blur();
    open();
  });

  const style = document.createElement('style');
  style.textContent = `
    .pal-empty{padding:18px 12px;color:var(--text-3);font-size:14px}
    .pal-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;color:var(--text)}
    .pal-item:hover,.pal-item.active{background:var(--bg-sunk);text-decoration:none}
    .pal-item.active{box-shadow:inset 0 0 0 1px var(--line)}
    .pal-dot{width:8px;height:8px;border-radius:50%;background:oklch(62% 0.17 var(--hue));flex:none}
    .pal-text{display:flex;flex-direction:column;min-width:0;flex:1}
    .pal-title{font-weight:600;font-size:14.5px}
    .pal-desc{font-size:12.5px;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .pal-cat{font-size:12px;color:var(--text-3);flex:none}
  `;
  document.head.appendChild(style);
}
