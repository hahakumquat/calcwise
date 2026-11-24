import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'capital-loss-carryover',
  title: 'Capital Loss Carryover Calculator',
  category: 'finance',
  description: 'See how many years it takes to use up a capital loss carryover, the yearly schedule, and the tax saved against gains and ordinary income. Limits are editable.',
  keywords: ['capital loss carryover calculator', 'how long to use up capital loss carryforward', 'capital loss $3000 limit years', 'capital loss carryforward schedule', 'net capital loss carryover'],
  updated: '2026-11-24',
  inputs: [
    { id: 'loss', label: 'Net capital loss to carry over', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'The loss left after netting this year’s gains and losses.' },
    { id: 'gains', label: 'Capital gains you expect each year', type: 'number', prefix: '$', default: 0, min: 0, step: 1000, info: 'Gains the loss can offset first. Use 0 if you expect none.' },
    { id: 'limit', label: 'Yearly limit against ordinary income', type: 'number', prefix: '$', default: 3000, min: 0, step: 500, info: '$3,000 for most filers ($1,500 if married filing separately). Check the IRS page.' },
    { id: 'gainRate', label: 'Tax rate on your gains', type: 'number', suffix: '%', default: 15, min: 0, max: 50, step: 1, info: 'Long-term gains rate, such as 0%, 15% or 20%.' },
    { id: 'ordRate', label: 'Your marginal tax rate', type: 'number', suffix: '%', default: 24, min: 0, max: 50, step: 1, info: 'Your federal bracket on ordinary income.' },
  ],
  outputs: [
    { id: 'years', label: 'Years to use it up', format: 'number', precision: 0, primary: true, info: 'Count of tax years until the carryover reaches zero.' },
    { id: 'saved', label: 'Total federal tax saved', format: 'currency', info: 'Loss used against gains × gain rate, plus loss used against ordinary income × marginal rate.' },
    { id: 'vsGains', label: 'Used against gains', format: 'currency', info: 'Total loss absorbed by future capital gains.' },
    { id: 'vsOrdinary', label: 'Used against ordinary income', format: 'currency', info: 'Total loss deducted up to the yearly limit.' },
  ],
  compute: (v) => {
    const loss = num(v.loss), gains = num(v.gains), limit = num(v.limit), gr = num(v.gainRate), or = num(v.ordRate);
    if ([loss, gains, limit, gr, or].some((x) => x === null)) return { years: null };
    if ([loss, gains, limit, gr, or].some((x) => (x as number) < 0)) return { years: null, error: 'Values cannot be negative.' };
    if ((gr as number) > 50 || (or as number) > 50) return { years: null, error: 'Enter tax rates of 50% or less.' };
    if ((loss as number) > 0 && (gains as number) + (limit as number) <= 0) return { years: null, error: 'With no gains and no yearly limit, the loss is never used.' };
    let rem = loss as number, totG = 0, totO = 0, years = 0;
    const bal: number[] = [], rows: string[] = [];
    while (rem > 0.005 && years < 200) {
      years++;
      const g = Math.min(rem, gains as number);
      const o = Math.min(rem - g, limit as number);
      rem -= g + o;
      totG += g; totO += o;
      if (years <= 30) bal.push(Math.max(0, rem));
      if (years <= 5) rows.push(`Year ${years}: ${usd(g)} against gains, ${usd(o)} against income, ${usd(Math.max(0, rem))} left`);
    }
    const saved = totG * (gr as number) / 100 + totO * (or as number) / 100;
    return {
      years, saved, vsGains: totG, vsOrdinary: totO,
      tone: 'good',
      badge: years === 0 ? 'No loss to carry over' : `${years} year${years === 1 ? '' : 's'} to use it up, ${usd(saved)} saved`,
      chart: {
        type: 'bar',
        title: 'Carryover left after each year',
        categories: bal.map((_, i) => `Yr ${i + 1}`),
        series: [{ name: 'Loss left', values: bal }],
        format: { format: 'currency' },
      },
      steps: [
        ...rows,
        ...(years > 5 ? [`… continues for ${years} years in total`] : []),
        `Tax saved: ${usd(totG)} × ${gr}% + ${usd(totO)} × ${or}% = ${usd(saved)}`,
      ],
      note: 'This assumes the same gains every year and a fixed tax rate, and ignores state tax and the net investment income tax. Short-term and long-term losses are treated as one pool. Check irs.gov (Schedule D instructions). This is arithmetic, not tax advice.',
    };
  },
  content: {
    formula: [
      'Each year: used against gains = min(loss left, gains that year)',
      'Then: used against ordinary income = min(loss left after gains, yearly limit)',
      'Loss left = loss left − both amounts; repeat until zero',
      'Tax saved = used against gains × gain rate + used against ordinary income × marginal rate',
    ],
    body: [
      'When your capital losses beat your gains, the excess does not vanish. In the US you can deduct up to a yearly limit against ordinary income and carry the rest forward to later years, where it also offsets any capital gains first.',
      'Enter the carryover, the gains you expect each year and the limit. The calculator lays out the schedule year by year and shows how long it takes and what it saves.',
      'Real gains vary from year to year, so treat the result as a plan, not a forecast.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A $50,000 loss with no gains and a $3,000 limit uses $3,000 for 16 years ($48,000) and the last $2,000 in year 17. At 24% the $50,000 of deductions saves $12,000.' },
      { q: 'How do gains speed it up?', a: 'Gains absorb loss first. A $20,000 loss with $5,000 of gains a year uses $8,000, $8,000 and $4,000 over 3 years, saving $3,540 at a 15% gains rate and a 24% bracket.' },
      { q: 'Does the carryover expire?', a: 'Under the usual US rule it does not expire for individuals while you are alive. Confirm on the IRS page.' },
      { q: 'Does this separate short-term and long-term losses?', a: 'No. It treats them as one pool, which is a simplification.' },
    ],
    sources: [
      { label: 'IRS Topic 409: Capital gains and losses', url: 'https://www.irs.gov/taxtopics/tc409' },
    ],
  },
  related: ['tax-loss-harvesting', 'capital-gains-tax', 'bracket-headroom'],
  examples: [
    // 16*3000=48000, last 2000 -> 17 yrs; ordinary 50000; saved 50000*.24=12000
    { values: { loss: 50000, gains: 0, limit: 3000, gainRate: 15, ordRate: 24 }, expect: { years: 17, saved: 12000, vsGains: 0, vsOrdinary: 50000 }, tolerance: 0.01 },
    // yr1 8000, yr2 8000, yr3 4000 (all vs gains) -> gains 14000, ordinary 6000; saved 2100+1440=3540
    { values: { loss: 20000, gains: 5000, limit: 3000, gainRate: 15, ordRate: 24 }, expect: { years: 3, saved: 3540, vsGains: 14000, vsOrdinary: 6000 }, tolerance: 0.01 },
  ],
});
