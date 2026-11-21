import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const pct = (n: number) => (n * 100).toFixed(2) + '%';

export default defineCalculator({
  slug: 'year-in-review-return',
  title: 'Year in Review: Your Real Investment Return',
  category: 'finance',
  description: 'Separate market growth from the money you added. Enter start and end balances plus contributions to get your real yearly return using the Modified Dietz method.',
  keywords: ['investment return calculator', 'portfolio return for the year', 'modified dietz calculator', 'time-weighted return estimate', 'how much did my portfolio really grow', 'return after contributions'],
  updated: '2026-11-21',
  inputs: [
    { id: 'start', label: 'Balance at start of year', type: 'number', prefix: '$', default: 50000, min: 0, step: 500, info: 'Portfolio value on January 1 (or the first day of your period).' },
    { id: 'end', label: 'Balance at end of year', type: 'number', prefix: '$', default: 62000, min: 0, step: 500, info: 'Portfolio value on December 31 (or the last day of your period).' },
    { id: 'flows', label: 'Net money you added', type: 'number', prefix: '$', default: 6000, step: 100, info: 'Deposits minus withdrawals over the year. Use a negative number if you took out more than you put in.' },
    {
      id: 'timing', label: 'When the money went in', type: 'select', default: '0.5',
      options: [
        { value: '1', label: 'Start of year' },
        { value: '0.5', label: 'Spread evenly' },
        { value: '0', label: 'End of year' },
      ],
      info: 'Money added early had longer to grow, so it counts for more. Spread evenly (monthly deposits) is the common case.',
    },
  ],
  outputs: [
    { id: 'ret', label: 'Your real return', format: 'percent', precision: 2, primary: true, info: 'Investment gain ÷ (start balance + time-weighted contributions). Modified Dietz method.' },
    { id: 'gain', label: 'Growth from the market', format: 'currency', precision: 0, info: 'End balance − start balance − net contributions.' },
    { id: 'naive', label: 'Balance change (misleading)', format: 'percent', precision: 2, info: '(end − start) ÷ start. Counts your own deposits as growth.' },
    { id: 'added', label: 'Net money you added', format: 'currency', precision: 0, info: 'Deposits minus withdrawals, as entered.' },
  ],
  compute: (v) => {
    const b = num(v.start), e = num(v.end), cf = num(v.flows);
    const w = Number(v.timing);
    if (b === null || e === null || cf === null) return { ret: null, note: 'Enter your start balance, end balance and net contributions.' };
    if (b < 0 || e < 0) return { ret: null, error: 'Balances cannot be negative.' };
    const wt = w === 1 || w === 0 ? w : 0.5;
    const denom = b + wt * cf;
    if (denom <= 0) return { ret: null, error: 'Start balance plus weighted contributions must be above zero.' };
    const gain = e - b - cf;
    const ret = gain / denom;
    const naive = b > 0 ? (e - b) / b : null;
    return {
      ret,
      gain,
      naive,
      added: cf,
      tone: ret >= 0 ? 'good' : 'bad',
      badge: ret >= 0 ? 'Up on the year' : 'Down on the year',
      chart: {
        type: 'bar',
        title: 'Where the change in your balance came from',
        categories: ['Your contributions', 'Market growth'],
        series: [{ name: 'Dollars', values: [cf, gain] }],
        format: { format: 'currency' },
      },
      steps: [
        `Gain = ${usd(e)} − ${usd(b)} − ${usd(cf)} = ${usd(gain)}`,
        `Average capital at work = ${usd(b)} + ${wt} × ${usd(cf)} = ${usd(denom)}`,
        `Return = ${usd(gain)} ÷ ${usd(denom)} = ${pct(ret)}`,
      ],
      note: `Your balance moved ${usd(e - b)}, but ${usd(cf)} of that was your own money. The market's share was ${usd(gain)}, a ${pct(ret)} return.` + (naive !== null ? ` Comparing balances alone would say ${pct(naive)}.` : '') + ' This is an estimate; your brokerage\'s own performance figure is the authority.',
    };
  },
  content: {
    formula: [
      'Gain = end balance − start balance − net contributions',
      'Return = gain ÷ (start balance + weight × net contributions)',
      'Weight = 1 for start of year, 0.5 for evenly spread, 0 for end of year',
    ],
    body: [
      'Your balance going up does not mean your investments did well. If you added money during the year, part of the rise is just your own deposits. This calculator takes those deposits out so you can see what the market actually did.',
      'It uses the Modified Dietz method, a standard way to estimate performance when money moves in and out. Each contribution is weighted by how long it was invested, so a deposit in January counts for more than one in December.',
      'The result is an approximation. It treats every flow as if it landed on one average date, which is close enough for regular monthly deposits but less exact if you made a large lump-sum deposit at an odd moment or markets swung wildly. For exact figures, use the return your brokerage reports.',
      'To project growth forward, use the investment calculator. To compare two points in time with no deposits, the CAGR calculator is the better fit.',
    ],
    faq: [
      { q: 'My balance rose 24%. Is that my return?', a: 'Not if you added money. With $50,000 at the start, $62,000 at the end and $6,000 contributed evenly, the balance rose 24%, but the market return was $6,000 ÷ $53,000 = 11.32%.' },
      { q: 'What does the timing option change?', a: 'It sets how long your contributions were invested. Start of year gives 6,000 ÷ 56,000 = 10.71%. End of year gives 6,000 ÷ 50,000 = 12.00%. Evenly spread sits in between at 11.32%.' },
      { q: 'Can I use it for withdrawals?', a: 'Yes. Enter withdrawals as a negative net amount. Taking out money early reduces the capital at work for the rest of the year.' },
      { q: 'Is this the same as my brokerage return?', a: 'It is an estimate. Brokerages often use a daily time-weighted or money-weighted method, which can differ slightly. Their figure is the authority.' },
    ],
    sources: [
      { label: 'Modified Dietz method (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Modified_Dietz_method' },
    ],
  },
  related: ['cagr-calculator', 'investment', 'roi', 'real-rate-of-return'],
  examples: [
    // gain 62000-50000-6000 = 6000; denom 50000+3000 = 53000; 6000/53000 = 0.113208; naive 12000/50000 = 0.24
    { values: { start: 50000, end: 62000, flows: 6000, timing: '0.5' }, expect: { ret: 0.113208, gain: 6000, naive: 0.24, added: 6000 }, tolerance: 1e-6 },
    // start of year: 6000/56000 = 0.107143
    { values: { start: 50000, end: 62000, flows: 6000, timing: '1' }, expect: { ret: 0.107143 }, tolerance: 1e-6 },
    // end of year: 6000/50000 = 0.12
    { values: { start: 50000, end: 62000, flows: 6000, timing: '0' }, expect: { ret: 0.12 }, tolerance: 1e-6 },
    // withdrawal: 10000 -> 10200 with -1000 even: gain 1200; denom 9500; 0.126316
    { values: { start: 10000, end: 10200, flows: -1000, timing: '0.5' }, expect: { ret: 0.126316, gain: 1200 }, tolerance: 1e-6 },
  ],
});
