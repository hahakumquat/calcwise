import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'deductible-breakeven',
  title: 'Insurance Deductible Break-Even Calculator',
  category: 'finance',
  description: 'Compare a low and a high insurance deductible: how many claim-free years the cheaper premium needs to pay off, and the claim chance where both cost the same.',
  keywords: ['insurance deductible calculator', 'high vs low deductible', 'deductible break even', 'car insurance deductible 500 vs 1000', 'homeowners deductible calculator', 'should i raise my deductible'],
  updated: '2026-11-23',
  inputs: [
    { id: 'lowPremium', label: 'Yearly premium, low deductible', type: 'number', prefix: '$', default: 1400, min: 0, step: 25, info: 'What the lower-deductible policy costs per year.' },
    { id: 'lowDeductible', label: 'Low deductible', type: 'number', prefix: '$', default: 500, min: 0, step: 100, info: 'What you pay out of pocket on a claim with the lower-deductible policy.' },
    { id: 'highPremium', label: 'Yearly premium, high deductible', type: 'number', prefix: '$', default: 1100, min: 0, step: 25, info: 'What the higher-deductible policy costs per year. It should be lower than the other premium.' },
    { id: 'highDeductible', label: 'High deductible', type: 'number', prefix: '$', default: 1500, min: 0, step: 100, info: 'What you pay out of pocket on a claim with the higher-deductible policy.' },
    { id: 'chance', label: 'Your chance of a claim in a year', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, info: 'Your own estimate. It is not a prediction. Used for the expected-cost comparison only.' },
  ],
  outputs: [
    { id: 'years', label: 'Claim-free years to break even', format: 'number', precision: 1, suffix: 'years', primary: true, info: 'Extra cost of one claim under the high deductible divided by the premium saved each year.' },
    { id: 'saving', label: 'Premium saved each year', format: 'currency', info: 'Low-deductible premium minus high-deductible premium.' },
    { id: 'extra', label: 'Extra cost of a claim', format: 'currency', info: 'High deductible minus low deductible.' },
    { id: 'breakChance', label: 'Break-even claim chance per year', format: 'percent', precision: 1, info: 'Premium saved divided by the extra cost of a claim. Above this chance a year, the low deductible costs less on average.' },
    { id: 'expectedGap', label: 'Expected yearly gain from the high deductible', format: 'currency', info: 'Premium saved minus your claim chance × the extra cost of a claim. Negative means the low deductible is cheaper on average.' },
  ],
  compute: (v) => {
    const lp = num(v.lowPremium);
    const ld = num(v.lowDeductible);
    const hp = num(v.highPremium);
    const hd = num(v.highDeductible);
    const chance = num(v.chance);
    if (lp === null || ld === null || hp === null || hd === null || chance === null) return { years: null };
    if (lp < 0 || ld < 0 || hp < 0 || hd < 0) return { years: null, error: 'Values cannot be negative.' };
    if (chance < 0 || chance > 100) return { years: null, error: 'The claim chance must be between 0% and 100%.' };
    const saving = lp - hp;
    const extra = hd - ld;
    if (extra <= 0) return { years: null, error: 'The high deductible must be larger than the low deductible.' };
    if (saving <= 0) return { years: null, error: 'The high-deductible premium should be lower than the low-deductible premium, or there is nothing to gain.' };
    const years = extra / saving;
    const breakChance = saving / extra;
    const p = chance / 100;
    const expectedGap = saving - p * extra;
    const winsHigh = expectedGap > 0.005;
    const winsLow = expectedGap < -0.005;
    const expLow = lp + p * ld;
    const expHigh = hp + p * hd;
    return {
      years,
      saving,
      extra,
      breakChance: Math.min(breakChance, 1),
      expectedGap,
      tone: winsHigh ? 'good' : 'ok',
      badge: winsHigh ? 'High deductible costs less on average' : winsLow ? 'Low deductible costs less on average' : 'Both cost the same on average',
      chart: {
        type: 'bar',
        title: 'Expected yearly cost at a ' + chance + '% claim chance',
        categories: ['Low deductible', 'High deductible'],
        series: [{ name: 'Expected cost', values: [expLow, expHigh] }],
        format: { format: 'currency' },
      },
      steps: [
        `Premium saved: ${usd(lp)} − ${usd(hp)} = ${usd(saving)} a year`,
        `Extra cost of a claim: ${usd(hd)} − ${usd(ld)} = ${usd(extra)}`,
        `Break-even: ${usd(extra)} ÷ ${usd(saving)} = ${+years.toFixed(2)} claim-free years`,
        `Break-even claim chance: ${usd(saving)} ÷ ${usd(extra)} = ${+(breakChance * 100).toFixed(2)}% a year`,
        `Expected cost at ${chance}%: low ${usd(lp)} + ${chance}% × ${usd(ld)} = ${usd(expLow)}; high ${usd(hp)} + ${chance}% × ${usd(hd)} = ${usd(expHigh)}`,
      ],
      note: 'Assumes at most one claim a year and that every claim is larger than the high deductible. Smaller claims cost you less under the high deductible than shown here. A claim can also raise your future premiums, and you need the higher deductible in cash. Neither is computed. Your own claim chance is an estimate.',
    };
  },
  content: {
    formula: [
      'Premium saved = low-deductible premium − high-deductible premium',
      'Extra cost of a claim = high deductible − low deductible',
      'Break-even years = extra cost of a claim ÷ premium saved',
      'Break-even claim chance per year = premium saved ÷ extra cost of a claim',
    ],
    body: [
      'A higher deductible lowers your premium, but you pay more out of pocket when you do file a claim. This calculator turns that trade into two plain numbers: how many years without a claim it takes for the cheaper premium to cover the bigger deductible, and how likely a claim has to be before the low deductible becomes the better deal.',
      'Enter both quotes from your renewal or from a comparison. For example, a $1,400 premium with a $500 deductible against $1,100 with a $1,500 deductible saves $300 a year and costs $1,000 more per claim, so the high deductible pays off after about 3.3 claim-free years, or if your chance of a claim is below 30% a year.',
      'Your claim chance is the soft number here. Many people file far less than once in ten years, but it depends on your car, home, area and history. Try a range of values rather than trusting one.',
      'This is a two-option comparison for car, home or renters insurance. For health plans with coinsurance and an out-of-pocket maximum, use the health plan comparison. A cash cushion matters too: a high deductible only helps if you could pay it without borrowing.',
    ],
    faq: [
      { q: 'How do I know if a higher deductible is worth it?', a: 'Divide the extra deductible by the premium you save. In the example of $1,000 extra and $300 saved a year, you need about 3.3 claim-free years to come out ahead. If you expect a claim sooner than that, the low deductible is cheaper.' },
      { q: 'What is the break-even claim chance?', a: 'It is the premium saved divided by the extra cost of a claim. With $300 saved and $1,000 extra, it is 30% a year. Below that chance the high deductible costs less on average; above it the low deductible does.' },
      { q: 'What does the expected gain mean?', a: 'It is the premium saved minus your claim chance times the extra cost of a claim. With a 10% chance it is $300 − 10% × $1,000 = $200 a year in favour of the high deductible. It is an average, not what any single year looks like.' },
      { q: 'Does a claim raise my premiums?', a: 'Often yes, and that cost is not included here. If a claim would raise your premium for several years, the real cost of filing is higher under both options.' },
      { q: 'Should I pick the highest deductible I can?', a: 'Only if you could pay it from savings without stress. A deductible you cannot afford can mean skipping a claim or taking on debt.' },
    ],
    sources: [
      { label: 'NAIC: Understanding your insurance deductible', url: 'https://content.naic.org/' },
      { label: 'Insurance Information Institute: Deductibles', url: 'https://www.iii.org/' },
    ],
  },
  related: ['health-plan-comparison', 'standard-vs-itemized', 'emergency-fund'],
  examples: [
    // saving 300, extra 1000: years 3.3333, chance 0.3, gap 300 - 0.1*1000 = 200
    { values: { lowPremium: 1400, lowDeductible: 500, highPremium: 1100, highDeductible: 1500, chance: 10 }, expect: { years: 3.3333, saving: 300, extra: 1000, breakChance: 0.3, expectedGap: 200 }, tolerance: 0.001 },
    // saving 200, extra 500: years 2.5, chance 0.4, at 50%: 200 - 250 = -50
    { values: { lowPremium: 1000, lowDeductible: 250, highPremium: 800, highDeductible: 750, chance: 50 }, expect: { years: 2.5, breakChance: 0.4, expectedGap: -50 }, tolerance: 1e-6 },
  ],
});
