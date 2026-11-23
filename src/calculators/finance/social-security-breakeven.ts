import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'social-security-breakeven',
  title: 'Social Security Breakeven Age Calculator',
  category: 'finance',
  description: 'Find the age when claiming Social Security later overtakes claiming early, using the monthly amounts from your own ssa.gov statement.',
  keywords: ['social security breakeven calculator', 'claim at 62 vs 67', 'claim at 70 vs 67', 'social security claiming age', 'break even age social security', 'when to claim social security'],
  updated: '2026-11-23',
  inputs: [
    { id: 'earlyAge', label: 'Early claiming age', type: 'number', default: 62, min: 50, max: 80, step: 1, suffix: 'years', info: 'The younger age you are considering, for example 62. Use whole years.' },
    { id: 'earlyMonthly', label: 'Monthly benefit at early age', type: 'number', prefix: '$', default: 2000, min: 0, step: 10, info: 'The monthly amount your ssa.gov statement shows if you claim at the early age.' },
    { id: 'laterAge', label: 'Later claiming age', type: 'number', default: 67, min: 50, max: 80, step: 1, suffix: 'years', info: 'The older age you are considering, for example 67 or 70. Use whole years.' },
    { id: 'laterMonthly', label: 'Monthly benefit at later age', type: 'number', prefix: '$', default: 2800, min: 0, step: 10, info: 'The monthly amount your ssa.gov statement shows if you claim at the later age.' },
    { id: 'liveTo', label: 'Planning to live to', type: 'number', optional: true, default: 85, min: 60, max: 110, step: 1, suffix: 'years', info: 'Optional. The age used for the total-benefits comparison. Defaults to 85 if left empty.' },
  ],
  outputs: [
    { id: 'breakeven', label: 'Breakeven age', format: 'number', suffix: 'years', primary: true, info: 'Later claiming age + (months of head start × early benefit) ÷ monthly gain ÷ 12. After this age the later claim has paid more in total.' },
    { id: 'extra', label: 'Extra per month if you wait', format: 'currency', info: 'Later monthly benefit minus early monthly benefit.' },
    { id: 'cumEarly', label: 'Total received, claim early', format: 'currency', info: 'Early benefit × 12 × years from the early age to your planning age, with no COLA, tax or discounting.' },
    { id: 'cumLater', label: 'Total received, claim later', format: 'currency', info: 'Later benefit × 12 × years from the later age to your planning age (zero if you do not reach it).' },
    { id: 'diff', label: 'Later minus early at that age', format: 'currency', info: 'Positive means waiting has paid more in total by your planning age; negative means claiming early is ahead.' },
  ],
  compute: (v) => {
    const ea = num(v.earlyAge);
    const em = num(v.earlyMonthly);
    const la = num(v.laterAge);
    const lm = num(v.laterMonthly);
    const live = num(v.liveTo) ?? 85;
    if (ea === null || em === null || la === null || lm === null) return { breakeven: null };
    if (em <= 0) return { breakeven: null, error: 'Enter a monthly benefit above zero for the early claim.' };
    if (la <= ea) return { breakeven: null, error: 'The later claiming age must be higher than the early claiming age.' };
    if (lm <= em) return { breakeven: null, error: 'The later monthly benefit must be higher than the early one. If it is not, waiting never catches up, so check the amounts on your statement.' };

    const gain = lm - em;
    const headStart = (la - ea) * 12 * em;
    const months = headStart / gain;
    const breakeven = la + months / 12;
    const total = (age: number, claim: number, monthly: number) => (age > claim ? (age - claim) * 12 * monthly : 0);
    const cumEarly = total(live, ea, em);
    const cumLater = total(live, la, lm);
    const diff = cumLater - cumEarly;

    const end = Math.min(110, Math.max(Math.ceil(live), Math.ceil(breakeven) + 3));
    const xs: number[] = [];
    for (let a = ea; a <= end; a++) xs.push(a);
    const chart: ChartSpec = {
      type: 'line',
      title: 'Total benefits received by age',
      x: xs,
      xLabel: 'Age',
      yFormat: { format: 'currency' },
      series: [
        { name: `Claim at ${ea}`, values: xs.map((a) => total(a, ea, em)) },
        { name: `Claim at ${la}`, values: xs.map((a) => total(a, la, lm)) },
      ],
    };
    const ageText = `${+breakeven.toFixed(1)}`;
    return {
      breakeven,
      extra: gain,
      cumEarly,
      cumLater,
      diff,
      tone: 'ok',
      badge: `Breakeven at age ${ageText}`,
      chart,
      note: `Illustration, not advice. It ignores COLA, taxes, spousal and survivor benefits and the time value of money. ${diff >= 0 ? `By age ${live}, waiting is ahead by ${money(diff, 0)}.` : `By age ${live}, claiming early is still ahead by ${money(-diff, 0)}.`}`,
      steps: [
        `Head start = (${la} − ${ea}) × 12 months × ${money(em, 0)} = ${money(headStart, 0)}`,
        `Extra per month = ${money(lm, 0)} − ${money(em, 0)} = ${money(gain, 0)}`,
        `Months to catch up = ${money(headStart, 0)} ÷ ${money(gain, 0)} = ${+months.toFixed(1)}, about ${+(months / 12).toFixed(1)} years after ${la}`,
        `Breakeven age = ${la} + ${+(months / 12).toFixed(1)} = ${ageText}`,
      ],
    };
  },
  content: {
    formula: [
      'Head start = (later age − early age) × 12 × early monthly benefit',
      'Months to catch up = head start ÷ (later monthly − early monthly)',
      'Breakeven age = later age + months to catch up ÷ 12',
    ],
    body: [
      'When you claim Social Security matters. Claiming early gives you smaller checks for more years; claiming later gives you bigger checks for fewer years. The breakeven age is the point where the total you would have collected by waiting catches up with the total from claiming early.',
      'Enter the two monthly amounts from your own statement at ssa.gov, along with the two ages. The calculator does not estimate the reduction or the delayed credits for you, so it always uses your real numbers. The chart shows the running total for each choice by age.',
      'This is a simple illustration, not advice. It leaves out cost-of-living adjustments, taxes, spousal and survivor benefits, working before full retirement age, and what you could earn by investing the early checks. Your health, other income and household needs matter too.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: ['Claiming at 62 pays $2,000 a month; claiming at 67 pays $2,800. Starting five years earlier gives a head start of 60 months × $2,000 = $120,000. Waiting pays $800 more a month, so it takes $120,000 ÷ $800 = 150 months, or 12.5 years, to catch up. The breakeven age is 67 + 12.5 = 79.5. By age 85 the early claim has paid 276 months × $2,000 = $552,000 and the later claim 216 months × $2,800 = $604,800.'],
      },
    ],
    faq: [
      { q: 'What is the Social Security breakeven age?', a: 'It is the age when the total benefits from claiming later equal the total from claiming early. With $2,000 at 62 and $2,800 at 67, it is age 79.5.' },
      { q: 'Where do I get the monthly amounts?', a: 'Sign in to your my Social Security account at ssa.gov. Your statement lists estimated monthly benefits at different claiming ages. Enter those exact figures.' },
      { q: 'What does the calculator do if the later benefit is not higher?', a: 'It shows a message instead of a result, because waiting would never catch up. The same happens if the later age is not above the early age.' },
      { q: 'What if I leave the planning age empty?', a: 'It uses 85. If your planning age is below the later claiming age, the later claim has paid nothing yet, so the early claim is ahead.' },
      { q: 'Does this include COLA or taxes?', a: 'No. It uses flat monthly amounts with no cost-of-living raises, taxes or discounting, so treat the breakeven age as a rough guide, not advice.' },
    ],
    sources: [
      { label: 'Social Security Administration: When to start receiving retirement benefits', url: 'https://www.ssa.gov/benefits/retirement/planner/agereduction.html' },
      { label: 'Social Security Administration: my Social Security account', url: 'https://www.ssa.gov/myaccount/' },
    ],
  },
  related: ['social-security-cola', 'compound-interest', 'inflation'],
  examples: [
    // Head start 5×12×2000 = 120,000; gain 800; 150 months = 12.5 yr; 67+12.5 = 79.5.
    // Age 85: early 23×12×2000 = 552,000; later 18×12×2800 = 604,800; diff 52,800.
    { values: { earlyAge: 62, earlyMonthly: 2000, laterAge: 67, laterMonthly: 2800, liveTo: 85 }, expect: { breakeven: 79.5, extra: 800, cumEarly: 552000, cumLater: 604800, diff: 52800 } },
    // 67 vs 70: head start 36×2500 = 90,000; gain 600; 150 months; 70+12.5 = 82.5.
    // Age 80: early 13×12×2500 = 390,000; later 10×12×3100 = 372,000; diff −18,000.
    { values: { earlyAge: 67, earlyMonthly: 2500, laterAge: 70, laterMonthly: 3100, liveTo: 80 }, expect: { breakeven: 82.5, extra: 600, cumEarly: 390000, cumLater: 372000, diff: -18000 } },
  ],
});
