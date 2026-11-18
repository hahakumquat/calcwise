import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

const npvAt = (r: number, c: number[]) => c.reduce((s, x, t) => s + x / Math.pow(1 + r, t), 0);

/** Bisection on (-99%, 1000%]. Returns null when the sign does not change (no IRR in range). */
function irr(c: number[]): number | null {
  let lo = -0.99;
  let hi = 10;
  const flo = npvAt(lo, c);
  const fhi = npvAt(hi, c);
  if (!isFinite(flo) || !isFinite(fhi) || flo * fhi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fm = npvAt(mid, c);
    if (fm === 0) return mid;
    if (fm * flo > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const flowInputs = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `c${n}`,
  label: `Cash flow, year ${n}`,
  type: 'number' as const,
  prefix: '$',
  default: [300, 400, 500, 200, 0, 0][n - 1],
  step: 50,
  info: `Money in (positive) or out (negative) at the end of year ${n}. Leave at 0 if the project is over.`,
}));

export default defineCalculator({
  slug: 'npv-irr-calculator',
  title: 'NPV and IRR Calculator',
  category: 'finance',
  description: 'Find the net present value and internal rate of return of an investment from its cash flows. See if a project beats your required return.',
  keywords: ['npv calculator', 'irr calculator', 'net present value', 'internal rate of return', 'npv and irr', 'discounted cash flow calculator'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'c0', label: 'Initial investment', type: 'number', prefix: '$', default: 1000, min: 0, step: 50, info: 'The money you put in today (year 0). Enter it as a positive number.' },
    ...flowInputs,
    { id: 'rate', label: 'Discount rate', type: 'number', default: 10, min: -50, max: 100, step: 0.5, suffix: '% a year', info: 'Your required return, or the rate you could earn elsewhere.' },
  ],
  outputs: [
    { id: 'npv', label: 'Net present value', format: 'currency', precision: 2, primary: true, info: 'Present value of all cash flows minus the initial investment. Above zero means the project beats the discount rate.' },
    { id: 'irr', label: 'Internal rate of return', format: 'percent', precision: 2, info: 'The discount rate at which NPV is exactly zero.' },
    { id: 'total', label: 'Total cash returned', format: 'currency', precision: 2, info: 'Sum of the cash flows, before discounting.' },
    { id: 'pi', label: 'Profitability index', format: 'number', precision: 2, info: 'Present value of returns ÷ initial investment. Above 1 is worthwhile.' },
  ],
  compute: (v) => {
    const c0 = num(v.c0);
    const r = num(v.rate);
    if (c0 === null || r === null || c0 < 0 || r <= -100 || r > 100) return { npv: null };
    const flows: number[] = [-c0];
    for (let n = 1; n <= 6; n++) flows.push(num(v[`c${n}`]) ?? 0);
    while (flows.length > 1 && flows[flows.length - 1] === 0) flows.pop();
    if (flows.length < 2) return { npv: null };
    const rate = r / 100;
    const npv = npvAt(rate, flows);
    const pvIn = npv + c0;
    const rr = irr(flows);
    const total = flows.slice(1).reduce((a, b) => a + b, 0);
    const xs = flows.map((_, i) => `Yr ${i}`);
    const verdict = npv > 0 ? 'beats' : npv < 0 ? 'falls short of' : 'exactly matches';
    return {
      npv,
      irr: rr === null ? null : rr * 100,
      total,
      pi: c0 > 0 ? pvIn / c0 : null,
      chart: {
        type: 'bar',
        title: 'Cash flow each year',
        categories: xs,
        series: [{ name: 'Cash flow', values: flows }],
        format: { format: 'currency' },
      },
      steps: [
        `NPV = ${flows.map((f, t) => (t === 0 ? `−$${fmt(c0)}` : `$${fmt(f)} ÷ ${fmt(1 + rate, 4)}^${t}`)).join(' + ')}`,
        `NPV = $${fmt(npv)}`,
      ],
      note: `At a ${fmt(r)}% discount rate this project ${verdict} your required return (NPV $${fmt(npv)}).${rr === null ? ' No internal rate of return exists in the range −99% to 1,000%.' : ` Its IRR is ${fmt(rr * 100)}%.`}`,
    };
  },
  content: {
    formula: [
      'NPV = Σ CFₜ ÷ (1 + r)ᵗ, with CF₀ = −initial investment',
      'IRR = the rate r that makes NPV = 0',
      'Profitability index = (NPV + initial investment) ÷ initial investment',
    ],
    body: [
      'Net present value (NPV) turns a stream of future cash flows into today\'s money. Each flow is divided by (1 + r) raised to the number of years until it arrives, then the initial investment is subtracted. A positive NPV means the project earns more than your discount rate.',
      'The internal rate of return (IRR) is the discount rate at which the NPV is exactly zero. It is the project\'s own yearly return. If the IRR is higher than the rate you require, the project passes.',
      'Both assume cash flows arrive at the end of each year and can be reinvested at the discount rate. IRR can be unreliable when cash flows change sign more than once, because there may be several answers or none. This tool reports the one found between −99% and 1,000%.',
      'Use it for planning and comparing, not as a forecast. It ignores tax, risk and inflation unless you build them into your flows and rate.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: ['Invest $1,000 and receive $300, $400, $500 and $200 over four years, discounting at 10%. The present values are $272.73, $330.58, $375.66 and $136.60, which add to $1,115.57. NPV = $1,115.57 − $1,000 = $115.57. The IRR is about 15.32%, which is above 10%, so the project passes.'],
      },
    ],
    faq: [
      { q: 'What is a good NPV?', a: 'Any NPV above zero means the project earns more than your discount rate. When comparing projects, a larger NPV creates more value.' },
      { q: 'What is the difference between NPV and IRR?', a: 'NPV is a dollar amount at your chosen discount rate. IRR is the rate at which that amount would be zero. For $1,000 in and $300, $400, $500, $200 back, NPV at 10% is $115.57 and IRR is 15.32%.' },
      { q: 'Why does it say no IRR exists?', a: 'IRR needs the cash flows to change sign, for example money out then money in. If every flow is positive or all are outflows, there is no rate where NPV is zero.' },
      { q: 'What discount rate should I use?', a: 'Use the return you require, such as the rate you could earn on an alternative investment of similar risk, or your cost of borrowing.' },
    ],
    sources: [
      { label: 'Net present value (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Net_present_value' },
      { label: 'Internal rate of return (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Internal_rate_of_return' },
    ],
  },
  related: ['present-value', 'annuity-calculator', 'roi', 'cagr-calculator', 'compound-interest'],
  examples: [
    // PVs 272.7273+330.5785+375.6574+136.6027=1115.5659; NPV 115.57; IRR 15.3221%; PI 1.1156.
    { values: { c0: 1000, c1: 300, c2: 400, c3: 500, c4: 200, c5: 0, c6: 0, rate: 10 }, expect: { npv: 115.57, irr: 15.32, total: 1400, pi: 1.12 }, tolerance: 1e-2 },
    // -100 then 110 -> IRR exactly 10%; NPV at 10% = 0.
    { values: { c0: 100, c1: 110, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, rate: 10 }, expect: { npv: 0, irr: 10 }, tolerance: 1e-6 },
    // 500/1.08 + 500/1.1664 + 500/1.259712 = 462.963+428.669+396.916=1288.548; NPV 288.55; IRR 23.375%.
    { values: { c0: 1000, c1: 500, c2: 500, c3: 500, c4: 0, c5: 0, c6: 0, rate: 8 }, expect: { npv: 288.55, irr: 23.38 }, tolerance: 1e-2 },
  ],
});
