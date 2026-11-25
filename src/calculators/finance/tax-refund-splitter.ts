import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'tax-refund-splitter',
  title: 'Tax Refund Splitter Calculator',
  category: 'finance',
  description: 'Split your tax refund between debt payoff, savings and spending. See how much goes to each goal and what the debt and savings share earns in the first year.',
  keywords: ['tax refund splitter', 'what to do with tax refund', 'tax refund calculator split', 'refund debt vs savings', 'how to spend tax refund'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'refund', label: 'Tax refund', type: 'number', prefix: '$', default: 2400, min: 0, step: 100, info: 'The amount you expect to receive.' },
    { id: 'debtShare', label: 'Share to debt payoff', type: 'number', suffix: '%', default: 50, min: 0, max: 100, step: 5, info: 'Percent of the refund you put toward debt.' },
    { id: 'apr', label: 'Interest rate on that debt (APR)', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 0.5, info: 'Paying off debt saves about this much per year, in simple terms.' },
    { id: 'saveShare', label: 'Share to savings', type: 'number', suffix: '%', default: 30, min: 0, max: 100, step: 5, info: 'Percent of the refund you put into savings.' },
    { id: 'apy', label: 'Savings yield (APY)', type: 'number', suffix: '%', default: 4, min: 0, max: 100, step: 0.1, info: 'What the savings account pays per year.' },
  ],
  outputs: [
    { id: 'gain', label: 'First-year gain', format: 'currency', precision: 2, primary: true, info: 'Interest saved on the debt plus interest earned on savings, simple annual.' },
    { id: 'debt', label: 'To debt', format: 'currency', precision: 2, info: 'Refund × debt share.' },
    { id: 'savings', label: 'To savings', format: 'currency', precision: 2, info: 'Refund × savings share.' },
    { id: 'rest', label: 'Left to spend or invest', format: 'currency', precision: 2, info: 'The rest of the refund. No return is assumed.' },
  ],
  compute: (v) => {
    const r = num(v.refund);
    const ds = num(v.debtShare);
    const a = num(v.apr);
    const ss = num(v.saveShare);
    const y = num(v.apy);
    if ([r, ds, a, ss, y].some((x) => x === null)) return { gain: null };
    if ([r, ds, a, ss, y].some((x) => (x as number) < 0)) return { gain: null, error: 'Values cannot be negative.' };
    if (ds! + ss! > 100) return { gain: null, error: 'Debt and savings shares add up to more than 100%.' };
    const debt = r! * ds! / 100;
    const savings = r! * ss! / 100;
    const rest = r! - debt - savings;
    const saved = debt * a! / 100;
    const earned = savings * y! / 100;
    const gain = saved + earned;
    return {
      gain,
      debt,
      savings,
      rest,
      tone: 'good',
      badge: `${money(debt, 0)} debt, ${money(savings, 0)} savings, ${money(rest, 0)} left`,
      note: `Over a year, ${money(saved)} of interest avoided on debt plus ${money(earned)} earned on savings. Simple annual interest, no compounding; the rates are the ones you entered.`,
      chart: {
        type: 'donut' as const,
        title: 'Where the refund goes',
        slices: [
          { label: 'Debt', value: debt },
          { label: 'Savings', value: savings },
          { label: 'Spend or invest', value: rest },
        ].filter((s) => s.value > 0),
        format: CURRENCY,
        centerLabel: 'Refund',
        centerValue: money(r!, 0),
      },
      steps: [
        `To debt = ${money(r!)} × ${ds}% = ${money(debt)}`,
        `To savings = ${money(r!)} × ${ss}% = ${money(savings)}`,
        `Left over = ${money(r!)} − ${money(debt)} − ${money(savings)} = ${money(rest)}`,
        `Gain = ${money(debt)} × ${a}% + ${money(savings)} × ${y}% = ${money(gain)}`,
      ],
    };
  },
  content: {
    formula: [
      'To debt = refund × debt share',
      'To savings = refund × savings share',
      'Left over = refund − debt − savings',
      'First-year gain = debt × APR + savings × APY',
    ],
    body: [
      'A refund is one lump sum, and the split matters. Paying down a card at 22% APR saves far more than a savings account paying 4%, so the debt share usually does the heavy lifting.',
      'Example: a $2,400 refund with 50% to debt at 22% and 30% to savings at 4%. That is $1,200 to debt and $720 to savings, with $480 left. The year-one gain is $264 saved on interest plus $28.80 earned, or $292.80.',
      'The remainder is assumed to earn nothing, and interest is simple annual with no compounding. Tax effects on interest are ignored. To see what over-withholding cost you during the year, try the refund interest forgone calculator. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How is the refund split?', a: 'Each share is a percent of the refund. Debt and savings shares can add up to at most 100%, and whatever is left is yours to spend or invest.' },
      { q: 'What is the gain for a $2,400 refund?', a: 'With 50% to debt at 22% and 30% to savings at 4%, it is $292.80 in the first year: $264 of interest avoided plus $28.80 earned.' },
      { q: 'Is paying off debt better than saving?', a: 'When the debt rate is higher than the savings yield, paying it down earns more. Keep a small emergency cushion so a surprise bill does not go back on the card.' },
      { q: 'Does it include compounding or taxes?', a: 'No. It uses simple annual interest and ignores tax on interest, so treat the result as an estimate.' },
      { q: 'Does it tell me how big my refund will be?', a: 'No. Enter the amount from your return or an estimate from the tax refund estimator.' },
    ],
    sources: [
      { label: 'IRS: Tax refunds', url: 'https://www.irs.gov/refunds' },
      { label: 'Consumer Financial Protection Bureau: Paying off debt', url: 'https://www.consumerfinance.gov/consumer-tools/debt-collection/' },
    ],
  },
  related: ['refund-interest-forgone', 'debt-vs-invest', 'tax-refund-estimator', 'savings-goal'],
  examples: [
    // debt 1200; savings 720; rest 480; gain 1200*.22 + 720*.04 = 264 + 28.8 = 292.8
    { values: { refund: 2400, debtShare: 50, apr: 22, saveShare: 30, apy: 4 }, expect: { debt: 1200, savings: 720, rest: 480, gain: 292.8 } },
    // all to debt: 1000 at 10% -> 100
    { values: { refund: 1000, debtShare: 100, apr: 10, saveShare: 0, apy: 4 }, expect: { debt: 1000, savings: 0, rest: 0, gain: 100 } },
  ],
});
