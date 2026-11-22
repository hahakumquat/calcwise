import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'candle-burn-time',
  title: 'Candle Burn Time and Cost Calculator',
  category: 'everyday',
  description: 'Find what a candle costs per hour and per evening, how many evenings one lasts and how many candles you need. Burn hours are the maker’s estimate.',
  keywords: ['candle burn time calculator', 'candle cost per hour', 'how long will a candle last', 'how many candles do i need', 'candle burn hours', 'cost of burning a candle'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'price', label: 'Candle price', type: 'number', prefix: '$', default: 24, min: 0, step: 0.5, info: 'What you pay for one candle.' },
    { id: 'burn', label: 'Label burn time', type: 'number', default: 50, min: 0, step: 1, suffix: 'hours', info: 'The hours printed on the label. This is the maker’s estimate.' },
    { id: 'perNight', label: 'Hours lit per evening', type: 'number', default: 3, min: 0, step: 0.5, suffix: 'hours', info: 'How long you burn it each evening.' },
    { id: 'evenings', label: 'Evenings', type: 'number', default: 31, min: 0, step: 1, info: 'How many evenings you want to cover, such as a month.' },
  ],
  outputs: [
    { id: 'perHour', label: 'Cost per hour', format: 'currency', precision: 2, primary: true, info: 'Price ÷ burn hours.' },
    { id: 'perEvening', label: 'Cost per evening', format: 'currency', precision: 2, info: 'Cost per hour × hours lit per evening.' },
    { id: 'eveningsEach', label: 'Evenings per candle', format: 'number', precision: 2, info: 'Burn hours ÷ hours per evening.' },
    { id: 'candles', label: 'Candles needed', format: 'integer', info: 'Total hours ÷ burn hours, rounded up.' },
    { id: 'total', label: 'Total cost', format: 'currency', precision: 2, info: 'Candles needed × price.' },
  ],
  compute: (v) => {
    const price = num(v.price), burn = num(v.burn), perNight = num(v.perNight), evenings = num(v.evenings);
    if ([price, burn, perNight, evenings].some((x) => x === null)) return { perHour: null };
    if (burn! <= 0 || perNight! <= 0 || price! < 0 || evenings! < 0) return { perHour: null };
    const perHour = price! / burn!;
    const perEvening = perHour * perNight!;
    const eveningsEach = burn! / perNight!;
    const hours = evenings! * perNight!;
    const candles = Math.ceil(+(hours / burn!).toFixed(9));
    const total = candles * price!;
    if (![perHour, perEvening, eveningsEach, total].every(Number.isFinite)) return { perHour: null };
    return {
      perHour,
      perEvening,
      eveningsEach,
      candles,
      total,
      tone: 'ok',
      badge: `${candles} ${candles === 1 ? 'candle' : 'candles'}, ${money(total)}`,
      note: `At ${money(price!)} for ${fmt(burn!, 1)} label hours, a candle costs ${money(perHour)} an hour and ${money(perEvening)} an evening, and lasts ${fmt(eveningsEach)} evenings. ${fmt(evenings!, 0)} evenings is ${fmt(hours, 1)} hours, so you need ${candles} ${candles === 1 ? 'candle' : 'candles'} (${money(total)}). Label hours are the maker’s estimate and real burn varies. Never leave a lit candle unattended.`,
      chart: {
        type: 'bar',
        title: 'Cost for your evenings',
        categories: ['Per hour', 'Per evening', 'Per candle'],
        series: [{ name: 'Cost', values: [perHour, perEvening, price!] }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [
        `Per hour = ${money(price!)} ÷ ${fmt(burn!, 1)} = ${money(perHour)}`,
        `Per evening = ${money(perHour)} × ${fmt(perNight!, 1)} = ${money(perEvening)}`,
        `Total hours = ${fmt(evenings!, 0)} × ${fmt(perNight!, 1)} = ${fmt(hours, 1)}`,
        `Candles = ${fmt(hours, 1)} ÷ ${fmt(burn!, 1)}, rounded up = ${candles}; cost = ${money(total)}`,
      ],
    };
  },
  content: {
    formula: [
      'Cost per hour = price ÷ label burn hours',
      'Evenings per candle = label burn hours ÷ hours lit per evening',
      'Candles needed = total hours ÷ label burn hours, rounded up',
    ],
    body: [
      'Candle labels give a burn time in hours. Dividing the price by those hours gives a cost per hour, which makes candles easy to compare, and multiplying by the hours you light it each evening gives a cost per evening.',
      'The label hours are the maker’s estimate. Real burn time varies with the wick, drafts, how long you burn it each sitting and how you trim the wick, so treat the result as approximate.',
      'Example: a $24 candle rated 50 hours costs $0.48 an hour. Lit 3 hours a night that is $1.44 an evening, and one candle lasts 16.67 evenings. Over 31 evenings you burn 93 hours, which needs 2 candles, or $48.',
      'Safety: never leave a lit candle unattended.',
      'Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does a candle cost per hour?', a: 'Price divided by label burn hours. A $24 candle rated 50 hours is $0.48 an hour.' },
      { q: 'How many evenings will one candle last?', a: 'Label hours divided by hours lit per evening. At 50 hours and 3 hours a night, that is 16.67 evenings.' },
      { q: 'How many candles do I need for a month?', a: 'With the defaults, 31 evenings × 3 hours is 93 hours. At 50 hours per candle that rounds up to 2 candles, or $48.' },
      { q: 'Are label burn hours accurate?', a: 'They are the maker’s estimate. Real burn varies, so your candle may last more or less than the label says.' },
    ],
    sources: [],
  },
  related: ['electricity-cost', 'unit-price', 'holiday-lights', 'wrapping-paper'],
  examples: [
    // 24/50 = 0.48/h; *3 = 1.44; 50/3 = 16.67; hours 31*3 = 93; 93/50 = 1.86 -> 2 candles; 2*24 = 48
    { values: { price: 24, burn: 50, perNight: 3, evenings: 31 }, expect: { perHour: 0.48, perEvening: 1.44, eveningsEach: 16.67, candles: 2, total: 48 }, tolerance: 0.01 },
    // 10/40 = 0.25/h; *2 = 0.50; 40/2 = 20; hours 40*2 = 80; 80/40 = 2 -> 2 candles; 20
    { values: { price: 10, burn: 40, perNight: 2, evenings: 40 }, expect: { perHour: 0.25, perEvening: 0.5, eveningsEach: 20, candles: 2, total: 20 }, tolerance: 0.01 },
  ],
});
