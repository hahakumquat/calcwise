import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'dividend-calculator',
  title: 'Dividend Calculator: Income and DRIP Growth',
  category: 'finance',
  description: 'See how much dividend income a portfolio could pay and how reinvesting dividends (DRIP) grows it over the years. Simple model, runs in your browser.',
  keywords: ['dividend calculator', 'drip calculator', 'dividend reinvestment calculator', 'dividend income calculator', 'dividend growth calculator', 'how much dividend income'],
  updated: '2026-11-17',
  inputs: [
    { id: 'start', label: 'Starting amount', type: 'number', prefix: '$', default: 10000, min: 0, step: 100, info: 'What you hold today, at market value.' },
    { id: 'yield', label: 'Dividend yield', type: 'number', suffix: '%', default: 4, min: 0, step: 0.1, info: 'Yearly dividends as a percentage of the current value. The calculator keeps this constant.' },
    { id: 'growth', label: 'Price growth', type: 'number', suffix: '% a year', default: 5, step: 0.1, info: 'How fast the share price rises each year, before dividends.' },
    { id: 'years', label: 'Years', type: 'number', default: 10, min: 1, max: 60, step: 1, info: 'How long you hold.' },
    { id: 'monthly', label: 'Monthly addition', type: 'number', prefix: '$', optional: true, min: 0, step: 10, info: 'Optional. Added through the year and counted at year end, so it starts earning the following year.' },
    { id: 'drip', label: 'Reinvest dividends (DRIP)', type: 'toggle', default: true, info: 'On: dividends buy more shares. Off: dividends are paid out to you as cash.' },
  ],
  outputs: [
    { id: 'finalValue', label: 'Portfolio value at the end', format: 'currency', primary: true, info: 'Value of the holding after the last year (excludes any cash dividends you took out).' },
    { id: 'year1', label: 'Dividend income in year 1', format: 'currency', info: 'Starting amount × yield.' },
    { id: 'lastYear', label: 'Dividend income in the last year', format: 'currency', info: 'Value at the start of the last year × yield.' },
    { id: 'totalDiv', label: 'Total dividends over the period', format: 'currency', info: 'All dividends paid, whether reinvested or taken as cash.' },
    { id: 'contributed', label: 'Money you put in', format: 'currency', info: 'Starting amount plus all monthly additions.' },
  ],
  compute: (v) => {
    const start = num(v.start);
    const y = num(v.yield);
    const g = num(v.growth);
    const n = num(v.years);
    const m = num(v.monthly) ?? 0;
    const drip = v.drip !== 'off';
    if (start === null || y === null || g === null || n === null) return { finalValue: null };
    if (start < 0 || y < 0 || m < 0) return { finalValue: null, error: 'Values cannot be negative.' };
    if (n < 1 || n > 60) return { finalValue: null, error: 'Years must be between 1 and 60.' };
    if (g <= -100) return { finalValue: null, error: 'Price growth must be above -100%.' };
    const yr = y / 100;
    const gr = g / 100;
    const years = Math.floor(n);
    const add = m * 12;
    let value = start;
    let total = 0;
    let year1 = 0;
    let last = 0;
    const xs: number[] = [0];
    const values: number[] = [start];
    const cum: number[] = [0];
    for (let t = 1; t <= years; t++) {
      const div = value * yr;
      if (t === 1) year1 = div;
      last = div;
      total += div;
      value = value * (1 + gr + (drip ? yr : 0)) + add;
      xs.push(t);
      values.push(value);
      cum.push(total);
    }
    const contributed = start + add * years;
    const series = drip
      ? [{ name: 'Portfolio value', values }]
      : [{ name: 'Portfolio value', values }, { name: 'Dividends paid out (cash)', values: cum }];
    return {
      finalValue: value,
      year1,
      lastYear: last,
      totalDiv: total,
      contributed,
      tone: 'ok',
      badge: `${money(last)} a year in dividends by year ${years}`,
      note: drip
        ? 'Simple model: constant yield, steady price growth, no tax, no fees. Real dividends change and are not guaranteed.'
        : 'Dividends are taken as cash and not reinvested or earning interest. Simple model: constant yield, no tax, no fees.',
      chart: { type: 'line', title: drip ? 'Portfolio value with dividends reinvested' : 'Portfolio value and cash dividends', x: xs, xLabel: 'Years', yFormat: { format: 'currency' }, series },
      steps: [
        `Year 1 dividends = ${money(start)} × ${y}% = ${money(year1)}.`,
        drip
          ? `Each year the value grows by ${g}% price growth + ${y}% reinvested dividends, then monthly additions are added.`
          : `Each year the value grows by ${g}% price growth only; dividends are paid out as cash.`,
        `After ${years} years: ${money(value)}, with ${money(total)} of dividends paid in total.`,
      ],
    };
  },
  content: {
    formula: [
      'Dividends in a year = value at the start of the year × yield',
      'With DRIP: next value = value × (1 + price growth + yield) + 12 × monthly addition',
      'Without DRIP: next value = value × (1 + price growth) + 12 × monthly addition',
    ],
    body: [
      'Dividends are cash a company pays to its shareholders. A dividend reinvestment plan (DRIP) uses that cash to buy more shares automatically, so the next dividend is paid on a bigger holding. Over many years that loop is the main reason reinvested portfolios pull ahead.',
      'This calculator uses a deliberately simple model: the yield and price growth stay constant, and monthly additions are counted at the end of each year. It ignores tax, fees, changes in yield and dividend cuts, so read the answer as an illustration rather than a forecast.',
      'Switch DRIP off to see the other path: the portfolio grows on price alone and the dividends arrive as cash, which the chart tracks as a running total.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          '$10,000 at a 4% yield pays $400 in year 1. With 5% price growth and dividends reinvested, the value grows by 9% a year, so after 10 years it is 10,000 × 1.09^10 = $23,673.64.',
          'With dividends taken as cash instead, the value grows 5% a year to $16,288.95, and the dividends paid over the decade add up to about $5,031.',
        ],
      },
    ],
    faq: [
      { q: 'How much will $10,000 at a 4% yield pay a year?', a: '$400 in the first year. If the holding grows, so do the dividends: with 5% price growth and DRIP, year 10 pays about $869.' },
      { q: 'What does DRIP do?', a: 'It reinvests each dividend into more shares. In this calculator that adds the yield to the yearly growth rate, so $10,000 at 4% yield and 5% price growth becomes $23,673.64 in 10 years.' },
      { q: 'Does this include dividend growth or tax?', a: 'No. Yield and price growth are constant, and tax and fees are ignored. Many companies raise dividends over time and some cut them, so test a few yields.' },
      { q: 'When are monthly additions counted?', a: 'At the end of each year, so they start earning from the following year. That is slightly cautious compared with investing each month.' },
    ],
    sources: [{ label: 'SEC Investor.gov: Dividend reinvestment plans', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/dividend-reinvestment-plan' }],
  },
  related: ['compound-interest', 'investment', 'rule-of-72', 'dividend-payout-ratio-calculator'],
  examples: [
    // 10000*1.09^10 = 23673.6367; year1 = 400; year10 = 10000*1.09^9*0.04 = 868.76; total = 400*(1.09^10-1)/0.09 = 6077.17
    { values: { start: 10000, yield: 4, growth: 5, years: 10, drip: 'on' }, expect: { finalValue: 23673.64, year1: 400, lastYear: 868.7573, totalDiv: 6077.17, contributed: 10000 } },
    // no DRIP: 10000*1.05^10 = 16288.95; dividends = 400*(1.05^10-1)/0.05 = 5031.16
    { values: { start: 10000, yield: 4, growth: 5, years: 10, drip: 'off' }, expect: { finalValue: 16288.95, totalDiv: 5031.16 } },
    // +$100/month: 23673.64 + 1200*(1.09^10-1)/0.09 = 23673.64 + 18231.52 = 41905.16; contributed 10000+12000
    { values: { start: 10000, yield: 4, growth: 5, years: 10, monthly: 100, drip: 'on' }, expect: { finalValue: 41905.16, contributed: 22000 } },
  ],
});
