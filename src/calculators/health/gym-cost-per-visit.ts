import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'gym-cost-per-visit',
  title: 'Gym Cost Per Visit Calculator',
  category: 'health',
  description: 'Work out what each gym visit really costs, how many visits a month make the membership worth it, and whether drop-in prices would be cheaper.',
  keywords: ['gym cost per visit', 'is my gym membership worth it', 'gym membership break even', 'cost per workout', 'gym vs drop-in', 'gym joining fee'],
  updated: '2026-11-16',
  inputs: [
    { id: 'fee', label: 'Monthly fee', type: 'number', prefix: '$', default: 60, min: 0, step: 1, info: 'What the gym charges you each month.' },
    { id: 'joining', label: 'Joining fee', type: 'number', prefix: '$', default: 0, min: 0, step: 1, info: 'A one-off sign-up or enrolment fee. Leave at 0 if there is none.' },
    { id: 'months', label: 'Months', type: 'number', default: 12, min: 1, max: 120, step: 1, info: 'How long you expect to keep the membership. The joining fee is spread over this period.' },
    { id: 'visits', label: 'Visits per month', type: 'number', default: 10, min: 0, max: 60, step: 1, info: 'How often you realistically go, on average. Be honest: count your real average, not your plan.' },
    { id: 'dropin', label: 'Drop-in price', type: 'number', prefix: '$', default: 15, min: 0, step: 1, info: 'What one visit costs without a membership: a day pass, a class or a pay-as-you-go gym.' },
  ],
  outputs: [
    { id: 'perVisit', label: 'Cost per visit', format: 'currency', primary: true, info: '(Monthly fee × months + joining fee) ÷ (visits per month × months).' },
    { id: 'total', label: 'Total spent on the gym', format: 'currency', info: 'Monthly fee × months, plus the joining fee.' },
    { id: 'dropinTotal', label: 'Same visits at drop-in prices', format: 'currency', info: 'Drop-in price × visits per month × months.' },
    { id: 'saving', label: 'Saving vs drop-in', format: 'currency', info: 'Drop-in total minus what the gym costs. Negative means the gym costs more than paying per visit.' },
    { id: 'breakeven', label: 'Break-even visits per month', format: 'number', precision: 1, suffix: 'visits', info: 'Monthly fee ÷ drop-in price. Above this many visits a month the membership beats drop-in. The joining fee is ignored here.' },
  ],
  compute: (v) => {
    const fee = num(v.fee);
    const joining = num(v.joining) ?? 0;
    const monthsRaw = num(v.months);
    const visits = num(v.visits);
    const dropin = num(v.dropin);
    if (fee === null || monthsRaw === null || visits === null || dropin === null || fee < 0 || joining < 0 || monthsRaw < 1 || visits < 0 || dropin < 0) return { perVisit: null };
    const months = Math.round(monthsRaw);
    const total = fee * months + joining;
    const dropinTotal = dropin * visits * months;
    const saving = dropinTotal - total;
    const breakeven = dropin > 0 ? fee / dropin : null;
    const base = { total, dropinTotal, saving, breakeven };
    if (visits === 0) {
      return {
        perVisit: null,
        ...base,
        tone: 'bad' as const,
        badge: 'No visits',
        note: `With 0 visits a month the cost per visit is undefined, because there is nothing to divide by. You would still spend $${fmt(total, 2)} over ${months} months.`,
      };
    }
    const perVisit = total / (visits * months);
    const xs: number[] = [];
    const gym: number[] = [];
    const ref: number[] = [];
    for (let k = 1; k <= 20; k++) {
      xs.push(k);
      gym.push(total / (k * months));
      ref.push(dropin);
    }
    const worth = perVisit < dropin;
    const tied = perVisit === dropin;
    const marker = Number.isInteger(visits) && visits >= 1 && visits <= 20 ? [{ x: visits, label: 'You' }] : undefined;
    return {
      perVisit,
      ...base,
      tone: worth ? ('good' as const) : tied ? ('ok' as const) : ('bad' as const),
      badge: worth ? 'Beats drop-in' : tied ? 'Same as drop-in' : 'Drop-in is cheaper',
      note: worth
        ? `At ${fmt(visits, visits % 1 ? 1 : 0)} visits a month each visit costs $${fmt(perVisit, 2)}, under the $${fmt(dropin, 2)} drop-in price. You save $${fmt(saving, 2)} over ${months} months.`
        : tied
          ? `Each visit costs $${fmt(perVisit, 2)}, exactly the drop-in price, so the membership and paying per visit cost the same.`
          : `Each visit costs $${fmt(perVisit, 2)}, more than the $${fmt(dropin, 2)} drop-in price. Paying per visit would cost $${fmt(-saving, 2)} less over ${months} months.`,
      chart: {
        type: 'line',
        title: 'Cost per visit by how often you go',
        x: xs,
        xLabel: 'Visits per month',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Gym cost per visit', values: gym },
          { name: 'Drop-in price', values: ref },
        ],
        markers: marker,
      },
      steps: [
        `Total spent = $${fmt(fee, 2)} × ${months} + $${fmt(joining, 2)} = $${fmt(total, 2)}`,
        `Visits = ${fmt(visits, visits % 1 ? 1 : 0)} × ${months} = ${fmt(visits * months, visits % 1 ? 1 : 0)}`,
        `Cost per visit = $${fmt(total, 2)} ÷ ${fmt(visits * months, visits % 1 ? 1 : 0)} = $${fmt(perVisit, 2)}`,
      ],
    };
  },
  content: {
    formula: [
      'Cost per visit = (monthly fee × months + joining fee) ÷ (visits per month × months)',
      'Break-even visits per month = monthly fee ÷ drop-in price',
      'Saving = drop-in price × visits per month × months − total spent',
    ],
    body: [
      'A gym membership is cheap per visit if you go a lot and expensive if you do not. This calculator divides everything you pay, the monthly fees plus any joining fee, by the number of visits you make, so you can see what each workout really costs.',
      'It then compares that with the drop-in price, which is what a single visit would cost without a membership. If your cost per visit is below the drop-in price, the membership is saving you money. If it is above, paying per visit would be cheaper.',
      'The break-even figure tells you how many visits a month you need for the monthly fee to match drop-in prices. It ignores the joining fee, because that is a one-off cost spread over however long you stay. Everything runs in your browser.',
    ],
    sections: [
      {
        heading: 'Be honest about visits',
        paragraphs: [
          'The most important number here is how often you actually go. Use your real average over the last few months rather than the number you hope to reach. If you are not sure, try a few values and watch the chart: the curve shows how quickly the cost per visit falls as you go more often.',
          'Cost is not the only reason to keep or drop a membership. Convenience, classes, equipment and how likely you are to turn up all matter, and this calculator only covers the money.',
        ],
      },
      {
        heading: 'What the joining fee does',
        paragraphs: [
          'A joining fee is paid once, so it adds the same amount to your total however often you go. The longer you stay, the more thinly it is spread. Switch the months input between 3 and 24 to see the effect.',
        ],
      },
    ],
    faq: [
      { q: 'How do you calculate gym cost per visit?', a: 'Add the monthly fees for the whole period and any joining fee, then divide by the total number of visits. For $60 a month, no joining fee, 12 months and 10 visits a month, that is $720 ÷ 120 = $6.00 per visit.' },
      { q: 'How is the joining fee included?', a: 'It is added once to the total before dividing. With the same $60 a month, 12 months and 10 visits plus a $40 joining fee, the cost is ($720 + $40) ÷ 120 = $6.33 per visit.' },
      { q: 'How many visits a month do I need to break even?', a: 'Divide the monthly fee by the drop-in price. At $60 a month and a $15 drop-in price, that is 4 visits a month. Go more often than that and the membership is cheaper than paying per visit. The joining fee is not included in this figure.' },
      { q: 'What if the gym costs more than drop-in?', a: 'The saving shows as a negative number. At $60 a month, 2 visits a month and a $15 drop-in price over 12 months, each visit costs $30, you spend $720 against $360 at drop-in prices, and the membership costs $360 more.' },
      { q: 'What happens if I enter 0 visits?', a: 'The cost per visit is undefined because you cannot divide by zero. The calculator says so and still shows your total spend, which you would pay with no visits at all.' },
    ],
  },
  related: ['subscription-cost', 'latte-factor', 'weight-loss-goal', 'tdee', 'calories-burned', 'home-gym-payback'],
  examples: [
    // 60 × 12 = 720; 10 × 12 = 120 visits; 720 ÷ 120 = 6. Drop-in 15 × 120 = 1,800; saving 1,080; break-even 60 ÷ 15 = 4.
    { values: { fee: 60, joining: 0, months: 12, visits: 10, dropin: 15 }, expect: { perVisit: 6, total: 720, dropinTotal: 1800, saving: 1080, breakeven: 4 }, tolerance: 1e-9 },
    // (720 + 40) ÷ 120 = 6.3333…; saving 1,800 − 760 = 1,040; break-even unchanged at 4.
    { values: { fee: 60, joining: 40, months: 12, visits: 10, dropin: 15 }, expect: { perVisit: 760 / 120, total: 760, saving: 1040, breakeven: 4 }, tolerance: 1e-9 },
    // 720 ÷ (2 × 12 = 24) = 30; drop-in 12 × 2 × 15 = 360; saving 360 − 720 = −360.
    { values: { fee: 60, joining: 0, months: 12, visits: 2, dropin: 15 }, expect: { perVisit: 30, total: 720, dropinTotal: 360, saving: -360, breakeven: 4 }, tolerance: 1e-9 },
  ],
});
