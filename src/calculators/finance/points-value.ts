import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'points-value',
  title: 'Points Value Calculator: Cents Per Point',
  category: 'finance',
  description: 'Work out what each credit card point or mile is worth on a booking, then compare it with your own baseline to decide whether to pay with points or cash.',
  keywords: ['points value calculator', 'cents per point calculator', 'credit card points worth', 'miles value calculator', 'points or cash', 'cpp calculator'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'cash', label: 'Cash price of the booking', type: 'number', prefix: '$', default: 450, min: 0, step: 10, info: 'What the same flight, hotel or item costs if you pay cash.' },
    { id: 'fees', label: 'Taxes and fees you still pay with points', type: 'number', prefix: '$', default: 11, min: 0, step: 1, optional: true, help: 'Award bookings often still charge some taxes and fees in cash.', info: 'Cash you pay even when booking with points. It is subtracted, because points only replace the rest of the price.' },
    { id: 'points', label: 'Points needed', type: 'number', default: 25000, min: 1, step: 500, info: 'The number of points or miles the booking costs.' },
    { id: 'baseline', label: 'Your baseline value per point', type: 'number', suffix: '¢', default: 1, min: 0, step: 0.1, optional: true, help: 'What you consider a point worth, such as its cash-back value.', info: 'Your own yardstick, for example 1¢ if the card gives 1 cent per point as cash back. This calculator quotes no official program values.' },
  ],
  outputs: [
    { id: 'cpp', label: 'Value per point', format: 'number', suffix: '¢', primary: true, info: '(Cash price − fees paid) ÷ points × 100.' },
    { id: 'saved', label: 'Cash value of the points used', format: 'currency', info: 'Cash price − fees paid: the cash the points replace.' },
    { id: 'atBaseline', label: 'Points valued at your baseline', format: 'currency', info: 'Points × baseline ÷ 100.' },
    { id: 'gain', label: 'Gain (or loss) vs baseline', format: 'currency', info: 'Cash the points replace − points valued at your baseline. Positive means points beat your baseline.' },
  ],
  compute: (v) => {
    const cash = num(v.cash);
    const fees = num(v.fees) ?? 0;
    const points = num(v.points);
    const base = num(v.baseline) ?? 1;
    if (cash === null || points === null || points <= 0 || cash < 0 || fees < 0 || base < 0) return { cpp: null };
    if (fees > cash) return { cpp: null, error: 'The fees you pay with points are higher than the cash price, so there is nothing for the points to replace. Check the two amounts.' };

    const saved = cash - fees;
    const cpp = (saved / points) * 100;
    const atBaseline = (points * base) / 100;
    const gain = saved - atBaseline;
    const good = cpp >= base;

    return {
      cpp,
      saved,
      atBaseline,
      gain,
      tone: good ? 'good' : 'warn',
      badge: good ? 'Points look worth it' : 'Cash looks better',
      chart: {
        type: 'bar',
        title: 'Cash the points replace vs points at your baseline',
        categories: ['Cash replaced', 'Points at baseline'],
        series: [{ name: 'Dollars', values: [saved, atBaseline] }],
        format: { format: 'currency' },
      },
      steps: [
        `Cash the points replace = ${money(cash, 2)} − ${money(fees, 2)} = ${money(saved, 2)}`,
        `Value per point = ${money(saved, 2)} ÷ ${points.toLocaleString('en-US')} × 100 = ${+cpp.toFixed(3)}¢`,
        `Points at your baseline = ${points.toLocaleString('en-US')} × ${base}¢ = ${money(atBaseline, 2)}`,
        `Gain vs baseline = ${money(saved, 2)} − ${money(atBaseline, 2)} = ${money(gain, 2)}`,
      ],
      note: good
        ? `Each point is worth about ${+cpp.toFixed(2)}¢ here, above your ${base}¢ baseline. Paying with points saves the equivalent of ${money(gain, 2)} versus valuing them at your baseline.`
        : `Each point is worth about ${+cpp.toFixed(2)}¢ here, below your ${base}¢ baseline. Paying cash and keeping the points would be worth about ${money(-gain, 2)} more by your own yardstick.`,
    };
  },
  content: {
    formula: [
      'Value per point (in cents) = (cash price − taxes and fees paid) ÷ points × 100',
      'Points at your baseline = points × baseline cents ÷ 100',
      'Gain vs baseline = (cash price − fees) − points at your baseline',
    ],
    body: [
      'Points and miles are only worth what you can get for them, and that changes with every booking. This calculator turns one booking into a single number, cents per point, so you can compare it with what you would get by spending the points another way.',
      'Enter the cash price, the taxes and fees you would still pay on an award booking, and the points required. The fees come off the cash price first, because the points only replace the rest.',
      'Then set a baseline: the value you are happy to give a point, such as its cash-back value. If this booking beats your baseline, using points is the better deal by your own yardstick; if not, paying cash and saving the points may be smarter. Published point valuations are other people\'s opinions, so this page does not quote any.',
    ],
    sections: [
      {
        heading: 'Watch out for',
        paragraphs: [
          'Compare like with like: the cash price should be for the same dates, seat or room as the award. Points can also expire or change in price, and some programs charge more for peak dates. Using points to pay off a statement balance on a card that charges interest is a different decision, so check the interest cost first.',
        ],
      },
    ],
    faq: [
      { q: 'How do I calculate cents per point?', a: 'Subtract the cash fees you still pay from the cash price, divide by the points needed, then multiply by 100. A $450 flight with $11 fees for 25,000 points is (450 − 11) ÷ 25,000 × 100 = 1.756 cents per point.' },
      { q: 'What is a good value per point?', a: 'It depends on your baseline. If your points are worth 1 cent as cash back, anything above 1 beats it. This calculator compares against the number you enter, not a published valuation.' },
      { q: 'Why subtract taxes and fees?', a: 'You pay them in cash either way, so they do not measure what the points bought. Leaving them in makes points look better than they are.' },
      { q: 'How much do 25,000 points save at a 1 cent baseline?', a: 'At 1 cent, 25,000 points are worth $250. If the booking replaces $439 of cash, the gain over that baseline is $189.' },
      { q: 'Should I always use points when the value is high?', a: 'Not always. Consider whether you could use the points on something else, expiry, and whether the cash price is the real alternative.' },
    ],
    sources: [
      { label: 'CFPB: What should I know about credit card rewards?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-should-i-know-about-credit-card-rewards-programs-en-1893/' },
    ],
  },
  related: ['credit-card-annual-fee', 'credit-card-payoff', 'trip-budget', 'drive-vs-fly-cost', 'savings-runway'],
  examples: [
    {
      // (450 − 11) = 439; 439 / 25,000 × 100 = 1.756; at 1¢: 25,000 × 0.01 = 250; gain 439 − 250 = 189.
      values: { cash: 450, fees: 11, points: 25000, baseline: 1 },
      expect: { cpp: 1.756, saved: 439, atBaseline: 250, gain: 189 },
      tolerance: 0.001,
    },
    {
      // 200 − 5.6 = 194.4; 194.4 / 30,000 × 100 = 0.648; at 1.5¢: 450; gain 194.4 − 450 = −255.6.
      values: { cash: 200, fees: 5.6, points: 30000, baseline: 1.5 },
      expect: { cpp: 0.648, saved: 194.4, atBaseline: 450, gain: -255.6 },
      tolerance: 0.001,
    },
  ],
});
