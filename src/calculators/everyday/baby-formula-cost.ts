import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const DAYS_YEAR = 365;

export default defineCalculator({
  slug: 'baby-formula-cost',
  title: 'Baby Formula Cost Calculator',
  category: 'everyday',
  description: 'Work out what baby formula costs per ounce, per day, per month and per year from the container price, prepared ounces it makes and ounces used a day.',
  keywords: ['baby formula cost calculator', 'how much does formula cost per month', 'infant formula cost per ounce', 'formula budget', 'formula cost per year'],
  updated: '2026-11-27',
  inputs: [
    { id: 'price', label: 'Container price', type: 'number', prefix: '$', default: 32, min: 0, step: 0.01, info: 'What you pay for one container of powder, before any coupon.' },
    { id: 'ounces', label: 'Prepared ounces per container', type: 'number', default: 90, min: 0.1, step: 1, info: 'Read this from the label: the amount of ready-to-drink formula one container makes.' },
    { id: 'ozDay', label: 'Ounces used per day', type: 'number', default: 24, min: 0, step: 1, info: 'Prepared ounces your baby takes in a day. Follow your pediatrician for amounts.' },
    { id: 'days', label: 'Days per month', type: 'number', default: 30.4167, min: 1, max: 31, step: 0.0001, info: 'Average month is 365 / 12 = 30.4167 days. Use 30 or 31 for a specific month.' },
    { id: 'discount', label: 'Coupon or subscription discount', type: 'number', suffix: '%', default: 0, min: 0, max: 100, step: 1, info: 'Percent off the container price. Leave at 0 for none.' },
  ],
  outputs: [
    { id: 'perMonth', label: 'Cost per month', format: 'currency', primary: true, info: 'Cost per day × days per month.' },
    { id: 'perOz', label: 'Cost per prepared ounce', format: 'currency', precision: 4, info: 'Price × (1 − discount) ÷ prepared ounces per container.' },
    { id: 'perDay', label: 'Cost per day', format: 'currency', info: 'Cost per ounce × ounces per day.' },
    { id: 'perYear', label: 'Cost per year', format: 'currency', info: 'Cost per day × 365.' },
  ],
  compute: (v) => {
    const price = num(v.price), oz = num(v.ounces), perDayOz = num(v.ozDay), days = num(v.days);
    const disc = v.discount === '' || v.discount === undefined || v.discount === null ? 0 : num(v.discount);
    if ([price, oz, perDayOz, days, disc].some((x) => x === null)) return { perMonth: null };
    if ((price as number) < 0 || (oz as number) <= 0 || (perDayOz as number) < 0 || (days as number) < 1 || (days as number) > 31 || (disc as number) < 0 || (disc as number) > 100) return { perMonth: null };
    const net = (price as number) * (1 - (disc as number) / 100);
    const perOz = net / (oz as number);
    const perDay = perOz * (perDayOz as number);
    const perMonth = perDay * (days as number);
    const perYear = perDay * DAYS_YEAR;
    const perWeek = perDay * 7;
    const containersMonth = ((perDayOz as number) * (days as number)) / (oz as number);
    return {
      perMonth,
      perOz,
      perDay,
      perYear,
      tone: 'ok',
      badge: `${money(perDay)} a day`,
      note: `Formula comes to ${money(perOz, 4)} an ounce, ${money(perDay)} a day and ${money(perMonth)} a month, about ${fmt(containersMonth, 1)} containers a month. Amounts are your own inputs, so ask your pediatrician what your baby needs.`,
      chart: {
        type: 'bar' as const,
        title: 'Formula cost by period',
        categories: ['Day', 'Week', 'Month'],
        series: [{ name: 'Cost', values: [+perDay.toFixed(2), +perWeek.toFixed(2), +perMonth.toFixed(2)] }],
        format: CURRENCY,
        highlight: 2,
      },
      steps: [
        `Price after discount: ${money(price as number)} × (1 − ${fmt(disc as number)}%) = ${money(net)}`,
        `Per ounce: ${money(net)} ÷ ${fmt(oz as number)} oz = ${money(perOz, 4)}`,
        `Per day: ${money(perOz, 4)} × ${fmt(perDayOz as number)} oz = ${money(perDay)}`,
        `Per month: ${money(perDay)} × ${fmt(days as number, 4)} days = ${money(perMonth)}`,
        `Per year: ${money(perDay)} × 365 = ${money(perYear)}`,
      ],
    };
  },
  content: {
    formula: [
      'Cost per ounce = container price × (1 − discount) ÷ prepared ounces per container',
      'Cost per day = cost per ounce × ounces per day',
      'Cost per month = cost per day × days per month (30.4167 = 365 ÷ 12)',
      'Cost per year = cost per day × 365',
    ],
    body: [
      'Formula is a steady line in a new family budget, and container sizes make prices hard to compare. Enter the container price and the prepared ounces it makes (printed on the label), then the ounces used a day, to see the cost per ounce, per day, per month and per year.',
      'If you have a coupon or a subscription discount, enter it as a percent off the container price. The cost per ounce is the figure to compare between brands and sizes, since it ignores how big the container is. For a generic version of that comparison, see the unit price calculator.',
      'This calculator does not suggest how much to feed. How much formula a baby needs depends on age and health, so follow your pediatrician\'s advice and enter what you actually use. Prices and amounts are your own inputs, so the result is an estimate. For the other big baby expense, see the diaper cost calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much does formula cost per ounce?', a: 'With the defaults, a $32 container that makes 90 prepared ounces costs $32 ÷ 90 = $0.3556 per ounce.' },
      { q: 'How much does formula cost per month and per year?', a: 'At 24 ounces a day, that is $0.3556 × 24 = $8.53 a day. Over an average month of 30.4167 days it comes to $259.56, and over 365 days it comes to $3,114.67.' },
      { q: 'How does a discount change the cost?', a: 'A 15% coupon takes the $32 container to $27.20, so $27.20 ÷ 90 = $0.3022 an ounce. At 24 ounces a day that is $7.25 a day, $220.62 a month and $2,647.47 a year.' },
      { q: 'How much formula should my baby have?', a: 'This calculator does not say. Amounts depend on your baby, so follow your pediatrician\'s advice and enter the ounces you actually use.' },
    ],
    sources: [],
  },
  related: ['diaper-cost', 'unit-price'],
  examples: [
    // perOz = 32/90 = 0.355556; perDay = 0.355556*24 = 8.533333; perMonth = 8.533333*30.4167 = 259.5558; perYear = 8.533333*365 = 3114.6667
    { values: { price: 32, ounces: 90, ozDay: 24, days: 30.4167, discount: 0 }, expect: { perOz: 0.3556, perDay: 8.5333, perMonth: 259.5558, perYear: 3114.6667 }, tolerance: 0.001 },
    // net = 32*0.85 = 27.20; perOz = 27.20/90 = 0.302222; perDay = 0.302222*24 = 7.253333; perMonth = 7.253333*30.4167 = 220.6224; perYear = 7.253333*365 = 2647.4667
    { values: { price: 32, ounces: 90, ozDay: 24, days: 30.4167, discount: 15 }, expect: { perOz: 0.3022, perDay: 7.2533, perMonth: 220.6224, perYear: 2647.4667 }, tolerance: 0.001 },
  ],
});
