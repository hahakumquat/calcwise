import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY } from '../../lib/helpers/finance';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'roi',
  title: 'ROI Calculator',
  category: 'finance',
  description: 'Calculate return on investment, total gain and annualized ROI from what you put in and what you got back.',
  keywords: ['return on investment', 'annualized return', 'CAGR', 'investment gain', 'profit percentage'],
  inputs: [
    { id: 'invested', label: 'Amount invested', type: 'number', prefix: '$', default: 10000, min: 0, info: 'Everything you put in, including purchase costs such as commissions and fees.' },
    { id: 'returned', label: 'Amount returned (final value)', type: 'number', prefix: '$', default: 15000, min: 0, help: 'Sale proceeds plus any income received, minus costs.', info: 'What you got back: sale proceeds or current value plus any dividends, interest or rent received.' },
    { id: 'years', label: 'Holding period', type: 'number', suffix: 'years', default: 3, min: 0, step: 0.25, optional: true, help: 'Needed for annualized ROI.', info: 'How long you held the investment. Needed to turn the total return into a yearly rate.' },
  ],
  outputs: [
    { id: 'roi', label: 'Return on investment', format: 'percent', precision: 2, primary: true, info: 'Total gain or loss as a percentage of what you invested, ignoring how long it took.' },
    { id: 'gain', label: 'Gain or loss', format: 'currency', info: 'The dollar profit or loss: amount returned minus amount invested.' },
    { id: 'annualized', label: 'Annualized ROI', format: 'percent', precision: 2, info: 'The steady yearly compound rate that would produce the same total return — also called CAGR.' },
  ],
  compute: (v) => {
    const inv = num(v.invested);
    const ret = num(v.returned);
    const years = num(v.years);
    if (inv === null || ret === null || inv <= 0 || ret < 0) return { roi: null };
    const gain = ret - inv;
    const roi = gain / inv;
    const annualized = years !== null && years > 0 ? (ret / inv) ** (1 / years) - 1 : null;
    return {
      roi,
      gain,
      annualized,
      chart: { type: 'bar', title: 'Invested vs returned', categories: ['Invested', 'Returned', gain >= 0 ? 'Gain' : 'Loss'], series: [{ name: 'Amount', values: [inv, ret, Math.abs(gain)] }], format: CURRENCY, highlight: 1 },
      steps: [
        `Gain = ${money(ret)} − ${money(inv)} = ${money(gain)}`,
        `ROI = ${money(gain)} ÷ ${money(inv)} = ${pct(roi)}`,
        ...(annualized !== null ? [`Annualized = (${money(ret)} ÷ ${money(inv)})^(1/${years}) − 1 = ${pct(annualized)}`] : []),
      ],
      note: annualized !== null ? `A total return of ${pct(roi)} over ${years} years is equivalent to ${pct(annualized)} a year, compounded.` : undefined,
    };
  },
  content: {
    formula: ['ROI = (final value − amount invested) ÷ amount invested', 'Annualized ROI = (final value ÷ amount invested)^(1/years) − 1'],
    body: [
      'Return on investment expresses a profit or loss as a percentage of what you put in, so investments of different sizes can be compared. A $500 gain on $1,000 (50%) is far better than a $500 gain on $10,000 (5%).',
      'Plain ROI ignores time. A 50% return over two years is excellent; over twenty years it is poor. Annualized ROI (also called compound annual growth rate, or CAGR) fixes this by finding the steady yearly rate that would turn the starting amount into the final amount over the holding period.',
      'For an honest number, include every cost — purchase fees, commissions, repairs, taxes paid — in the amount invested or subtract it from the final value, and include income such as dividends, interest or rent in the amount returned.',
    ],
    faq: [
      { q: 'Why is annualized ROI lower than total ROI divided by years?', a: 'Because returns compound. A 50% total return over 3 years is not 16.7% a year: 14.47% a year, compounded, gets you there. Dividing the total by the years overstates the yearly rate.' },
      { q: 'What is a good ROI?', a: 'It depends on risk. Broad stock index funds have historically returned roughly 7% a year after inflation over long periods. Riskier investments should promise more to be worth it; safe ones like savings accounts return less.' },
      { q: 'Can ROI be negative?', a: 'Yes. If you get back less than you invested, the gain is negative and so is the ROI. The worst case is −100%, meaning everything was lost.' },
    ],
  },
  related: ['investment', 'compound-interest', 'profit-margin', 'break-even'],
  examples: [
    { values: { invested: 10000, returned: 15000, years: 3 }, expect: { roi: 0.5, gain: 5000, annualized: 0.1447142426 } },
    { values: { invested: 2000, returned: 1500, years: null }, expect: { roi: -0.25, gain: -500 } },
  ],
});
