import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'twelve-days-of-christmas',
  title: 'Twelve Days of Christmas Gift Calculator',
  category: 'everyday',
  description: 'Count every gift in the Twelve Days of Christmas song, day by day, and add up the cost if each gift has an average price. The total for 12 days is 364.',
  keywords: ['twelve days of christmas calculator', 'how many gifts in 12 days of christmas', '12 days of christmas total gifts', 'twelve days of christmas cost', 'true love gifts total', 'partridge in a pear tree total'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'days', label: 'Days of Christmas', type: 'number', default: 12, min: 1, max: 12, step: 1, info: 'How many days of the song to count, from 1 to 12.' },
    { id: 'price', label: 'Average price per gift', type: 'number', prefix: '$', optional: true, min: 0, step: 1, info: 'Optional. One average price for every gift, to estimate the total cost. Leave blank to count gifts only.' },
  ],
  outputs: [
    { id: 'total', label: 'Total gifts', format: 'integer', primary: true, info: 'Every gift received across all the days: n(n+1)(n+2) ÷ 6.' },
    { id: 'lastDay', label: 'Gifts on the last day', format: 'integer', info: 'Gifts that arrive on the final day: d(d+1) ÷ 2.' },
    { id: 'cost', label: 'Total cost', format: 'currency', info: 'Total gifts × average price per gift. Shown only when you enter a price.' },
  ],
  compute: (v) => {
    const d = num(v.days);
    const price = num(v.price);
    if (d === null || d < 1 || d > 12) return { total: null };
    if (price !== null && price < 0) return { total: null };
    const n = Math.round(d);
    const total = (n * (n + 1) * (n + 2)) / 6;
    const lastDay = (n * (n + 1)) / 2;
    const cost = price === null ? null : total * price;
    const xs: number[] = [];
    const cumulative: number[] = [];
    let running = 0;
    for (let day = 1; day <= n; day++) {
      running += (day * (day + 1)) / 2;
      xs.push(day);
      cumulative.push(running);
    }
    const costNote = cost === null ? '' : ` At ${money(price as number)} each, that comes to ${money(cost)}.`;
    return {
      total,
      lastDay,
      cost,
      tone: 'ok',
      badge: `my true love sent me ${total} gifts T_T`,
      note: `Over ${n} ${n === 1 ? 'day' : 'days'} you receive ${total} gifts in all, and ${lastDay} of them arrive on day ${n}.${costNote}`,
      chart: {
        type: 'line',
        title: 'Gifts received so far',
        x: xs,
        xLabel: 'Day',
        yLabel: 'Total gifts',
        yFormat: { format: 'integer' },
        series: [{ name: 'Cumulative gifts', values: cumulative }],
      },
      steps: [
        `Gifts on day ${n} = ${n} × ${n + 1} ÷ 2 = ${lastDay}`,
        `Total gifts = ${n} × ${n + 1} × ${n + 2} ÷ 6 = ${total}`,
        ...(cost === null ? [] : [`Total cost = ${total} × ${money(price as number)} = ${money(cost)}`]),
      ],
    };
  },
  content: {
    formula: [
      'Gifts on day d = d × (d + 1) ÷ 2',
      'Gift number i is given (n − i + 1) times, so i × (n − i + 1) items in all',
      'Total gifts over n days = n × (n + 1) × (n + 2) ÷ 6',
    ],
    body: [
      'In the song, each new day repeats every earlier gift and adds one more. On day 1 you get 1 gift, on day 2 you get 3, on day 3 you get 6, and so on. The number of gifts on day d is the sum 1 + 2 + ... + d, which is d × (d + 1) ÷ 2.',
      'Adding up every day gives the total: n × (n + 1) × (n + 2) ÷ 6. For all twelve days that is 12 × 13 × 14 ÷ 6 = 364 gifts. The twelfth day alone brings 78.',
      'You can also count by gift. The partridge is given once on each of the 12 days, so 12 times. The drummers are given only on the last day, so 12 drummers once. Gift number i is given (n − i + 1) times, which means i × (n − i + 1) items in all.',
      'Add an average price per gift to see a rough cost. It is one flat price for everything, so it is only an estimate. The calculator counts gifts and multiplies, and everything runs in your browser.',
    ],
    faq: [
      { q: 'How many gifts are there in the 12 days of Christmas?', a: 'There are 364 gifts in all. That is 12 × 13 × 14 ÷ 6 = 364.' },
      { q: 'How many gifts arrive on the twelfth day?', a: '78 gifts. Day 12 repeats every earlier gift, so it is 12 × 13 ÷ 2 = 78.' },
      { q: 'How much would it cost at $50 per gift?', a: 'For all twelve days, 364 gifts × $50 = $18,200. This uses one flat price for every gift.' },
      { q: 'How many gifts for five days?', a: 'Five days gives 5 × 6 × 7 ÷ 6 = 35 gifts.' },
      { q: 'Which gift is given the most times?', a: 'Counting items, the six geese a-laying and the seven swans a-swimming tie at 42 each over twelve days: 6 × 7 and 7 × 6.' },
    ],
    sources: [],
  },
  related: ['holiday-spending-total', 'gift-budget'],
  examples: [
    // n = 12: 12 × 13 × 14 ÷ 6 = 2184 ÷ 6 = 364; day 12 alone = 12 × 13 ÷ 2 = 78.
    { values: { days: 12 }, expect: { total: 364, lastDay: 78 }, tolerance: 1e-9 },
    // 364 gifts × $50 = $18,200.
    { values: { days: 12, price: 50 }, expect: { total: 364, cost: 18200 }, tolerance: 1e-9 },
    // n = 5: 5 × 6 × 7 ÷ 6 = 35; day 5 = 15.
    { values: { days: 5 }, expect: { total: 35, lastDay: 15 }, tolerance: 1e-9 },
  ],
});
