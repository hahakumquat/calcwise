import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'quit-smoking-savings',
  title: 'Quit Smoking Savings Calculator',
  category: 'health',
  description: 'See how much money you would save per day, week, month and year by not buying cigarettes, plus what it could grow to if you invested it at a return you choose.',
  keywords: ['quit smoking savings calculator', 'how much money will i save if i quit smoking', 'cost of smoking calculator', 'cigarette cost per year', 'money saved quitting vaping'],
  updated: '2026-11-21',
  inputs: [
    { id: 'cigs', label: 'Cigarettes per day', type: 'number', default: 20, min: 0, step: 1, info: 'How many you smoke on a typical day. For vaping, see the FAQ below.' },
    { id: 'perPack', label: 'Cigarettes per pack', type: 'number', default: 20, min: 1, step: 1, info: 'Packs usually hold 20. Use 1 if you want to enter the price of a single item.' },
    { id: 'price', label: 'Price per pack', type: 'number', prefix: '$', default: 10, min: 0, step: 0.25, info: 'What you pay for one pack, including tax. Use your real local price.' },
    { id: 'rate', label: 'Assumed investment return (assumption)', type: 'number', suffix: '% a year', default: 5, min: 0, max: 20, step: 0.5, info: 'An assumption, not a forecast. Real returns vary and can be negative. 0 means the money is just kept.' },
    { id: 'years', label: 'Years invested', type: 'number', default: 10, min: 1, max: 40, step: 1, info: 'How long the saved money would be invested.' },
  ],
  outputs: [
    { id: 'year', label: 'Saved per year', format: 'currency', primary: true, info: 'Cost per day × 365.' },
    { id: 'day', label: 'Saved per day', format: 'currency', info: 'Cigarettes per day ÷ cigarettes per pack × price per pack.' },
    { id: 'week', label: 'Saved per week', format: 'currency', info: 'Cost per day × 7.' },
    { id: 'month', label: 'Saved per month', format: 'currency', info: 'Cost per day × 365 ÷ 12.' },
    { id: 'invested', label: 'If invested, total at the end', format: 'currency', info: 'Monthly savings put aside at the end of each month and compounded monthly at the assumed return. Not a forecast.' },
    { id: 'contributed', label: 'Of which money put in', format: 'currency', info: 'Monthly savings × number of months, before any growth.' },
  ],
  compute: (v) => {
    const cigs = num(v.cigs);
    const perPack = num(v.perPack);
    const price = num(v.price);
    const rate = num(v.rate);
    const yearsRaw = num(v.years);
    if (cigs === null || perPack === null || price === null || rate === null || yearsRaw === null || cigs < 0 || perPack < 1 || price < 0 || rate < 0 || yearsRaw < 1) return { year: null };
    const years = Math.round(yearsRaw);
    const day = (cigs / perPack) * price;
    const week = day * 7;
    const month = (day * 365) / 12;
    const year = day * 365;
    const i = rate / 100 / 12;
    const growth = (m: number) => (i === 0 ? m : (Math.pow(1 + i, m) - 1) / i);
    const invested = month * growth(years * 12);
    const contributed = month * years * 12;
    const kept: number[] = [];
    const grown: number[] = [];
    const xs: number[] = [];
    for (let y = 0; y <= years; y++) {
      xs.push(y);
      kept.push(month * y * 12);
      grown.push(month * growth(y * 12));
    }
    return {
      year,
      day,
      week,
      month,
      invested,
      contributed,
      tone: 'good' as const,
      badge: `$${fmt(month, 0)} a month`,
      note: `At ${fmt(cigs, cigs % 1 ? 1 : 0)} cigarettes a day and $${fmt(price, 2)} a pack, that is $${fmt(day, 2)} a day, or $${fmt(year, 0)} a year. Invested at an assumed ${fmt(rate, 1)}% a year, ${years} years of savings would come to about $${fmt(invested, 0)}.`,
      chart: {
        type: 'line',
        title: 'Savings over time',
        x: xs,
        xLabel: 'Years',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Money saved', values: kept },
          { name: `Invested at ${fmt(rate, 1)}% (assumed)`, values: grown },
        ],
      },
      steps: [
        `Cost per day = ${fmt(cigs, 1)} ÷ ${fmt(perPack, 0)} × $${fmt(price, 2)} = $${fmt(day, 2)}`,
        `Per year = $${fmt(day, 2)} × 365 = $${fmt(year, 2)}; per month = $${fmt(month, 2)}`,
        `Invested: $${fmt(month, 2)} a month for ${years * 12} months at ${fmt(rate, 2)}% a year = $${fmt(invested, 2)}`,
      ],
    };
  },
  content: {
    formula: [
      'Cost per day = cigarettes per day ÷ cigarettes per pack × price per pack',
      'Per week = per day × 7; per month = per day × 365 ÷ 12; per year = per day × 365',
      'Invested total = monthly saving × ((1 + r ÷ 12)^n − 1) ÷ (r ÷ 12), with r the yearly return and n the months',
    ],
    body: [
      'Cigarettes add up quickly. Enter how many you smoke a day, how many come in a pack and what a pack costs, and this calculator shows what that habit costs per day, per week, per month and per year. If you stopped buying them, that is the money you would keep.',
      'It also shows what the saved money could grow to if you put it aside every month and invested it. The return is an assumption you choose, not a forecast: real returns go up and down, and they can be negative. Set it to 0 to see simply the money kept.',
      'The calculator covers money only. It makes no claims about health and does not replace advice from a doctor or a quit-smoking service. For vaping or other products, set cigarettes per pack to 1 and enter your cost per day as the price. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much does a pack a day cost per year?', a: 'At $10 a pack and 20 cigarettes a day, that is 1 pack a day: $10 a day, $70 a week, about $304.17 a month and $3,650 a year.' },
      { q: 'How is the invested total worked out?', a: 'The monthly saving is put in at the end of every month and compounded monthly. At 0% for 10 years, $304.17 × 120 months is $36,500. At an assumed 12% a year (1% a month) it comes to $304.17 × 230.04 = about $69,970.' },
      { q: 'Is the investment return guaranteed?', a: 'No. It is an assumption you set. Investments can lose value, so use the 0% setting for a figure with no growth at all.' },
      { q: 'How do I use it for vaping?', a: 'Set cigarettes per pack to 1 and cigarettes per day to 1, then enter what you spend per day as the price. The results then show that daily spend over a week, month and year.' },
      { q: 'Does this say anything about health?', a: 'No. It only does the money arithmetic. Talk to a doctor or a local quit service for help with stopping.' },
    ],
    sources: [],
  },
  related: ['dry-january', 'latte-factor', 'subscription-cost', 'compound-interest'],
  examples: [
    // 20 / 20 x $10 = $10 a day; week 70; month 10 x 365 / 12 = 304.1667; year 3650; 0% for 10y: 304.1667 x 120 = 36,500
    { values: { cigs: 20, perPack: 20, price: 10, rate: 0, years: 10 }, expect: { day: 10, week: 70, month: 3650 / 12, year: 3650, invested: 36500, contributed: 36500 }, tolerance: 1e-9 },
    // 10 cigs, 20 per pack, $8: $4 a day = 1,460 a year. 12% => 1% a month; 1.01^120 = 3.300386895; factor 230.0386895
    { values: { cigs: 10, perPack: 20, price: 8, rate: 12, years: 10 }, expect: { day: 4, year: 1460, month: 1460 / 12, invested: (1460 / 12) * 230.0386895, contributed: 14600 }, tolerance: 1e-3 },
    // 1 item a day at $5, 1 per pack, 1 year at 0%
    { values: { cigs: 1, perPack: 1, price: 5, rate: 0, years: 1 }, expect: { day: 5, week: 35, year: 1825, invested: 1825 }, tolerance: 1e-9 },
  ],
});
