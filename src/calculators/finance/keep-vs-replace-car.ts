import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default defineCalculator({
  slug: 'keep-vs-replace-car',
  title: 'Keep or Replace Your Car Calculator',
  category: 'finance',
  description: 'Compare a year of repairs and upkeep on your old car with a year of payments, insurance and upkeep on a replacement, and see the repair bill that tips it.',
  keywords: ['keep or replace car', 'repair or replace car calculator', 'is it worth fixing my car', 'old car repairs vs new car payment', 'when to replace a car', 'keep old car vs buy new'],
  updated: '2026-11-22',
  inputs: [
    { id: 'repairs', label: 'Repairs on the old car per year', type: 'number', prefix: '$', default: 2400, min: 0, step: 50, info: 'What you expect to spend on repairs over the next 12 months, based on recent bills and known problems.' },
    { id: 'maintOld', label: 'Maintenance on the old car per year', type: 'number', prefix: '$', default: 600, min: 0, step: 50, info: 'Routine upkeep such as oil changes, tyres and brakes for the car you have.' },
    { id: 'payment', label: 'New car monthly payment', type: 'number', prefix: '$', default: 450, min: 0, step: 10, info: 'The monthly loan or lease payment on the replacement.' },
    { id: 'insurance', label: 'Extra insurance per year on the new car', type: 'number', prefix: '$', default: 300, min: 0, step: 50, info: 'How much more the new car costs to insure each year than the old one. Use 0 if it is the same.' },
    { id: 'maintNew', label: 'Maintenance on the new car per year', type: 'number', prefix: '$', default: 600, min: 0, step: 50, info: 'Routine upkeep for the replacement. A newer car may need less at first.' },
  ],
  outputs: [
    { id: 'difference', label: 'Yearly difference (replace minus keep)', format: 'currency', primary: true, precision: 0, info: 'Replace cost minus keep cost. Positive means replacing costs more per year.' },
    { id: 'keep', label: 'Keep: cost per year', format: 'currency', precision: 0, info: 'Repairs + maintenance on the old car.' },
    { id: 'replace', label: 'Replace: cost per year', format: 'currency', precision: 0, info: '12 × monthly payment + extra insurance + maintenance on the new car.' },
    { id: 'monthly', label: 'Difference per month', format: 'currency', precision: 0, info: 'Yearly difference ÷ 12.' },
    { id: 'breakEven', label: 'Repair bill where replacing breaks even', format: 'currency', precision: 0, info: 'Replace cost minus old-car maintenance. If yearly repairs exceed this, replacing costs less in cash terms.' },
  ],
  compute: (v) => {
    const repairs = num(v.repairs), maintOld = num(v.maintOld), payment = num(v.payment), insurance = num(v.insurance), maintNew = num(v.maintNew);
    if (repairs === null || maintOld === null || payment === null || insurance === null || maintNew === null) return { difference: null };
    if (repairs < 0 || maintOld < 0 || payment < 0 || insurance < 0 || maintNew < 0) return { difference: null };
    const keep = repairs + maintOld;
    const replace = 12 * payment + insurance + maintNew;
    const difference = replace - keep;
    const monthly = difference / 12;
    const breakEven = replace - maintOld;
    const keepWins = difference > 0;
    const tied = difference === 0;
    return {
      difference,
      keep,
      replace,
      monthly,
      breakEven,
      tone: tied ? ('ok' as const) : keepWins ? ('good' as const) : ('warn' as const),
      badge: tied ? 'Costs the same' : keepWins ? 'Keeping costs less' : 'Replacing costs less',
      note: tied
        ? `Both options cost ${usd(keep)} a year in cash.`
        : keepWins
          ? `Keeping the old car costs ${usd(keep)} a year against ${usd(replace)} for replacing it, so keeping saves ${usd(difference)} a year (${usd(monthly)} a month). Repairs would need to reach ${usd(breakEven)} a year before replacing is cheaper. This is a cash view only: it ignores the down payment, trade-in value, reliability and safety.`
          : `Replacing costs ${usd(replace)} a year against ${usd(keep)} for keeping the old car, so replacing saves ${usd(-difference)} a year in cash terms. This ignores the down payment, trade-in value and the new car's loss in value.`,
      chart: {
        type: 'bar',
        title: 'Cash cost per year',
        categories: ['Keep old car', 'Replace'],
        series: [{ name: 'Per year', values: [keep, replace] }],
        format: { format: 'currency' },
        highlight: replace < keep ? 1 : 0,
      },
      steps: [
        `Keep = ${usd(repairs)} + ${usd(maintOld)} = ${usd(keep)}`,
        `Replace = 12 × ${usd(payment)} + ${usd(insurance)} + ${usd(maintNew)} = ${usd(replace)}`,
        `Difference = ${usd(replace)} − ${usd(keep)} = ${usd(difference)} a year`,
        `Break-even repairs = ${usd(replace)} − ${usd(maintOld)} = ${usd(breakEven)}`,
      ],
    };
  },
  content: {
    formula: [
      'Keep per year = repairs + maintenance on the old car',
      'Replace per year = 12 × monthly payment + extra insurance + maintenance on the new car',
      'Difference = replace − keep',
      'Break-even repairs = replace − maintenance on the old car',
    ],
    body: [
      'A big repair bill makes replacing the car feel urgent. This calculator sets a year of repairs and upkeep on your old car against a year of payments, extra insurance and upkeep on a replacement, so you can see the gap in plain dollars.',
      'It also gives a break-even repair bill: the yearly repair spend at which keeping the old car stops being the cheaper option. If your likely repairs are well below that, keeping is cheaper in cash terms. If they are above it, replacing is.',
      'This is a cash view only. It leaves out the down payment, the trade-in value of the old car, how fast the new car loses value, and reliability and safety. The numbers are your own estimates, and everything runs in your browser.',
    ],
    sections: [
      {
        heading: 'What the calculator does not cover',
        paragraphs: [
          'A new car needs money up front, and an old car with an unknown fault can leave you stranded. Neither shows up in the yearly cash figures. If a repair relates to safety, that matters more than the arithmetic.',
          'For the cost of the new car itself, try the car affordability and auto loan calculators.',
        ],
      },
    ],
    faq: [
      { q: 'How is the cost of keeping the old car worked out?', a: 'Add yearly repairs and yearly maintenance. With $2,400 of repairs and $600 of maintenance, keeping costs $3,000 a year.' },
      { q: 'How is the cost of replacing it worked out?', a: 'Multiply the monthly payment by 12, then add the extra insurance and the new car\'s maintenance. With $450 a month, $300 more insurance and $600 maintenance, that is $5,400 + $300 + $600 = $6,300 a year.' },
      { q: 'What does the difference mean?', a: 'It is replace minus keep. In the example, $6,300 − $3,000 = $3,300, so keeping saves $3,300 a year, or $275 a month.' },
      { q: 'What is the break-even repair bill?', a: 'It is the replace cost minus the old car\'s maintenance: $6,300 − $600 = $5,700. Repairs would have to reach $5,700 a year before replacing becomes cheaper in cash terms.' },
      { q: 'Does this include the down payment or trade-in?', a: 'No. It only compares yearly running and payment costs. Add the down payment and trade-in value into your own thinking separately.' },
    ],
  },
  related: ['car-affordability', 'auto-loan', 'car-lease-vs-buy', 'cost-per-use'],
  examples: [
    // keep 2400 + 600 = 3000; replace 12 × 450 = 5400 + 300 + 600 = 6300; diff 3300; monthly 275; break-even 6300 − 600 = 5700.
    { values: { repairs: 2400, maintOld: 600, payment: 450, insurance: 300, maintNew: 600 }, expect: { keep: 3000, replace: 6300, difference: 3300, monthly: 275, breakEven: 5700 }, tolerance: 1e-9 },
    // keep 6000 + 600 = 6600; replace 12 × 300 = 3600 + 0 + 200 = 3800; diff −2800; monthly −233.333; break-even 3800 − 600 = 3200.
    { values: { repairs: 6000, maintOld: 600, payment: 300, insurance: 0, maintNew: 200 }, expect: { keep: 6600, replace: 3800, difference: -2800, monthly: -2800 / 12, breakEven: 3200 }, tolerance: 1e-9 },
  ],
});
