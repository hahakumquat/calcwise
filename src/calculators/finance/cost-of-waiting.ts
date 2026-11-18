import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

// Future value of a monthly contribution made at the end of each month.
function fv(pmt: number, annualRate: number, months: number): number {
  if (months <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i === 0) return pmt * months;
  return (pmt * (Math.pow(1 + i, months) - 1)) / i;
}

export default defineCalculator({
  slug: 'cost-of-waiting',
  title: 'Cost of Waiting to Invest Calculator',
  category: 'finance',
  description: 'See how much it costs to start investing later: the same monthly amount, started now versus after a delay, and the growth you give up.',
  keywords: ['cost of waiting to invest', 'cost of delaying investing', 'start investing now vs later', 'investing early calculator', 'cost of delay calculator'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'monthly', label: 'Monthly investment', type: 'number', prefix: '$', default: 500, min: 0, step: 50, info: 'The amount you put in at the end of every month.' },
    { id: 'rate', label: 'Expected yearly return', type: 'number', suffix: '%', default: 7, min: 0, max: 30, step: 0.5, info: 'An assumption, not a promise. Returns vary every year.' },
    { id: 'years', label: 'Years until you need the money', type: 'number', default: 30, min: 1, max: 60, step: 1, info: 'Counted from today.' },
    { id: 'delay', label: 'Years you wait before starting', type: 'number', default: 10, min: 0, max: 59, step: 1, info: 'How long you put it off. Must be shorter than the years above.' },
  ],
  outputs: [
    { id: 'cost', label: 'What waiting costs you', format: 'currency', primary: true, info: 'Balance if you start now minus balance if you start after the delay.' },
    { id: 'nowValue', label: 'Balance if you start now', format: 'currency', info: 'Monthly amount invested for the full number of years.' },
    { id: 'laterValue', label: 'Balance if you wait', format: 'currency', info: 'The same monthly amount, invested only after the delay.' },
    { id: 'extraPaid', label: 'Extra money you put in by starting now', format: 'currency', info: 'Monthly amount × the months of delay.' },
    { id: 'catchUp', label: 'Monthly amount needed to catch up if you wait', format: 'currency', info: 'What you would have to invest each month after the delay to end up with the same balance as starting now.' },
  ],
  compute: (v) => {
    const monthly = num(v.monthly);
    const rate = num(v.rate);
    const years = num(v.years);
    const delay = num(v.delay);
    if (monthly === null || rate === null || years === null || delay === null) return { cost: null };
    if (monthly <= 0) return { cost: null, error: 'Enter a monthly amount above zero.' };
    if (years < 1) return { cost: null, error: 'Enter at least 1 year.' };
    if (delay < 0 || delay >= years) return { cost: null, error: 'The delay must be zero or more, and shorter than the total years.' };
    const months = Math.round(years * 12);
    const delayMonths = Math.round(delay * 12);
    const now = fv(monthly, rate, months);
    const later = fv(monthly, rate, months - delayMonths);
    const catchUp = (monthly * now) / later;
    const x: number[] = [];
    const nowSeries: number[] = [];
    const laterSeries: number[] = [];
    for (let y = 0; y <= years; y++) {
      x.push(y);
      nowSeries.push(fv(monthly, rate, y * 12));
      laterSeries.push(fv(monthly, rate, Math.max(0, y * 12 - delayMonths)));
    }
    return {
      cost: now - later,
      nowValue: now,
      laterValue: later,
      extraPaid: monthly * delayMonths,
      catchUp,
      tone: 'bad',
      chart: {
        type: 'line',
        title: 'Start now vs start later',
        x,
        xLabel: 'Years from today',
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: 'Start now', values: nowSeries },
          { name: 'Wait', values: laterSeries },
        ],
      },
      steps: [
        `Start now: ${money(monthly)} × ((1 + r)^${months} − 1) ÷ r, with r = ${rate}% ÷ 12, = ${money(now)}`,
        `Wait ${delay} years: the same formula over ${months - delayMonths} months = ${money(later)}`,
        `Cost of waiting = ${money(now)} − ${money(later)} = ${money(now - later)}`,
      ],
      note: `Waiting ${delay} years means you pay in ${money(monthly * delayMonths)} less, but you end up ${money(now - later)} behind, because the early money also has the longest time to grow. This assumes a steady ${rate}% a year, which real markets do not deliver.`,
    } as never;
  },
  content: {
    formula: ['Balance = monthly × ((1 + r)^n − 1) ÷ r, where r = yearly rate ÷ 12 and n = number of months', 'Cost of waiting = balance if you start now − balance if you start after the delay', 'Catch-up amount = monthly × (balance now ÷ balance if you wait)'],
    body: [
      'Compound growth rewards time more than size. The first dollars you invest have the longest to grow, so putting off the start costs more than the contributions you skip.',
      'Take $500 a month at 7% a year for 30 years: about $609,985. Wait 10 years and invest the same $500 for the remaining 20: about $260,463. Waiting cost roughly $349,522, even though you only paid in $60,000 less. To reach the same $609,985 in 20 years you would need about $1,171 a month.',
      'The numbers use a constant return and month-end deposits, with no fees, tax or inflation. Real returns bounce around, so treat the result as an illustration of the pattern, not a forecast.',
    ],
    faq: [
      { q: 'How much does it cost to wait to start investing?', a: 'Enter the monthly amount, return, total years and years of delay. The calculator subtracts the balance you get by waiting from the balance you get by starting now. For $500 a month at 7% over 30 years, a 10-year delay costs about $349,522.' },
      { q: 'How much more would I need to invest to catch up?', a: 'The catch-up line shows the monthly amount you would need after the delay to end with the same balance. In the default example it is about $1,171 a month instead of $500.' },
      { q: 'What return should I use?', a: 'Any assumption is a guess. Many people try 5% to 7% a year to see a range. A higher return makes waiting look more expensive.' },
      { q: 'Does this include inflation or fees?', a: 'No. Results are in future dollars before fees, tax and inflation.' },
    ],
    sources: [
      { label: 'Compound interest (Investor.gov, SEC)', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
      { label: 'Future value of an annuity (Investopedia)', url: 'https://www.investopedia.com/terms/f/future-value-annuity.asp' },
    ],
  },
  related: ['compound-interest', 'investment', 'rule-of-72', 'savings-goal', 'retirement'],
  examples: [
    { values: { monthly: 500, rate: 7, years: 30, delay: 10 }, expect: { nowValue: 609985.5, laterValue: 260463.5, cost: 349522, extraPaid: 60000 }, tolerance: 1 },
    { values: { monthly: 100, rate: 0, years: 10, delay: 5 }, expect: { nowValue: 12000, laterValue: 6000, cost: 6000, catchUp: 200 }, tolerance: 1e-6 },
  ],
});
