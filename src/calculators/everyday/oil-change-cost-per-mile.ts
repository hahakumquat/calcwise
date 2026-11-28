import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd3 = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 });
const mi = (n: number) => Math.round(n).toLocaleString('en-US');

export default defineCalculator({
  slug: 'oil-change-cost-per-mile',
  title: 'Oil Change Cost Per Mile Calculator',
  category: 'everyday',
  description: 'Compare conventional and synthetic oil changes by cost per mile and per year, and see the interval at which synthetic oil breaks even.',
  keywords: ['oil change cost per mile', 'synthetic vs conventional oil cost', 'is synthetic oil worth it', 'oil change interval cost', 'oil change cost per year', 'synthetic oil break even'],
  updated: '2026-11-28',
  inputs: [
    { id: 'cQuarts', label: 'Conventional: quarts of oil', type: 'number', suffix: 'qt', default: 5, min: 0, step: 0.5, info: 'Oil capacity with a filter change. It is in your owner\'s manual.' },
    { id: 'cPrice', label: 'Conventional: price per quart', type: 'number', prefix: '$', default: 5, min: 0, step: 0.25, info: 'Price of one quart of conventional oil.' },
    { id: 'cFilter', label: 'Conventional: oil filter', type: 'number', prefix: '$', default: 8, min: 0, step: 1, info: 'Price of the oil filter for one change.' },
    { id: 'cLabor', label: 'Conventional: labor', type: 'number', prefix: '$', default: 12, min: 0, step: 1, info: 'Enter 0 if you change the oil yourself.' },
    { id: 'cInterval', label: 'Conventional: miles between changes', type: 'number', suffix: 'mi', default: 5000, min: 1, step: 500, info: 'Use the interval in your owner\'s manual.' },
    { id: 'sQuarts', label: 'Synthetic: quarts of oil', type: 'number', suffix: 'qt', default: 5, min: 0, step: 0.5, info: 'Usually the same as conventional; check your owner\'s manual.' },
    { id: 'sPrice', label: 'Synthetic: price per quart', type: 'number', prefix: '$', default: 9, min: 0, step: 0.25, info: 'Price of one quart of synthetic oil.' },
    { id: 'sFilter', label: 'Synthetic: oil filter', type: 'number', prefix: '$', default: 12, min: 0, step: 1, info: 'Price of the oil filter for one change.' },
    { id: 'sLabor', label: 'Synthetic: labor', type: 'number', prefix: '$', default: 18, min: 0, step: 1, info: 'Shop labor for one change. Enter 0 if you do it yourself.' },
    { id: 'sInterval', label: 'Synthetic: miles between changes', type: 'number', suffix: 'mi', default: 7500, min: 1, step: 500, info: 'Only use a longer interval if your manual or the oil label allows it.' },
    { id: 'miles', label: 'Miles driven per year', type: 'number', suffix: 'mi', default: 12000, min: 0, step: 500, info: 'How many miles you drive in a year.' },
  ],
  outputs: [
    { id: 'diffYear', label: 'Synthetic minus conventional, per year', format: 'currency', primary: true, info: 'Positive means synthetic costs more per year; negative means it saves money.' },
    { id: 'cPerMile', label: 'Conventional cost per mile', format: 'currency', precision: 4, info: 'Cost per change ÷ interval.' },
    { id: 'sPerMile', label: 'Synthetic cost per mile', format: 'currency', precision: 4, info: 'Cost per change ÷ interval.' },
    { id: 'cYear', label: 'Conventional per year', format: 'currency', info: 'Cost per mile × miles per year.' },
    { id: 'sYear', label: 'Synthetic per year', format: 'currency', info: 'Cost per mile × miles per year.' },
    { id: 'cChange', label: 'Conventional cost per change', format: 'currency', info: 'Quarts × price + filter + labor.' },
    { id: 'sChange', label: 'Synthetic cost per change', format: 'currency', info: 'Quarts × price + filter + labor.' },
    { id: 'breakEven', label: 'Synthetic break-even interval', format: 'number', precision: 0, suffix: ' mi', info: 'Synthetic cost per change ÷ conventional cost per mile. Beyond this interval synthetic is cheaper per mile.' },
  ],
  compute: (v) => {
    const cQuarts = num(v.cQuarts), cPrice = num(v.cPrice), cFilter = num(v.cFilter), cLabor = num(v.cLabor), cInterval = num(v.cInterval);
    const sQuarts = num(v.sQuarts), sPrice = num(v.sPrice), sFilter = num(v.sFilter), sLabor = num(v.sLabor), sInterval = num(v.sInterval);
    const miles = num(v.miles);
    if ([cQuarts, cPrice, cFilter, cLabor, cInterval, sQuarts, sPrice, sFilter, sLabor, sInterval, miles].some((x) => x === null)) return { diffYear: null };
    if ((cInterval as number) <= 0 || (sInterval as number) <= 0) return { diffYear: null, error: 'The miles between changes must be greater than 0.' };
    if ([cQuarts, cPrice, cFilter, cLabor, sQuarts, sPrice, sFilter, sLabor, miles].some((x) => (x as number) < 0)) return { diffYear: null, error: 'Values cannot be negative.' };
    const cCost = cQuarts! * cPrice! + cFilter! + cLabor!;
    const sCost = sQuarts! * sPrice! + sFilter! + sLabor!;
    const cPerMile = cCost / cInterval!;
    const sPerMile = sCost / sInterval!;
    const cYear = cPerMile * miles!;
    const sYear = sPerMile * miles!;
    const diffYear = sYear - cYear;
    const breakEven = cPerMile > 0 ? sCost / cPerMile : null;
    const badge = Math.abs(diffYear) < 0.005
      ? 'Same yearly cost'
      : diffYear > 0 ? 'Synthetic costs ' + usd(diffYear) + ' more a year' : 'Synthetic saves ' + usd(-diffYear) + ' a year';
    return {
      diffYear,
      cPerMile,
      sPerMile,
      cYear,
      sYear,
      cChange: cCost,
      sChange: sCost,
      breakEven,
      tone: diffYear > 0.005 ? 'warn' : 'ok',
      badge,
      chart: {
        type: 'bar',
        title: 'Oil cost per year',
        categories: ['Conventional', 'Synthetic'],
        series: [{ name: 'Per year', values: [cYear, sYear] }],
        format: { format: 'currency' },
      },
      steps: [
        `Conventional change: ${cQuarts} × ${usd(cPrice!)} + ${usd(cFilter!)} + ${usd(cLabor!)} = ${usd(cCost)}`,
        `Conventional per mile: ${usd(cCost)} ÷ ${mi(cInterval!)} = ${usd3(cPerMile)}; a year: ${usd3(cPerMile)} × ${mi(miles!)} = ${usd(cYear)}`,
        `Synthetic change: ${sQuarts} × ${usd(sPrice!)} + ${usd(sFilter!)} + ${usd(sLabor!)} = ${usd(sCost)}`,
        `Synthetic per mile: ${usd(sCost)} ÷ ${mi(sInterval!)} = ${usd3(sPerMile)}; a year: ${usd3(sPerMile)} × ${mi(miles!)} = ${usd(sYear)}`,
        breakEven === null
          ? 'Break-even: not defined because the conventional change costs nothing.'
          : `Break-even: ${usd(sCost)} ÷ ${usd3(cPerMile)} = ${mi(breakEven)} miles between synthetic changes`,
      ],
      note: 'Your owner\'s manual sets the oil type and the change interval, and severe use (short trips, towing, dust, extreme heat or cold) shortens it. Prices and intervals are your own figures; this does not judge engine protection.',
    };
  },
  content: {
    formula: [
      'Cost per change = quarts × price per quart + filter + labor',
      'Cost per mile = cost per change ÷ miles between changes',
      'Cost per year = cost per mile × miles per year',
      'Synthetic break-even interval = synthetic cost per change ÷ conventional cost per mile',
    ],
    body: [
      'Synthetic oil costs more per change but is often rated for a longer interval. Dividing each change by the miles it covers puts both options on the same footing, a cost per mile, so you can see which one is cheaper over a year of driving.',
      'The break-even interval tells you how far synthetic oil has to go between changes to match conventional oil on cost per mile. If your manual allows a longer interval than that, synthetic comes out ahead on cost; if not, it costs a little more.',
      'Always follow the owner\'s manual for the oil specification and the change interval. Severe use, such as short trips, towing, dusty roads or extreme temperatures, shortens the interval, and many cars also have an oil-life monitor that you should follow.',
      'Enter 0 for labor if you change the oil yourself. This calculator only compares cost; it does not say which oil is better for your engine.',
    ],
    faq: [
      { q: 'How much does an oil change cost per mile?', a: 'In the default example, a conventional change of 5 quarts at $5, an $8 filter and $12 labor is $45. Over 5,000 miles that is $0.009 per mile, or $108 a year at 12,000 miles.' },
      { q: 'Is synthetic oil cheaper per mile?', a: 'Not in the default example. A $75 synthetic change over 7,500 miles is $0.010 per mile, or $120 a year, which is $12 a year more than conventional.' },
      { q: 'At what interval does synthetic oil break even?', a: 'In the default example, synthetic oil breaks even at about 8,333 miles between changes: $75 ÷ $0.009 per mile. Only stretch the interval if your owner\'s manual allows it.' },
      { q: 'How often should I change my oil?', a: 'Follow your owner\'s manual and any oil-life monitor. Severe use, such as short trips, towing or extreme temperatures, shortens the interval.' },
    ],
    sources: [
      { label: 'U.S. Department of Energy: Fuel Economy, Maintenance', url: 'https://www.fueleconomy.gov/feg/maintain.shtml' },
    ],
  },
  related: ['keep-vs-replace-car', 'cost-per-mile'],
  examples: [
    // conv 5*5+8+12 = 45; 45/5000 = 0.009; *12000 = 108. syn 5*9+12+18 = 75; 75/7500 = 0.01; *12000 = 120. diff 12. break-even 75/0.009 = 8333.33
    { values: { cQuarts: 5, cPrice: 5, cFilter: 8, cLabor: 12, cInterval: 5000, sQuarts: 5, sPrice: 9, sFilter: 12, sLabor: 18, sInterval: 7500, miles: 12000 }, expect: { cChange: 45, sChange: 75, cPerMile: 0.009, sPerMile: 0.01, cYear: 108, sYear: 120, diffYear: 12, breakEven: 8333.3333 }, tolerance: 0.001 },
    // conv 4*6+0+0 = 24; /3000 = 0.008; *10000 = 80. syn 4*10+10+0 = 50; /10000 = 0.005; *10000 = 50. diff -30. break-even 50/0.008 = 6250
    { values: { cQuarts: 4, cPrice: 6, cFilter: 0, cLabor: 0, cInterval: 3000, sQuarts: 4, sPrice: 10, sFilter: 10, sLabor: 0, sInterval: 10000, miles: 10000 }, expect: { cYear: 80, sYear: 50, diffYear: -30, breakEven: 6250 }, tolerance: 1e-6 },
  ],
});
