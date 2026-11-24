import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'dental-plan-worth-it',
  title: 'Dental Plan Worth It Calculator',
  category: 'finance',
  description: 'Is a dental or vision plan worth the premium? Compare the plan (premium plus your share) with paying cash for the care you expect this year.',
  keywords: ['is dental insurance worth it', 'dental plan worth it calculator', 'dental insurance vs paying cash', 'vision insurance worth it', 'dental insurance break even', 'dental plan annual maximum'],
  updated: '2026-11-24',
  inputs: [
    { id: 'premium', label: 'Annual premium', type: 'number', prefix: '$', default: 480, min: 0, step: 10, info: 'What you pay for the year. Monthly premium × 12.' },
    { id: 'deductible', label: 'Deductible', type: 'number', prefix: '$', default: 50, min: 0, step: 10, info: 'What you pay before the plan starts paying.' },
    { id: 'pct', label: 'Plan pays', type: 'number', suffix: '%', default: 80, min: 0, max: 100, step: 5, info: 'Share of covered cost the plan pays after the deductible.' },
    { id: 'max', label: 'Annual maximum', type: 'number', prefix: '$', default: 1500, min: 0, step: 100, info: 'The most the plan pays in a year.' },
    { id: 'care', label: 'Expected care at cash price', type: 'number', prefix: '$', default: 1500, min: 0, step: 50, info: 'Cleanings, fillings, glasses and so on, at the price you would pay without a plan.' },
  ],
  outputs: [
    { id: 'diff', label: 'Plan saves you', format: 'currency', primary: true, info: 'Cash cost of the care − (premium + what you still pay). Negative means the plan costs more.' },
    { id: 'planPays', label: 'Plan pays', format: 'currency', info: 'The smaller of the annual maximum and (care − deductible) × plan %.' },
    { id: 'youPay', label: 'You pay toward the care', format: 'currency', info: 'Care − plan pays.' },
    { id: 'withPlan', label: 'Total cost with the plan', format: 'currency', info: 'Premium + what you pay toward the care.' },
    { id: 'cash', label: 'Total cost paying cash', format: 'currency', info: 'The expected care at cash price.' },
  ],
  compute: (v) => {
    const premium = num(v.premium), ded = num(v.deductible), pct = num(v.pct), max = num(v.max), care = num(v.care);
    if ([premium, ded, pct, max, care].some((x) => x === null)) return { diff: null };
    if ([premium, ded, pct, max, care].some((x) => (x as number) < 0)) return { diff: null, error: 'Values cannot be negative.' };
    if ((pct as number) > 100) return { diff: null, error: 'Plan share cannot be above 100%.' };
    const planPays = Math.min(max as number, Math.max(0, (care as number) - (ded as number)) * ((pct as number) / 100));
    const youPay = (care as number) - planPays;
    const withPlan = (premium as number) + youPay;
    const diff = (care as number) - withPlan;
    // break-even care: plan pays = premium
    const better = diff >= 0;
    return {
      diff, planPays, youPay, withPlan, cash: care,
      tone: better ? 'good' : 'warn',
      badge: better ? `The plan comes out ${usd(diff)} ahead` : `Paying cash is ${usd(-diff)} cheaper`,
      chart: {
        type: 'bar',
        title: 'Total cost for the year',
        categories: ['Pay cash', 'With the plan'],
        series: [{ name: 'Cost', values: [care as number, withPlan] }],
        format: { format: 'currency' },
      },
      steps: [
        `Plan pays: min(${usd(max as number)}, (${usd(care as number)} − ${usd(ded as number)}) × ${pct}%) = ${usd(planPays)}`,
        `You pay: ${usd(care as number)} − ${usd(planPays)} = ${usd(youPay)}`,
        `With the plan: ${usd(premium as number)} + ${usd(youPay)} = ${usd(withPlan)}`,
        `Difference vs cash: ${usd(care as number)} − ${usd(withPlan)} = ${usd(diff)}`,
      ],
      note: 'Uses one year of expected care. It ignores waiting periods, network discounts, services the plan does not cover and any employer share of the premium (enter only what you pay).',
    };
  },
  content: {
    formula: [
      'Plan pays = min(annual maximum, max(0, care − deductible) × plan %)',
      'You pay = care − plan pays',
      'With the plan = premium + you pay',
      'Plan saves you = care − with the plan',
    ],
    body: [
      'A dental or vision plan is not like medical insurance: the annual maximum is low and the premium is often close to the value of two cleanings. It pays off mainly when you expect fillings, crowns or other work.',
      'Estimate the care you expect next year at the price you would pay without a plan, then compare the total with and without it. If the plan saves little, the premium is mostly buying peace of mind.',
      'Open enrollment is when most people can add or drop a plan, and benefits usually start in January, so late fall is the time to run the numbers.',
      'Check the plan for waiting periods, which can delay major work, and for which services count as covered. This calculator takes your estimates at face value.',
    ],
    faq: [
      { q: 'Is dental insurance worth it?', a: 'It is when the care you expect costs more than the premium plus your share. With a $480 premium, $50 deductible, 80% coverage and $1,500 maximum, $1,500 of care costs $820 with the plan, so it saves $680.' },
      { q: 'What if I only need cleanings?', a: 'With $300 of care in the same plan, the plan pays $200, you pay $100 and the total is $580, so it costs $280 more than paying cash.' },
      { q: 'What is the annual maximum?', a: 'The most the plan pays in a year. Once care exceeds it, you pay the rest.' },
      { q: 'Does this include waiting periods or network discounts?', a: 'No. Enter the care you expect at the price you would pay without a plan, and check the plan for waiting periods.' },
      { q: 'What if my employer pays part of the premium?', a: 'Enter only your share of the premium.' },
    ],
    sources: [
      { label: 'HealthCare.gov: Dental coverage in the Marketplace', url: 'https://www.healthcare.gov/dental/' },
    ],
  },
  related: ['health-plan-comparison', 'hsa-fsa-savings', 'deductible-breakeven'],
  examples: [
    // plan pays (1500-50)*.8 = 1160; you pay 340; with plan 820; saves 680
    { values: { premium: 480, deductible: 50, pct: 80, max: 1500, care: 1500 }, expect: { planPays: 1160, youPay: 340, withPlan: 820, diff: 680 }, tolerance: 0.01 },
    // care 300: plan pays 250*.8=200; you pay 100; with plan 580; diff -280
    { values: { premium: 480, deductible: 50, pct: 80, max: 1500, care: 300 }, expect: { planPays: 200, withPlan: 580, diff: -280 }, tolerance: 0.01 },
    // max binds: (5000-50)*.8=3960 -> 1500; you pay 3500; with plan 3980; saves 1020
    { values: { premium: 480, deductible: 50, pct: 80, max: 1500, care: 5000 }, expect: { planPays: 1500, youPay: 3500, diff: 1020 }, tolerance: 0.01 },
  ],
});
