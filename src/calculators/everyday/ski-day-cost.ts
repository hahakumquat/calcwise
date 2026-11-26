import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'ski-day-cost',
  title: 'Ski Day Cost Calculator',
  category: 'everyday',
  description: 'Add up lift ticket, rental, lesson, travel and food to see what a ski day costs, the cost of the whole trip, and the price per hour on snow and per run.',
  keywords: ['ski day cost', 'how much does a day of skiing cost', 'cost per hour skiing', 'ski trip cost calculator', 'lift ticket and rental cost'],
  updated: '2026-11-26',
  inputs: [
    { id: 'ticket', label: 'Lift ticket', type: 'number', prefix: '$', default: 120, min: 0, step: 5, info: 'Price of one day lift ticket per person.' },
    { id: 'rental', label: 'Equipment rental', type: 'number', prefix: '$', default: 50, min: 0, step: 5, info: 'Skis or board, boots and poles for one day. Use 0 if you own them.' },
    { id: 'lesson', label: 'Lesson', type: 'number', prefix: '$', default: 0, min: 0, step: 5, info: 'Cost of a lesson per day. Use 0 for none.' },
    { id: 'travel', label: 'Travel and parking', type: 'number', prefix: '$', default: 40, min: 0, step: 5, info: 'Fuel, shuttle, tolls and parking for the day.' },
    { id: 'food', label: 'Food and drink', type: 'number', prefix: '$', default: 25, min: 0, step: 5, info: 'Lunch, snacks and drinks on the mountain.' },
    { id: 'hours', label: 'Hours on snow per day', type: 'number', suffix: 'h', default: 5, min: 0.5, max: 24, step: 0.5, info: 'Time actually skiing, not counting the drive or the lodge.' },
    { id: 'days', label: 'Days', type: 'number', default: 4, min: 1, max: 365, step: 1, info: 'Number of ski days in the trip.' },
    { id: 'runs', label: 'Runs per day', type: 'number', default: 12, min: 1, step: 1, optional: true, info: 'Optional. Leave blank to skip the cost per run.' },
  ],
  outputs: [
    { id: 'perDay', label: 'Cost per ski day', format: 'currency', primary: true, info: 'Lift ticket + rental + lesson + travel + food.' },
    { id: 'trip', label: 'Trip total', format: 'currency', info: 'Cost per day × days.' },
    { id: 'perHour', label: 'Cost per hour on snow', format: 'currency', info: 'Cost per day ÷ hours on snow.' },
    { id: 'perRun', label: 'Cost per run', format: 'currency', info: 'Cost per day ÷ runs per day. Shown only if you enter runs.' },
  ],
  compute: (v) => {
    const t = num(v.ticket), r = num(v.rental), l = num(v.lesson), tr = num(v.travel), f = num(v.food);
    const hours = num(v.hours), days = num(v.days), runs = num(v.runs);
    if ([t, r, l, tr, f, hours, days].some((x) => x === null)) return { perDay: null };
    if ([t, r, l, tr, f].some((x) => (x as number) < 0) || (hours as number) <= 0 || (days as number) < 1) return { perDay: null };
    const perDay = (t as number) + (r as number) + (l as number) + (tr as number) + (f as number);
    const trip = perDay * (days as number);
    const perHour = perDay / (hours as number);
    const hasRuns = runs !== null && runs > 0;
    const perRun = hasRuns ? perDay / (runs as number) : null;
    return {
      perDay,
      trip,
      perHour,
      perRun,
      tone: 'ok',
      badge: `${money(perHour)} an hour`,
      note: `${money(trip)} for ${fmt(days as number, 0)} days. Prices are what you enter, so check them against the resort's current rates. If you ski often, compare a season pass in the season pass break-even calculator.`,
      chart: {
        type: 'donut' as const,
        title: 'Where a ski day goes',
        slices: [
          { label: 'Lift ticket', value: t as number },
          { label: 'Rental', value: r as number },
          { label: 'Lesson', value: l as number },
          { label: 'Travel and parking', value: tr as number },
          { label: 'Food and drink', value: f as number },
        ].filter((s) => s.value > 0),
        format: CURRENCY,
        centerLabel: 'per day',
        centerValue: money(perDay),
      },
      steps: [
        `Per day: ${money(t as number)} + ${money(r as number)} + ${money(l as number)} + ${money(tr as number)} + ${money(f as number)} = ${money(perDay)}`,
        `Trip: ${money(perDay)} × ${fmt(days as number, 0)} = ${money(trip)}`,
        `Per hour: ${money(perDay)} ÷ ${fmt(hours as number)} h = ${money(perHour)}`,
        ...(perRun !== null ? [`Per run: ${money(perDay)} ÷ ${fmt(runs as number, 0)} = ${money(perRun)}`] : []),
      ],
    };
  },
  content: {
    formula: [
      'Cost per day = lift ticket + rental + lesson + travel and parking + food',
      'Trip total = cost per day × days',
      'Cost per hour = cost per day ÷ hours on snow',
      'Cost per run = cost per day ÷ runs per day',
    ],
    body: [
      'The lift ticket is only part of a ski day. Rental, a lesson, the drive and lunch can add as much again. Enter each line for one person for one day to see the true cost per day, the trip total and what each hour on snow costs.',
      'Hours on snow and runs are there so you can compare days: a short day with a long drive costs far more per hour than a full day. Every price is your own input, so use the resort and rental shop rates you were quoted.',
      'If you ski many days a year, a season pass may be cheaper than day tickets. Compare it in the season pass break-even calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much does a ski day cost?', a: 'With the defaults, $120 for the lift ticket, $50 rental, no lesson, $40 travel and $25 food add up to $235 a day. Your own prices will differ by resort and season.' },
      { q: 'What does a 4-day trip cost?', a: '$235 a day × 4 days is $940 for one person. Lodging is not included.' },
      { q: 'What is the cost per hour on snow?', a: 'Divide the day by your hours skiing. $235 ÷ 5 hours is $47.00 an hour, and over 12 runs it is $19.58 a run. A second case of $220 a day over 4 hours is $55.00 an hour.' },
      { q: 'Should I buy a season pass?', a: 'It depends on how many days you ski. Compare your cost per day here with the pass price in the season pass break-even calculator.' },
    ],
    sources: [],
  },
  related: ['trip-budget', 'season-pass-break-even', 'gas-cost'],
  examples: [
    // per day = 120+50+0+40+25 = 235; trip = 235*4 = 940; per hour = 235/5 = 47; per run = 235/12 = 19.58333...
    { values: { ticket: 120, rental: 50, lesson: 0, travel: 40, food: 25, hours: 5, days: 4, runs: 12 }, expect: { perDay: 235, trip: 940, perHour: 47, perRun: 19.583333333333332 }, tolerance: 1e-9 },
    // per day = 90+0+80+30+20 = 220; trip = 220*3 = 660; per hour = 220/4 = 55; per run = 220/10 = 22
    { values: { ticket: 90, rental: 0, lesson: 80, travel: 30, food: 20, hours: 4, days: 3, runs: 10 }, expect: { perDay: 220, trip: 660, perHour: 55, perRun: 22 }, tolerance: 1e-9 },
  ],
});
