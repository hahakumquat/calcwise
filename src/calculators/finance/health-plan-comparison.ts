import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

interface Plan {
  premium: number;
  ded: number;
  coins: number; // fraction 0..1
  oop: number;
  hsa: number;
}

/** Yearly cost = 12 x premium - HSA + min(OOP max, min(spend, deductible) + coinsurance x max(0, spend - deductible)). */
function yearlyCost(p: Plan, spend: number): number {
  const medical = Math.min(p.oop, Math.min(spend, p.ded) + p.coins * Math.max(0, spend - p.ded));
  return 12 * p.premium - p.hsa + medical;
}

/** Spend at which a plan's own medical bill stops growing (it hits the out-of-pocket max), or null if it never does. */
function capSpend(p: Plan): number | null {
  if (p.oop <= p.ded) return p.oop;
  if (p.coins > 0) return p.ded + (p.oop - p.ded) / p.coins;
  return null;
}

/**
 * Spend where the two yearly-cost lines cross. Both costs are piecewise linear in spend, so the
 * difference only changes slope at the breakpoints below. Returns null when the plans never cross,
 * cross more than once, or are equal over a stretch (ambiguous).
 */
function crossing(a: Plan, b: Plan): number | null {
  const pts = new Set<number>([0, a.ded, b.ded]);
  for (const p of [a, b]) {
    const c = capSpend(p);
    if (c !== null && Number.isFinite(c)) pts.add(c);
  }
  const xs = [...pts].filter((x) => x >= 0).sort((p, q) => p - q);
  const last = xs[xs.length - 1];
  xs.push(last + 1000); // both lines are flat past the last breakpoint
  const eps = 1e-9;
  const d = xs.map((x) => yearlyCost(a, x) - yearlyCost(b, x));
  let found: number | null = null;
  for (let i = 0; i < xs.length - 1; i++) {
    const d0 = d[i];
    const d1 = d[i + 1];
    if (Math.abs(d0) < eps && Math.abs(d1) < eps) return null; // equal over a range
    if (Math.abs(d0) < eps || Math.abs(d1) < eps) {
      // Touching zero at a breakpoint: only count it when the sign really flips across it.
      continue;
    }
    if (d0 * d1 < 0) {
      if (found !== null) return null;
      found = xs[i] + (xs[i + 1] - xs[i]) * (d0 / (d0 - d1));
    }
  }
  // Handle a zero exactly at a breakpoint with a real sign flip.
  for (let i = 1; i < xs.length - 1; i++) {
    if (Math.abs(d[i]) < eps && d[i - 1] * d[i + 1] < 0) {
      if (found !== null) return null;
      found = xs[i];
    }
  }
  return found;
}

export default defineCalculator({
  slug: 'health-plan-comparison',
  title: 'Health Plan Comparison Calculator',
  category: 'finance',
  description: 'Compare two health plans by total yearly cost at your expected medical spending: premium, deductible, coinsurance, out-of-pocket max and any employer HSA money.',
  keywords: ['health plan comparison calculator', 'compare health insurance plans', 'high deductible vs low deductible', 'deductible vs premium calculator', 'which health plan is cheaper', 'out of pocket max calculator'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'spend', label: 'Expected yearly medical spending', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, info: 'Total allowed charges for the year (the price the plan has agreed with providers), before you pay anything. Use a guess based on last year.' },
    { id: 'premiumA', label: 'Plan A monthly premium', type: 'number', prefix: '$', default: 200, min: 0, step: 5, info: 'What you pay each month for Plan A, after any employer share.' },
    { id: 'dedA', label: 'Plan A deductible', type: 'number', prefix: '$', default: 500, min: 0, step: 50, info: 'What you pay in full each year before the plan starts sharing costs.' },
    { id: 'coinsA', label: 'Plan A coinsurance (your share)', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 1, info: 'The share of each bill you pay after the deductible. 20% means the plan pays 80%.' },
    { id: 'oopA', label: 'Plan A out-of-pocket max', type: 'number', prefix: '$', default: 4000, min: 0, step: 100, info: 'The most you pay in a year for covered care, not counting premiums.' },
    { id: 'hsaA', label: 'Plan A employer HSA contribution (optional)', type: 'number', prefix: '$', default: 0, min: 0, step: 50, info: 'Yearly money your employer puts in a health savings account with this plan. Leave 0 if none.' },
    { id: 'premiumB', label: 'Plan B monthly premium', type: 'number', prefix: '$', default: 120, min: 0, step: 5, info: 'What you pay each month for Plan B, after any employer share.' },
    { id: 'dedB', label: 'Plan B deductible', type: 'number', prefix: '$', default: 3000, min: 0, step: 50, info: 'What you pay in full each year before the plan starts sharing costs.' },
    { id: 'coinsB', label: 'Plan B coinsurance (your share)', type: 'number', suffix: '%', default: 30, min: 0, max: 100, step: 1, info: 'The share of each bill you pay after the deductible.' },
    { id: 'oopB', label: 'Plan B out-of-pocket max', type: 'number', prefix: '$', default: 7000, min: 0, step: 100, info: 'The most you pay in a year for covered care, not counting premiums.' },
    { id: 'hsaB', label: 'Plan B employer HSA contribution (optional)', type: 'number', prefix: '$', default: 0, min: 0, step: 50, info: 'Yearly money your employer puts in a health savings account with this plan. Leave 0 if none.' },
  ],
  outputs: [
    { id: 'diff', label: 'Cheaper plan saves you', format: 'currency', precision: 0, primary: true, info: 'The gap in total yearly cost between the two plans at your expected spending.' },
    { id: 'cheaper', label: 'Cheaper plan', format: 'text', info: 'The plan with the lower total yearly cost at your expected spending.' },
    { id: 'costA', label: 'Plan A total yearly cost', format: 'currency', precision: 0, info: '12 × premium − employer HSA + your share of medical bills (capped at the out-of-pocket max).' },
    { id: 'costB', label: 'Plan B total yearly cost', format: 'currency', precision: 0, info: '12 × premium − employer HSA + your share of medical bills (capped at the out-of-pocket max).' },
    { id: 'crossover', label: 'Spending where the plans cost the same', format: 'currency', precision: 0, info: 'Below this spending one plan is cheaper, above it the other is. Blank if the plans never cross, or cross more than once.' },
  ],
  compute: (v) => {
    const spend = num(v.spend);
    const pa = num(v.premiumA);
    const da = num(v.dedA);
    const ca = num(v.coinsA);
    const oa = num(v.oopA);
    const ha = num(v.hsaA) ?? 0;
    const pb = num(v.premiumB);
    const db = num(v.dedB);
    const cb = num(v.coinsB);
    const ob = num(v.oopB);
    const hb = num(v.hsaB) ?? 0;
    if (spend === null || pa === null || da === null || ca === null || oa === null || pb === null || db === null || cb === null || ob === null) return { diff: null };
    if ([spend, pa, da, oa, ha, pb, db, ob, hb].some((x) => x < 0) || ca < 0 || ca > 100 || cb < 0 || cb > 100) return { diff: null };

    const A: Plan = { premium: pa, ded: da, coins: ca / 100, oop: oa, hsa: ha };
    const B: Plan = { premium: pb, ded: db, coins: cb / 100, oop: ob, hsa: hb };
    const costA = yearlyCost(A, spend);
    const costB = yearlyCost(B, spend);
    const gap = costB - costA; // positive: A cheaper
    const diff = Math.abs(gap);
    const cheaper = Math.abs(gap) < 0.005 ? 'About the same' : gap > 0 ? 'Plan A' : 'Plan B';
    const cross = crossing(A, B);

    const tableSpends = [0, 2000, 5000, 10000, 20000];
    const rows = tableSpends.map((s) => ({ s, a: yearlyCost(A, s), b: yearlyCost(B, s) }));

    const xmax = Math.max(20000, Math.ceil((spend * 1.25) / 1000) * 1000);
    const xset = new Set<number>();
    for (let k = 0; k <= 20; k++) xset.add(Math.round((xmax * k) / 20));
    xset.add(spend);
    const xs = [...xset].sort((p, q) => p - q);

    const medA = Math.min(A.oop, Math.min(spend, A.ded) + A.coins * Math.max(0, spend - A.ded));
    const medB = Math.min(B.oop, Math.min(spend, B.ded) + B.coins * Math.max(0, spend - B.ded));

    return {
      diff,
      cheaper,
      costA,
      costB,
      crossover: cross,
      tone: cheaper === 'About the same' ? 'ok' : 'good',
      badge: cheaper === 'About the same' ? 'About the same' : `${cheaper} costs less`,
      chart: {
        type: 'line',
        title: 'Total yearly cost by medical spending',
        x: xs,
        xLabel: 'Expected medical spending (allowed charges)',
        xFormat: { format: 'currency', precision: 0 },
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: 'Plan A', values: xs.map((x) => yearlyCost(A, x)) },
          { name: 'Plan B', values: xs.map((x) => yearlyCost(B, x)) },
        ],
        markers: [{ x: spend, label: 'Your estimate' }],
      },
      steps: [
        `Plan A: 12 × ${money(pa)} − ${money(ha)} HSA + ${money(medA)} medical = ${money(costA)}`,
        `Plan B: 12 × ${money(pb)} − ${money(hb)} HSA + ${money(medB)} medical = ${money(costB)}`,
        ...rows.map((r) => `At ${money(r.s)} of spending: Plan A ${money(r.a)}, Plan B ${money(r.b)} (${r.a < r.b - 0.005 ? 'A cheaper' : r.b < r.a - 0.005 ? 'B cheaper' : 'same'})`),
        cross !== null ? `The plans cost the same at about ${money(cross)} of spending.` : 'The plans do not cross at a single spending level, so no crossover is shown.',
      ],
      note: cheaper === 'About the same'
        ? 'At this spending the two plans cost about the same. This is a simplified model, so check your plan documents.'
        : `At ${money(spend)} of spending, ${cheaper} costs ${money(diff)} less over the year. This is a simplified model, so check your plan documents.`,
    };
  },
  content: {
    formula: [
      'Your medical bill = the smaller of (out-of-pocket max) and (the smaller of spending and deductible + coinsurance × spending above the deductible)',
      'Total yearly cost = 12 × monthly premium − employer HSA contribution + your medical bill',
      'The plans cross where their two yearly costs are equal; the lines are straight between the deductible and out-of-pocket points, so the crossing is found by solving the straight-line equation',
    ],
    body: [
      'A lower premium does not always mean a cheaper year. A plan with a small premium usually has a larger deductible, so you pay more yourself when you use care. A plan with a high premium usually costs less when you need a lot. The right choice depends on how much care you expect to use.',
      'This calculator adds up the whole year for each plan: twelve premiums, minus any money your employer puts in a health savings account, plus your share of the medical bills. Your share is the deductible first, then your coinsurance percentage on what is left, and it never goes above the out-of-pocket max.',
      'Try Plan A with a 200 dollar premium, a 500 dollar deductible, 20% coinsurance and a 4,000 dollar out-of-pocket max against Plan B with a 120 dollar premium, a 3,000 dollar deductible, 30% coinsurance and a 7,000 dollar max. At 5,000 dollars of spending, Plan A costs 2,400 plus 1,400, which is 3,800 dollars. Plan B costs 1,440 plus 3,600, which is 5,040 dollars. Plan A is cheaper by 1,240 dollars. At 1,700 dollars of spending the two cost the same, and Plan B is cheaper below that.',
      'This is a simplified model. It does not include copays, networks, prescription tiers, services that skip the deductible, or tax effects of paying premiums or using an HSA. Spending means allowed charges, which can differ from the bill you see. Check your plan documents for the real terms. This tool is not medical or insurance advice.',
    ],
    faq: [
      { q: 'How is the yearly cost of each plan calculated?', a: 'Total yearly cost = 12 × monthly premium − employer HSA contribution + your medical bill. Your medical bill is the deductible (or your spending, if lower) plus your coinsurance share of spending above the deductible, capped at the out-of-pocket max.' },
      { q: 'What does the crossover figure mean?', a: 'It is the yearly medical spending at which both plans cost the same in total. If you expect to spend less, one plan is cheaper; if you expect to spend more, the other is. With the default example it is 1,700 dollars: below that Plan B is cheaper, above it Plan A is. If the plans never cross, or cross more than once, the calculator leaves it blank.' },
      { q: 'What should I enter as expected spending?', a: 'Use allowed charges, the amounts the plan has agreed with providers, for the care you expect in a year. Last year\'s totals are a common starting point. Because real needs are uncertain, try several amounts and look at the table of results.' },
      { q: 'Does the out-of-pocket max include premiums?', a: 'In this calculator, no. Premiums are added separately, and the out-of-pocket max only limits your share of medical bills. Check your plan documents to see exactly what counts toward the max.' },
      { q: 'What is not included?', a: 'Copays, provider networks, prescription tiers, services covered before the deductible, tax effects and the value of leftover HSA money are not modelled. Check your plan documents for the real terms.' },
    ],
    sources: [
      { label: 'HealthCare.gov: Glossary of health coverage terms', url: 'https://www.healthcare.gov/glossary/' },
      { label: 'HealthCare.gov: Out-of-pocket maximum/limit', url: 'https://www.healthcare.gov/glossary/out-of-pocket-maximum-limit/' },
    ],
  },
  related: ['hsa-fsa-savings', 'fsa-spend-down', 'take-home-pay'],
  examples: [
    {
      // A: 2400 + min(4000, 500 + 0.2 x 4500 = 1400) = 3800; B: 1440 + min(7000, 3000 + 0.3 x 2000 = 3600) = 5040; gap 1240
      // Crossing: 2900 + 0.2(s - 500) = 1440 + s  ->  0.8 s = 1360  ->  s = 1700
      values: { spend: 5000, premiumA: 200, dedA: 500, coinsA: 20, oopA: 4000, hsaA: 0, premiumB: 120, dedB: 3000, coinsB: 30, oopB: 7000, hsaB: 0 },
      expect: { costA: 3800, costB: 5040, diff: 1240, cheaper: 'Plan A', crossover: 1700 },
      tolerance: 1e-6,
    },
    {
      // spend 0: premiums only. A = 2400, B = 1440, B cheaper by 960
      values: { spend: 0, premiumA: 200, dedA: 500, coinsA: 20, oopA: 4000, hsaA: 0, premiumB: 120, dedB: 3000, coinsB: 30, oopB: 7000, hsaB: 0 },
      expect: { costA: 2400, costB: 1440, diff: 960, cheaper: 'Plan B' },
      tolerance: 1e-6,
    },
    {
      // spend 30000 is above both caps: A = 2400 + 4000 = 6400; B = 1440 + 7000 = 8440; gap 2040
      values: { spend: 30000, premiumA: 200, dedA: 500, coinsA: 20, oopA: 4000, hsaA: 0, premiumB: 120, dedB: 3000, coinsB: 30, oopB: 7000, hsaB: 0 },
      expect: { costA: 6400, costB: 8440, diff: 2040, cheaper: 'Plan A' },
      tolerance: 1e-6,
    },
    {
      // HSA 500 on A: 2400 - 500 + 1400 = 3300; B 5040; gap 1740
      values: { spend: 5000, premiumA: 200, dedA: 500, coinsA: 20, oopA: 4000, hsaA: 500, premiumB: 120, dedB: 3000, coinsB: 30, oopB: 7000, hsaB: 0 },
      expect: { costA: 3300, costB: 5040, diff: 1740 },
      tolerance: 1e-6,
    },
  ],
});
