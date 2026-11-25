import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'per-diem-vs-actual',
  title: 'Per Diem vs Actual Trip Spend Calculator',
  category: 'finance',
  description: 'Compare a fixed per diem allowance with what you really spent on a business trip, with the travel-day share applied, and see which comes out ahead.',
  keywords: ['per diem vs actual expenses', 'per diem calculator', 'per diem travel day 75 percent', 'per diem or actual expense reimbursement', 'business trip per diem calculator'],
  updated: '2026-11-25',
  inputs: [
    { id: 'days', label: 'Days of travel', type: 'number', default: 5, min: 1, max: 365, step: 1, info: 'Count the first and last day.' },
    { id: 'rate', label: 'Per diem rate per day', type: 'number', prefix: '$', default: 68, min: 0, step: 1, info: 'The daily rate your employer or the rate table gives you for meals and incidentals.' },
    { id: 'share', label: 'Share paid on first and last day', type: 'number', suffix: '%', default: 75, min: 0, max: 100, step: 5, info: 'Many rules pay 75% on travel days. Set 100 to pay full days throughout.' },
    { id: 'actual', label: 'What you actually spent in total', type: 'number', prefix: '$', default: 390, min: 0, step: 5, info: 'Meals and incidentals over the whole trip.' },
  ],
  outputs: [
    { id: 'perDiem', label: 'Per diem total', format: 'currency', primary: true, info: 'Full days × rate, plus travel days × rate × travel-day share.' },
    { id: 'diff', label: 'Actual spend minus per diem', format: 'currency', info: 'Positive means you spent more than the allowance.' },
    { id: 'perDay', label: 'Actual spend per day', format: 'currency', info: 'Actual spend ÷ days.' },
  ],
  compute: (v) => {
    const days = num(v.days), rate = num(v.rate), share = num(v.share), actual = num(v.actual);
    if (days === null || rate === null || share === null || actual === null) return { perDiem: null };
    if (days < 1 || !Number.isInteger(days)) return { perDiem: null, error: 'Enter a whole number of days, at least 1.' };
    if (rate < 0 || actual < 0) return { perDiem: null, error: 'Amounts cannot be negative.' };
    if (share < 0 || share > 100) return { perDiem: null, error: 'Travel-day share must be from 0% to 100%.' };
    const travelDays = Math.min(days, 2);
    const fullDays = days - travelDays;
    const perDiem = fullDays * rate + travelDays * rate * share / 100;
    const diff = actual - perDiem;
    const perDay = actual / days;
    return {
      perDiem, diff, perDay,
      tone: diff > 0 ? 'warn' : 'good',
      badge: diff > 0 ? `You spent ${usd(diff)} more than the per diem` : diff < 0 ? `The per diem is ${usd(-diff)} more than you spent` : 'The per diem matches your spend',
      chart: {
        type: 'bar',
        title: 'Per diem vs actual spend',
        categories: ['Per diem', 'Actual spend'],
        series: [{ name: 'Trip total', values: [perDiem, actual] }],
        format: { format: 'currency' },
      },
      steps: [
        `Full days = ${days} − ${travelDays} travel day${travelDays === 1 ? '' : 's'} = ${fullDays}`,
        `Per diem = ${fullDays} × ${usd(rate)} + ${travelDays} × ${usd(rate)} × ${share}% = ${usd(perDiem)}`,
        `Actual − per diem = ${usd(actual)} − ${usd(perDiem)} = ${usd(diff)}`,
      ],
      note: 'A single-day trip counts as one travel day. Rates, whether your employer reimburses actuals instead, and the tax treatment are not modelled.',
    };
  },
  content: {
    formula: ['Travel days = first and last day (1 for a one-day trip)', 'Per diem = full days × rate + travel days × rate × travel-day share', 'Difference = actual spend − per diem'],
    body: [
      'A per diem pays a fixed daily amount whatever you spend. Actual reimbursement pays what your receipts show. This calculator totals the per diem, with the reduced share on the first and last day, and sets it against your actual spend.',
      'Example: 5 days at $68 with a 75% travel-day share is 3 full days ($204) plus 2 travel days ($102), so $306. If you spent $390, you spent $84 more than the allowance. Second example: 3 days at $80 is $80 plus 2 × $60, or $200; spending $180 leaves $20 of per diem unspent.',
      'The rate and travel-day share are inputs because they depend on your employer and destination. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How is a per diem total calculated here?', a: 'Full days × the daily rate plus the first and last day at the travel-day share. Five days at $68 with 75% is 3 × $68 + 2 × $51 = $306.' },
      { q: 'Why is the first and last day paid less?', a: 'Many per diem rules pay 75% on travel days because you are away for only part of those days. The share is an input, so set 100 to pay full days.' },
      { q: 'What if my trip is one day?', a: 'It is treated as a single travel day, so you get the rate times the travel-day share, for example $80 × 75% = $60.' },
      { q: 'Is a per diem better than actual expenses?', a: 'It depends on your spending. If actual spend is under the per diem total you keep the difference, and if it is over you absorb the extra, as in the $390 vs $306 example.' },
      { q: 'Where do I find the correct rate?', a: 'Ask your employer or check the official rate table for your destination, then overwrite the example rate.' },
    ],
    sources: [
      { label: 'GSA: Per diem rates', url: 'https://www.gsa.gov/travel/plan-book/per-diem-rates' },
    ],
  },
  related: ['trip-budget', 'eating-out-cost', 'cost-per-mile'],
  examples: [
    // 3*68=204 + 2*68*0.75=102 => 306; 390-306=84; 390/5=78
    { values: { days: 5, rate: 68, share: 75, actual: 390 }, expect: { perDiem: 306, diff: 84, perDay: 78 }, tolerance: 0.01 },
    // 80 + 2*60 = 200; 180-200=-20; 180/3=60
    { values: { days: 3, rate: 80, share: 75, actual: 180 }, expect: { perDiem: 200, diff: -20, perDay: 60 }, tolerance: 0.01 },
  ],
});
