import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'savings-challenge',
  title: 'Savings Challenge Calculator',
  category: 'finance',
  description: 'Work out what the 52-week savings challenge adds up to. Set your starting deposit, weekly change and weeks to see the total, final week and a growth chart.',
  keywords: ['52 week savings challenge', 'savings challenge calculator', 'weekly savings challenge', '52 week money challenge', 'reverse savings challenge', 'incremental savings plan'],
  updated: '2026-11-16',
  popular: false,
  inputs: [
    { id: 'start', label: 'Starting weekly deposit', type: 'number', prefix: '$', default: 1, min: 0, step: 1, info: 'What you save in week 1. The classic challenge starts at $1.' },
    { id: 'step', label: 'Weekly change', type: 'number', prefix: '$', default: 1, min: 0, step: 1, info: 'How much the deposit goes up or down each week. The classic challenge adds $1 every week.' },
    { id: 'weeks', label: 'Number of weeks', type: 'number', default: 52, min: 1, max: 260, step: 1, info: 'How many weekly deposits you will make. 52 weeks is one year.' },
    {
      id: 'direction',
      label: 'Direction',
      type: 'select',
      default: 'increase',
      options: [
        { value: 'increase', label: 'Increase each week' },
        { value: 'decrease', label: 'Decrease each week' },
      ],
      info: 'Increase starts small and grows. Decrease starts big and shrinks, so the hardest weeks come first.',
    },
  ],
  outputs: [
    { id: 'total', label: 'Total saved', format: 'currency', primary: true, info: 'The sum of every weekly deposit. It does not include any interest.' },
    { id: 'finalDeposit', label: 'Final week deposit', format: 'currency', info: 'What you put in during the last week: the start plus or minus the change, repeated for every week after the first.' },
    { id: 'average', label: 'Average weekly deposit', format: 'currency', info: 'Total saved divided by the number of weeks.' },
  ],
  compute: (v) => {
    const a = num(v.start);
    const step = num(v.step);
    const wRaw = num(v.weeks);
    if (a === null || step === null || wRaw === null || a < 0 || step < 0 || wRaw < 1) return { total: null };
    const n = Math.floor(wRaw);
    if (n > 260) return { total: null, error: 'Choose 260 weeks or fewer.' };
    const dec = v.direction === 'decrease';
    const d = dec ? -step : step;
    const last = a + (n - 1) * d;
    if (last < 0) {
      return { total: null, error: `The deposit would drop below $0 before week ${n}. Lower the weekly change or the number of weeks.` };
    }
    const total = (n / 2) * (2 * a + (n - 1) * d);
    const average = total / n;

    const x: number[] = [];
    const cum: number[] = [];
    let run = 0;
    for (let k = 0; k <= n; k++) {
      if (k > 0) run += a + (k - 1) * d;
      x.push(k);
      cum.push(run);
    }

    const tone: 'good' | 'ok' = total > 0 ? 'good' : 'ok';
    const badge = total > 0 ? `${money(total, 0)} saved in ${n} week${n === 1 ? '' : 's'}` : 'Nothing saved yet';
    const dirWord = dec ? 'falls' : 'rises';
    const note = `Your deposit ${step === 0 ? 'stays at' : dirWord + ' from'} ${money(a)}${step === 0 ? '' : ` to ${money(last)}`} over ${n} week${n === 1 ? '' : 's'}, saving ${money(total)} in total. This is plain saving with no interest.`;

    return {
      total,
      finalDeposit: last,
      average,
      tone,
      badge,
      chart: {
        type: 'area',
        title: 'Total saved by week',
        x,
        xLabel: 'Week',
        xFormat: { format: 'integer' },
        yFormat: { format: 'currency' },
        series: [{ name: 'Total saved', values: cum }],
      },
      steps: [
        `Final week deposit = ${money(a)} ${dec ? '−' : '+'} (${n} − 1) × ${money(step)} = ${money(last)}`,
        `Total = ${n} ÷ 2 × (2 × ${money(a)} ${dec ? '−' : '+'} (${n} − 1) × ${money(step)}) = ${money(total)}`,
        `Average = ${money(total)} ÷ ${n} = ${money(average)}`,
      ],
      note,
    };
  },
  content: {
    formula: [
      'Deposit in week k = start + (k − 1) × change (increase), or start − (k − 1) × change (decrease)',
      'Total saved = n ÷ 2 × (2 × start + (n − 1) × d), where d is the change (negative when decreasing)',
      'Average deposit = total saved ÷ n',
    ],
    body: [
      'A savings challenge is a simple habit: you put away a small amount in week one and change it by a fixed amount each week. The best known version is the 52-week challenge. You save $1 in week 1, $2 in week 2, and so on up to $52 in week 52, which adds up to $1,378.',
      'The total is an arithmetic series, so there is no need to add up every week by hand. Multiply the number of weeks by the average of the first and last deposits. For the classic challenge that is 52 × (1 + 52) ÷ 2 = $1,378. Scale the start and change by 5 and you get 5 times as much, $6,890.',
      'You can also run it in reverse. Start at $52 and drop by $1 a week and you save the same $1,378, but the biggest deposits come first, while your motivation is high. The increasing version feels easy early on and gets harder just when you may be tired of it, so pick whichever suits you.',
      'This calculator counts deposits only. It is interest-free, so if you keep the money in an account that pays interest, you will end up with slightly more. If the deposit would fall below $0 before your last week, the calculator asks you to lower the change or the number of weeks.',
    ],
    faq: [
      { q: 'How much does the 52-week challenge save?', a: 'Starting at $1 and adding $1 each week for 52 weeks saves $1,378. The final week deposit is $52, and the average deposit is $26.50 a week.' },
      { q: 'What if I start at $5 and add $5 a week?', a: 'Everything is 5 times bigger, so 52 weeks saves $6,890. The last deposit is $260 and the average is $132.50 a week.' },
      { q: 'What is the reverse savings challenge?', a: 'You start with the biggest deposit and lower it each week. Starting at $52 and dropping $1 a week for 52 weeks saves $1,378, the same as the classic version, and the final deposit is $1.' },
      { q: 'Does this include interest?', a: 'No. The total is only the money you deposit. Interest from a savings account would add a little on top.' },
      { q: 'Why do I get an error when I choose decrease?', a: 'Each week the deposit falls by your weekly change. If it would go below $0 before the last week, the plan cannot work, so lower the weekly change or the number of weeks. For example, starting at $10 and dropping $2 a week works for up to 6 weeks.' },
    ],
    sources: [
      { label: 'CFPB: Budgeting and saving tools', url: 'https://www.consumerfinance.gov/consumer-tools/' },
      { label: 'Arithmetic progression (sum formula)', url: 'https://en.wikipedia.org/wiki/Arithmetic_progression' },
    ],
  },
  related: ['savings-goal', 'gift-budget', 'compound-interest', 'emergency-fund', 'subscription-cost'],
  examples: [
    {
      // n/2 × (2a + (n−1)d) = 26 × (2 + 51) = 26 × 53 = 1,378; final 1 + 51 = 52; average 1,378 ÷ 52 = 26.5.
      values: { start: 1, step: 1, weeks: 52, direction: 'increase' },
      expect: { total: 1378, finalDeposit: 52, average: 26.5 },
    },
    {
      // Everything scales by 5: 26 × (10 + 255) = 26 × 265 = 6,890; final 5 + 255 = 260; average 132.5.
      values: { start: 5, step: 5, weeks: 52, direction: 'increase' },
      expect: { total: 6890, finalDeposit: 260, average: 132.5 },
    },
    {
      // d = −1: 26 × (104 − 51) = 26 × 53 = 1,378; final 52 − 51 = 1; average 26.5.
      values: { start: 52, step: 1, weeks: 52, direction: 'decrease' },
      expect: { total: 1378, finalDeposit: 1, average: 26.5 },
    },
    {
      // 10 ÷ 2 × (4 + 9 × 3) = 5 × 31 = 155; final 2 + 27 = 29; average 15.5.
      values: { start: 2, step: 3, weeks: 10, direction: 'increase' },
      expect: { total: 155, finalDeposit: 29, average: 15.5 },
    },
  ],
});
