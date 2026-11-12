import type { Calculator, ComputeResult, Values, ShowWhen } from '../lib/types';
import { toBase, fromBase, defaultUnitFor, type UnitGroup } from '../lib/units';
import { formatOutput } from '../lib/format';
import { parseList } from '../lib/defaults';
import { renderChart, toChartList } from '../lib/chart';
import { counterpart, getSystem, systemOf, type UnitSystem } from '../lib/unit-system';
import { initTooltips } from './tooltips';

const loaders = import.meta.glob<{ default: Calculator }>('../calculators/*/*.ts');

/* ───────── Number parsing: accepts "1,250", "$40", "12%", and arithmetic like "5*12" or "(3+4)/2" ───────── */
function evalExpr(src: string): number {
  let i = 0;
  const peek = () => src[i];
  const skip = () => {
    while (src[i] === ' ') i++;
  };
  const number = (): number => {
    skip();
    const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(src.slice(i));
    if (!m) throw new Error('bad');
    i += m[0].length;
    return parseFloat(m[0]);
  };
  const factor = (): number => {
    skip();
    if (peek() === '-') {
      i++;
      return -factor();
    }
    if (peek() === '+') {
      i++;
      return factor();
    }
    if (peek() === '(') {
      i++;
      const v = expr();
      skip();
      if (peek() !== ')') throw new Error('bad');
      i++;
      return v;
    }
    return number();
  };
  const power = (): number => {
    const b = factor();
    skip();
    if (peek() === '^') {
      i++;
      return b ** power();
    }
    return b;
  };
  const term = (): number => {
    let v = power();
    for (;;) {
      skip();
      const c = peek();
      if (c === '*' || c === '×') {
        i++;
        v *= power();
      } else if (c === '/' || c === '÷') {
        i++;
        v /= power();
      } else return v;
    }
  };
  const expr = (): number => {
    let v = term();
    for (;;) {
      skip();
      const c = peek();
      if (c === '+') {
        i++;
        v += term();
      } else if (c === '-' || c === '−') {
        i++;
        v -= term();
      } else return v;
    }
  };
  const v = expr();
  skip();
  if (i !== src.length) throw new Error('bad');
  return v;
}

/** Returns null for empty, NaN for invalid. */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(/[,$€£\s%_]/g, (c) => (c === ' ' ? ' ' : '')).replace(/−/g, '-');
  if (!s) return null;
  const direct = Number(s);
  if (s !== '' && Number.isFinite(direct)) return direct;
  if (/^[\d.eE+\-*/×÷^() ]+$/.test(s)) {
    try {
      const v = evalExpr(s);
      return Number.isFinite(v) ? v : NaN;
    } catch {
      return NaN;
    }
  }
  return NaN;
}

const tidy = (x: number) => String(Number(x.toPrecision(5)));
/** Round a converted *example default* to a clean number (8.749 → 8.7, 74.84 → 75). Never used on user input. */
const nice = (x: number) => {
  const a = Math.abs(x);
  if (a >= 10) return Math.round(x);
  if (a >= 1) return Math.round(x * 10) / 10;
  return Number(x.toPrecision(2));
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

class CalcController {
  private calc!: Calculator;
  private form: HTMLFormElement;
  private results: HTMLElement;
  private last: ComputeResult = {};
  private urlTimer = 0;

  constructor(private root: HTMLElement) {
    this.form = root.querySelector('.calc-inputs')!;
    this.results = root.querySelector('.calc-results')!;
  }

  async init() {
    const key = `../calculators/${this.root.dataset.category}/${this.root.dataset.slug}.ts`;
    const load = loaders[key];
    if (!load) return;
    this.calc = (await load()).default;
    this.applyDefaultsForToday();
    const fromUrl = this.applyUrl();
    const sys = getSystem();
    if (sys) this.applySystem(sys, fromUrl, true);
    this.bind();
    this.run();
    window.addEventListener('unitsystem', (e) => {
      this.applySystem((e as CustomEvent<UnitSystem>).detail, new Set(), false);
      this.run();
    });
    let w = this.chartsEl.clientWidth;
    new ResizeObserver(() => {
      if (Math.abs(this.chartsEl.clientWidth - w) > 8) {
        w = this.chartsEl.clientWidth;
        this.renderCharts(this.last);
      }
    }).observe(this.chartsEl);
  }

  private get chartsEl() {
    return this.results.querySelector<HTMLElement>('[data-charts]')!;
  }

  /* ───── conditional visibility ───── */
  private controlValue(id: string): string {
    const radio = this.el<HTMLInputElement>(`input[name="${id}"]:checked`);
    if (radio && radio.type === 'radio') return radio.value;
    const el = this.el<HTMLInputElement | HTMLSelectElement>(`#in-${id}`);
    if (el instanceof HTMLInputElement && el.type === 'checkbox') return el.checked ? 'on' : 'off';
    return el?.value ?? '';
  }
  private updateVisibility() {
    this.root.querySelectorAll<HTMLElement>('[data-show-when]').forEach((el) => {
      const sw = JSON.parse(el.dataset.showWhen!) as ShowWhen;
      const is = Array.isArray(sw.is) ? sw.is : [sw.is];
      el.hidden = !is.includes(this.controlValue(sw.input));
    });
  }
  private isHidden(id: string) {
    return !!this.el<HTMLElement>(`[data-field="${id}"]`)?.hidden;
  }

  /* ───── units: keep related selects in step, honour the US/Metric preference ───── */
  private unitSelects(group: string) {
    return [...this.root.querySelectorAll<HTMLSelectElement>(`select[data-group="${group}"]`)];
  }
  private setInputUnit(sel: HTMLSelectElement, unit: string, roundDefault: boolean) {
    const id = sel.dataset.unitFor!;
    const group = sel.dataset.group as UnitGroup;
    const input = this.el<HTMLInputElement>(`#in-${id}`)!;
    const n = parseNumber(input.value);
    if (n !== null && !Number.isNaN(n) && unit !== sel.value) {
      const v = fromBase(group, unit, toBase(group, sel.value, n));
      input.value = roundDefault ? String(Number(v.toPrecision(4))) : tidy(v);
    }
    sel.value = unit;
    sel.dataset.prev = unit;
  }
  /** After the user changes one unit, switch every other select of the same group that was showing the old unit. */
  private syncUnits(source: HTMLSelectElement, prev: string) {
    const unit = source.value;
    for (const s of this.unitSelects(source.dataset.group!)) {
      if (s === source || s.value !== prev || ![...s.options].some((o) => o.value === unit)) continue;
      if (s.dataset.unitFor) this.setInputUnit(s, unit, false);
      else s.value = unit;
    }
  }
  /**
   * Switch every unit select to the US or metric counterpart. The converted defaults become the new
   * defaults, so they don't leak into the shareable URL and Reset returns to the user's own system.
   */
  private applySystem(sys: UnitSystem, skip: Set<string>, roundDefault: boolean) {
    for (const s of this.root.querySelectorAll<HTMLSelectElement>('select[data-group]')) {
      if (skip.has(s.name) || skip.has(`out_${s.dataset.outUnit}`)) continue;
      const allowed = [...s.options].map((o) => o.value);
      const group = s.dataset.group as UnitGroup;
      const defUnit = s.dataset.default ?? s.value;
      const target = counterpart(group, s.value, allowed, sys);
      const defTarget = counterpart(group, defUnit, allowed, sys) ?? defUnit;
      if (s.dataset.unitFor) {
        const input = this.el<HTMLInputElement>(`#in-${s.dataset.unitFor}`)!;
        const untouched = input.value === input.dataset.default && s.value === defUnit;
        // Always convert from the authored default so repeated toggling never drifts.
        input.dataset.origDefault ??= input.dataset.default ?? '';
        s.dataset.origUnit ??= defUnit;
        const d = parseNumber(input.dataset.origDefault);
        if (d !== null && !Number.isNaN(d)) {
          const o = s.dataset.origUnit;
          input.dataset.default = defTarget === o ? input.dataset.origDefault : String(nice(fromBase(group, defTarget, toBase(group, o, d))));
        }
        if (target) this.setInputUnit(s, target, roundDefault || untouched);
        if (untouched) input.value = input.dataset.default ?? input.value;
      } else if (target) s.value = target;
      s.dataset.default = defTarget;
    }
  }
  /** Unit currently chosen for a group anywhere in this calculator (outputs first). */
  private unitFor = (group: UnitGroup): string | undefined => {
    const sels = this.unitSelects(group);
    const out = sels.find((s) => s.dataset.outUnit && !s.closest('[hidden]'));
    const any = out ?? sels.find((s) => !s.closest('[hidden]')) ?? sels[0];
    if (any) return any.value;
    const sys = getSystem() ?? 'us';
    const units = ['kg', 'lb', 'm', 'ft', 'km', 'mi', 'l', 'gal', 'c', 'f', 'm2', 'ft2', 'kph', 'mph'];
    return units.find((u) => systemOf(u) === sys && this.groupHas(group, u));
  };
  private groupHas(group: UnitGroup, id: string) {
    try {
      toBase(group, id, 1);
      return true;
    } catch {
      return false;
    }
  }

  /* ───── charts ───── */
  private chartMetas: unknown[] = [];
  private renderCharts(r: ComputeResult) {
    const box = this.chartsEl;
    const list = r.error ? [] : toChartList(r.chart);
    const width = box.clientWidth ? box.clientWidth - 32 : 600;
    const rendered = list.map((c) => renderChart(c, { width, unitFor: this.unitFor }));
    this.chartMetas = rendered.map((x) => x.meta);
    const html = rendered.map((x) => x.html).join('');
    box.hidden = !html;
    box.innerHTML = html;
  }
  private bindChartHover() {
    const box = this.chartsEl;
    const move = (e: PointerEvent) => {
      const hit = (e.target as Element).closest?.('.hit');
      const fig = (e.target as Element).closest?.('figure.chart');
      if (!fig) return;
      const idx = [...box.querySelectorAll('figure.chart')].indexOf(fig);
      const meta = this.chartMetas[idx] as { px: number[]; py: (number | null)[][]; labels: string[]; rows: { name: string; color: string; values: string[] }[] } | null;
      const svg = fig.querySelector('svg')!;
      const hover = svg.querySelector<SVGGElement>('.hover');
      const tip = fig.querySelector<HTMLElement>('.chart-tip')!;
      if (!meta || !hit || !hover) {
        hover?.setAttribute('visibility', 'hidden');
        tip.hidden = true;
        return;
      }
      const rect = svg.getBoundingClientRect();
      const scale = svg.viewBox.baseVal.width / rect.width;
      const x = (e.clientX - rect.left) * scale;
      let best = 0;
      meta.px.forEach((px, i) => {
        if (Math.abs(px - x) < Math.abs(meta.px[best] - x)) best = i;
      });
      hover.setAttribute('visibility', 'visible');
      const line = hover.querySelector('line')!;
      line.setAttribute('x1', String(meta.px[best]));
      line.setAttribute('x2', String(meta.px[best]));
      hover.querySelectorAll('circle').forEach((c, si) => {
        const y = meta.py[si]?.[best];
        c.setAttribute('visibility', y === null || y === undefined ? 'hidden' : 'visible');
        c.setAttribute('cx', String(meta.px[best]));
        c.setAttribute('cy', String(y ?? 0));
      });
      tip.innerHTML = `<b>${meta.labels[best]}</b>${meta.rows.map((r) => `<div><span><i style="background:${r.color}"></i>${r.name}</span><strong>${r.values[best]}</strong></div>`).join('')}`;
      tip.hidden = false;
      const left = meta.px[best] / scale;
      const tw = tip.offsetWidth;
      tip.style.left = `${left + 14 + tw > rect.width ? left - tw - 14 : left + 14}px`;
      tip.style.top = `8px`;
    };
    box.addEventListener('pointermove', move);
    box.addEventListener('pointerdown', move);
    box.addEventListener('pointerleave', () => {
      box.querySelectorAll('.hover').forEach((h) => h.setAttribute('visibility', 'hidden'));
      box.querySelectorAll<HTMLElement>('.chart-tip').forEach((t) => (t.hidden = true));
    });
  }

  /* ───── helpers to reach fields ───── */
  private el<T extends Element = HTMLInputElement>(sel: string) {
    return this.root.querySelector<T & Element>(sel);
  }
  private unitSel(id: string) {
    return this.el<HTMLSelectElement>(`select[data-unit-for="${id}"]`);
  }

  private applyDefaultsForToday() {
    for (const i of this.calc.inputs) {
      if (i.type === 'date' && i.default === 'today') {
        const input = this.el<HTMLInputElement>(`#in-${i.id}`);
        if (input && !input.value) input.value = today();
      }
    }
  }

  private readValues(): { values: Values; invalid: boolean } {
    const values: Values = {};
    let invalid = false;
    for (const i of this.calc.inputs) {
      if (this.isHidden(i.id)) {
        values[i.id] = i.type === 'list' ? [] : i.type === 'textarea' ? '' : null;
        continue;
      }
      switch (i.type) {
        case 'number': {
          const input = this.el<HTMLInputElement>(`#in-${i.id}`)!;
          const n = parseNumber(input.value);
          const bad = n !== null && Number.isNaN(n);
          input.closest('.control')?.classList.toggle('invalid', bad);
          if (bad) invalid = true;
          if (n === null || bad) {
            values[i.id] = null;
            if (n === null && !i.optional && i.default !== undefined) invalid = invalid || false;
          } else values[i.id] = i.unit ? toBase(i.unit, this.unitSel(i.id)!.value, n) : n;
          break;
        }
        case 'select': {
          const radio = this.el<HTMLInputElement>(`input[name="${i.id}"]:checked`);
          const sel = this.el<HTMLSelectElement>(`select#in-${i.id}`);
          values[i.id] = radio?.value ?? sel?.value ?? null;
          break;
        }
        case 'list':
          values[i.id] = parseList(this.el<HTMLTextAreaElement>(`#in-${i.id}`)!.value);
          break;
        case 'textarea':
          values[i.id] = this.el<HTMLTextAreaElement>(`#in-${i.id}`)!.value;
          break;
        case 'toggle':
          values[i.id] = this.el<HTMLInputElement>(`#in-${i.id}`)!.checked ? 'on' : 'off';
          break;
        default: {
          const v = this.el<HTMLInputElement>(`#in-${i.id}`)!.value;
          values[i.id] = v === '' ? null : v;
        }
      }
    }
    return { values, invalid };
  }

  run() {
    this.updateVisibility();
    const { values } = this.readValues();
    let r: ComputeResult;
    try {
      r = this.calc.compute(values);
    } catch (e) {
      r = { error: 'Those inputs can’t be calculated. Check the values and try again.' };
      console.error(e);
    }
    this.last = r;
    this.render(r);
    this.scheduleUrl();
  }

  private render(r: ComputeResult) {
    const err = this.results.querySelector<HTMLElement>('[data-error]')!;
    err.hidden = !r.error;
    err.querySelector('span')!.textContent = r.error ?? '';

    for (const o of this.calc.outputs) {
      const box = this.results.querySelector<HTMLElement>(`[data-output="${o.id}"]`);
      if (!box) continue;
      const valueEl = box.querySelector<HTMLElement>('[data-value]')!;
      const raw = r[o.id];
      if (o.format === 'code') {
        valueEl.textContent = typeof raw === 'string' ? raw : '';
        continue;
      }
      const unitSel = box.querySelector<HTMLSelectElement>(`select[data-out-unit="${o.id}"]`);
      const { value, unit } = formatOutput(o, raw, unitSel?.value);
      if (valueEl.textContent !== value) {
        valueEl.textContent = value;
        if (o.primary) {
          valueEl.classList.remove('flash');
          void valueEl.offsetWidth;
          valueEl.classList.add('flash');
        }
      }
      const unitEl = box.querySelector<HTMLElement>('[data-unit]');
      if (unitEl) unitEl.textContent = value === '—' && !o.unit ? '' : unit;
    }

    this.results.querySelectorAll<HTMLElement>('[data-note]').forEach((n) => {
      n.hidden = !r.note;
      n.textContent = r.note ?? '';
    });
    this.renderCharts(r);
    const steps = this.results.querySelector<HTMLDetailsElement>('[data-steps]')!;
    steps.hidden = !r.steps?.length;
    const ol = steps.querySelector('ol')!;
    ol.replaceChildren(...(r.steps ?? []).map((s) => Object.assign(document.createElement('li'), { textContent: s })));
  }

  private bind() {
    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => this.run(), 0);
    };
    this.form.addEventListener('input', (e) => {
      const t = e.target as HTMLElement;
      if (t.matches('select.unit[data-unit-for]')) return; // handled on change
      schedule();
    });
    this.form.addEventListener('change', (e) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLSelectElement && t.dataset.unitFor) {
        const prev = t.dataset.prev ?? t.value;
        this.convertInputUnit(t);
        this.syncUnits(t, prev);
      }
      schedule();
    });
    this.bindChartHover();
    initTooltips();
    // Remember previous unit for conversion.
    this.root.querySelectorAll<HTMLSelectElement>('select[data-unit-for]').forEach((s) => {
      s.dataset.prev = s.value;
      s.addEventListener('focus', () => (s.dataset.prev = s.value));
    });
    this.results.addEventListener('focusin', (e) => {
      const s = e.target as HTMLSelectElement;
      if (s.matches?.('select[data-out-unit]')) s.dataset.prev = s.value;
    });
    this.results.addEventListener('change', (e) => {
      const s = e.target as HTMLSelectElement;
      if (s.matches('select[data-out-unit]')) {
        const prev = s.dataset.prev;
        if (prev && prev !== s.value) {
          // Output unit changed: move sibling outputs (and inputs) that shared the old unit.
          for (const o of this.unitSelects(s.dataset.group!)) {
            if (o === s || o.value !== prev || ![...o.options].some((x) => x.value === s.value)) continue;
            if (o.dataset.unitFor) this.setInputUnit(o, s.value, false);
            else o.value = s.value;
          }
        }
        s.dataset.prev = s.value;
        this.run();
      }
    });

    this.root.addEventListener('click', async (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!btn) return;
      if (btn.dataset.copy) {
        const o = this.calc.outputs.find((x) => x.id === btn.dataset.copy)!;
        const box = this.results.querySelector(`[data-output="${o.id}"]`)!;
        const val = box.querySelector('[data-value]')!.textContent ?? '';
        const unit = o.format === 'code' ? '' : (box.querySelector<HTMLSelectElement>('select[data-out-unit]')?.selectedOptions[0]?.text ?? box.querySelector('[data-unit]')?.textContent ?? '');
        await this.copy(`${val}${unit ? ' ' + unit : ''}`.trim(), btn);
      } else if (btn.dataset.action === 'share') {
        this.writeUrl();
        await this.copy(location.href, btn, 'Link copied');
      } else if (btn.dataset.action === 'reset') {
        this.reset();
      } else if (btn.dataset.action === 'regenerate') {
        this.run();
      }
    });
  }

  private convertInputUnit(sel: HTMLSelectElement) {
    const id = sel.dataset.unitFor!;
    const group = sel.dataset.group as Parameters<typeof toBase>[0];
    const input = this.el<HTMLInputElement>(`#in-${id}`)!;
    const prev = sel.dataset.prev ?? sel.value;
    const n = parseNumber(input.value);
    if (n !== null && !Number.isNaN(n) && prev !== sel.value) {
      input.value = tidy(fromBase(group, sel.value, toBase(group, prev, n)));
    }
    sel.dataset.prev = sel.value;
  }

  private async copy(text: string, btn: HTMLButtonElement, label = 'Copied') {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const span = btn.querySelector('span');
    btn.classList.add('copied');
    if (span) {
      const before = span.textContent;
      span.textContent = label;
      setTimeout(() => {
        span.textContent = before;
        btn.classList.remove('copied');
      }, 1400);
    } else setTimeout(() => btn.classList.remove('copied'), 1400);
  }

  private reset() {
    this.root.querySelectorAll<HTMLElement>('[data-default]').forEach((el) => {
      const d = el.dataset.default ?? '';
      if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = d === 'on';
      else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = d === 'today' ? today() : d;
      else if (el instanceof HTMLSelectElement) {
        el.value = d;
        el.dataset.prev = d;
      } else if (el.classList.contains('segmented')) {
        el.querySelectorAll<HTMLInputElement>('input').forEach((r) => (r.checked = r.value === d));
      }
    });
    this.root.querySelectorAll<HTMLSelectElement>('select[data-out-unit]').forEach((s) => {
      const o = this.calc.outputs.find((x) => x.id === s.dataset.outUnit)!;
      s.value = s.dataset.default ?? defaultUnitFor(o.unit!, o.defaultUnit, o.units);
    });
    history.replaceState(null, '', location.pathname);
    this.run();
  }

  /* ───── URL state: every non-default value goes into the query string ───── */
  private scheduleUrl() {
    clearTimeout(this.urlTimer);
    this.urlTimer = window.setTimeout(() => this.writeUrl(), 400);
  }

  private writeUrl() {
    const p = new URLSearchParams();
    this.root.querySelectorAll<HTMLElement>('[data-default]').forEach((el) => {
      const d = el.dataset.default ?? '';
      let name = '';
      let val = '';
      if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        name = el.name;
        val = el.checked ? 'on' : 'off';
      } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        name = el.name;
        val = el.value;
      } else if (el.classList.contains('segmented')) {
        const r = el.querySelector<HTMLInputElement>('input:checked');
        name = r?.name ?? '';
        val = r?.value ?? '';
      }
      if (!name || val === d || (d === 'today' && val === today()) || val.length > 2000) return;
      p.set(name, val);
    });
    this.root.querySelectorAll<HTMLSelectElement>('select[data-out-unit]').forEach((s) => {
      const o = this.calc.outputs.find((x) => x.id === s.dataset.outUnit)!;
      if (s.value !== (s.dataset.default ?? defaultUnitFor(o.unit!, o.defaultUnit, o.units))) p.set(`out_${o.id}`, s.value);
    });
    const qs = p.toString();
    const url = qs ? `${location.pathname}?${qs}` : location.pathname;
    if (url !== location.pathname + location.search) history.replaceState(null, '', url);
  }

  private applyUrl(): Set<string> {
    const p = new URLSearchParams(location.search);
    const keys = new Set(p.keys());
    if (!keys.size) return keys;
    for (const [k, v] of p) {
      if (k.startsWith('out_')) {
        const s = this.el<HTMLSelectElement>(`select[data-out-unit="${k.slice(4)}"]`);
        if (s && [...s.options].some((o) => o.value === v)) s.value = v;
        continue;
      }
      const els = this.form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${CSS.escape(k)}"]`);
      els.forEach((el) => {
        if (el instanceof HTMLInputElement && el.type === 'radio') el.checked = el.value === v;
        else if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = v === 'on';
        else if (el instanceof HTMLSelectElement) {
          if ([...el.options].some((o) => o.value === v)) {
            el.value = v;
            el.dataset.prev = v;
          }
        } else el.value = v;
      });
    }
    return keys;
  }
}

export function initCalculators() {
  document.querySelectorAll<HTMLElement>('[data-calc]').forEach((root) => {
    if (root.dataset.ready) return;
    root.dataset.ready = '1';
    new CalcController(root).init();
  });
}
