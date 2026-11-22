import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';
import { SOURCES } from '../../lib/helpers/fire';

export default defineCalculator({
  slug: 'one-more-year',
  title: 'One More Year Calculator',
  seoTitle: 'One More Year Calculator: What 1 Extra Year Buys',
  metaDescription: 'See what one more year of work adds to your portfolio and the yearly income it supports at your withdrawal rate, and whether it closes your spending gap.',
  updated: '2026-11-22',
  category: 'fire',
  description: 'Price one more year of work: the extra portfolio, the extra yearly income it supports, and how much of your spending gap it closes.',
  keywords: ['one more year syndrome', 'one more year calculator', 'work one more year', 'is one more year worth it', 'FIRE one more year', 'extra year of work retirement'],
  popular: false,
  inputs: [
    { id: 'portfolio', label: 'Portfolio today', type: 'number', prefix: '$', default: 850000, min: 0, step: 10000, info: 'What you have invested today.' },
    { id: 'savings', label: 'Savings if you work one more year', type: 'number', prefix: '$', default: 30000, min: 0, step: 1000, info: 'How much you would add to the portfolio over the year.' },
    { id: 'ret', label: 'Real return', type: 'number', suffix: '% / yr', default: 5, min: -50, max: 50, step: 0.5, info: 'Yearly growth after inflation. An assumption, not a forecast. Savings are added at the end of the year.' },
    { id: 'rate', label: 'Withdrawal rate', type: 'number', suffix: '%', default: 4, min: 0.1, max: 20, step: 0.1, info: 'The share of the portfolio you plan to spend each year. 4% is a rule of thumb, not a guarantee.' },
    { id: 'spending', label: 'Annual spending (optional)', type: 'number', prefix: '$', default: 40000, min: 0, step: 1000, optional: true, info: 'What you want to spend each year. Used to show how far short you are now and after the extra year.' },
  ],
  outputs: [
    { id: 'gain', label: 'Extra yearly income from one more year', format: 'currency', precision: 0, primary: true, info: '(Portfolio after one year − portfolio today) × withdrawal rate.' },
    { id: 'gainMonth', label: 'Extra per month', format: 'currency', precision: 2, info: 'The extra yearly income divided by 12.' },
    { id: 'gainPct', label: 'Rise in sustainable income', format: 'percent', precision: 2, info: 'Extra income divided by the income your portfolio supports today.' },
    { id: 'after', label: 'Portfolio after one more year', format: 'currency', precision: 0, info: 'Portfolio × (1 + return) + savings.' },
    { id: 'incomeNow', label: 'Yearly income today', format: 'currency', precision: 0, info: 'Portfolio today × withdrawal rate.' },
    { id: 'incomeAfter', label: 'Yearly income after the year', format: 'currency', precision: 0, info: 'Portfolio after the year × withdrawal rate.' },
  ],
  compute: (v) => {
    const p = num(v.portfolio);
    const s = num(v.savings);
    const r = num(v.ret);
    const w = num(v.rate);
    if (p === null || s === null || r === null || w === null) return { gain: null };
    if (p < 0 || s < 0) return { gain: null, error: 'Portfolio and savings cannot be negative.' };
    if (w <= 0) return { gain: null, error: 'Enter a withdrawal rate above 0%.' };
    const spending = num(v.spending);
    const after = p * (1 + r / 100) + s;
    const incomeNow = (p * w) / 100;
    const incomeAfter = (after * w) / 100;
    const gain = incomeAfter - incomeNow;
    const gainPct = incomeNow > 0 ? gain / incomeNow : null;

    const hasSpend = spending !== null && spending > 0;
    const shortNow = hasSpend ? (spending as number) - incomeNow : null;
    const shortAfter = hasSpend ? (spending as number) - incomeAfter : null;

    const steps = [
      `Portfolio after one year = ${money(p, 0)} × (1 + ${r}%) + ${money(s, 0)} = ${money(after, 0)}`,
      `Income today = ${money(p, 0)} × ${w}% = ${money(incomeNow, 0)}; after = ${money(after, 0)} × ${w}% = ${money(incomeAfter, 0)}`,
      `Extra income = ${money(incomeAfter, 0)} − ${money(incomeNow, 0)} = ${money(gain, 0)} a year (${money(gain / 12, 2)} a month)`,
    ];
    if (hasSpend) {
      steps.push(
        `Against ${money(spending as number, 0)} of spending: ${(shortNow as number) > 0 ? `${money(shortNow as number, 0)} short today` : `${money(-(shortNow as number), 0)} to spare today`}, ${(shortAfter as number) > 0 ? `${money(shortAfter as number, 0)} short after` : `${money(-(shortAfter as number), 0)} to spare after`}`,
      );
    }

    let tone: 'good' | 'ok' | 'warn' | 'bad' = 'ok';
    let badge = 'One more year helps';
    if (hasSpend) {
      if ((shortNow as number) <= 0) { tone = 'good'; badge = 'Already covers your spending'; }
      else if ((shortAfter as number) <= 0) { tone = 'good'; badge = 'One more year closes the gap'; }
      else { tone = 'warn'; badge = 'Still short after one more year'; }
    }

    return {
      gain,
      gainMonth: gain / 12,
      gainPct,
      after,
      incomeNow,
      incomeAfter,
      tone,
      badge,
      chart: {
        type: 'bar',
        title: 'Yearly income your portfolio supports',
        categories: ['Today', 'After one more year', ...(hasSpend ? ['Your spending'] : [])],
        series: [{ name: 'Yearly income', values: [Math.round(incomeNow), Math.round(incomeAfter), ...(hasSpend ? [spending as number] : [])] }],
        format: CURRENCY,
        highlight: 1,
      },
      steps,
      note: `One more year adds about ${money(gain, 0)} a year of sustainable income at a ${w}% rate.${hasSpend ? ((shortAfter as number) > 0 ? ` You would still be ${money(shortAfter as number, 0)} short of your spending.` : ` That covers your spending.`) : ''} It ignores market swings, health and what the year is worth to you.`,
    };
  },
  content: {
    formula: [
      'Portfolio after = portfolio × (1 + real return) + savings for the year',
      'Income = portfolio × withdrawal rate',
      'Extra income = (portfolio after − portfolio today) × withdrawal rate',
    ],
    body: [
      '"One more year" syndrome is the habit of working just one more year when you are close to financial independence. This calculator puts a price on that year: how much more the portfolio holds, and how much more yearly income it can support at your chosen withdrawal rate.',
      'The extra year helps twice: the portfolio grows by the real return and you add a year of savings. At $850,000, $30,000 of savings, a 5% real return and a 4% withdrawal rate, the portfolio rises to $922,500 and sustainable income from $34,000 to $36,900, which is $2,900 more a year, or about $241.67 a month.',
      'If you also enter your yearly spending, you can see whether that is enough to close the gap. Against $40,000 of spending, you would be $6,000 short today and $3,100 short after one more year, so a single year would not be enough.',
    ],
    sections: [
      {
        heading: 'What this does not capture',
        paragraphs: [
          'The 4% rate is a rule of thumb from past US market data, not a guarantee, and it ignores sequence-of-returns risk: a bad market in your first years of retirement does more damage than the same drop later. The calculator also leaves out health, health insurance, taxes, and the value of a year of your time. Those matter as much as the arithmetic. Use the safe withdrawal rate calculator to test the rate itself.',
        ],
      },
    ],
    faq: [
      { q: 'How much does one more year of work add?', a: 'It adds the year of growth plus the year of savings. With $850,000, $30,000 saved and a 5% real return, the portfolio becomes $922,500, which supports $2,900 more a year at a 4% withdrawal rate.' },
      { q: 'Is one more year worth it?', a: 'That is a personal call. The calculator shows the money side only: extra income per year and whether it closes your spending gap. It cannot weigh health, burnout or what you would do with the year.' },
      { q: 'Why 4%?', a: 'It is a common rule of thumb from past US data for a 30-year retirement. It is an input here, so you can try 3.5% or 3% for a longer retirement. It is not a guarantee.' },
      { q: 'Are savings added at the start or end of the year?', a: 'At the end. The calculator grows today\'s portfolio for the year and then adds your savings, so the savings earn no return in that year. Adding them earlier would raise the result slightly.' },
      { q: 'What if I am already past my spending number?', a: 'Then the badge says the portfolio already covers your spending, and the extra year just adds margin.' },
    ],
    sources: [SOURCES.bengen, SOURCES.trinity, SOURCES.mmm],
  },
  related: ['safe-withdrawal-rate', 'years-to-fi', 'fire-number', 'cost-of-waiting', 'coast-fire'],
  examples: [
    // 850000*1.05 = 892500; +30000 = 922500; income 34000 -> 36900; gain 2900; /12 = 241.6667; 2900/34000 = 0.0852941
    { values: { portfolio: 850000, savings: 30000, ret: 5, rate: 4, spending: 40000 }, expect: { after: 922500, incomeNow: 34000, incomeAfter: 36900, gain: 2900, gainMonth: 241.6667, gainPct: 0.0852941 }, tolerance: 0.0001 },
    // 1,000,000 at 0% return, 0 savings: no change
    { values: { portfolio: 1000000, savings: 0, ret: 0, rate: 4, spending: null }, expect: { after: 1000000, gain: 0 } },
  ],
});
