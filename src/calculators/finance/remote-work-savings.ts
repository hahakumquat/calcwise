import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'remote-work-savings',
  title: 'Remote Work Savings Calculator',
  category: 'finance',
  description: 'Estimate what working from home saves each year in commute, parking, lunch and coffee, minus extra home costs, plus the commute hours you get back.',
  keywords: ['remote work savings calculator', 'work from home savings', 'cost of commuting per year', 'return to office cost', 'wfh vs office cost', 'hybrid work savings'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'days', label: 'Office days replaced per week', type: 'number', default: 3, min: 0, max: 7, step: 0.5, suffix: 'days', info: 'How many days a week you work from home instead of commuting.' },
    { id: 'miles', label: 'Round-trip commute', type: 'number', default: 20, min: 0, step: 1, suffix: 'miles', info: 'Miles driven there and back. Use 0 if you do not drive.' },
    { id: 'rate', label: 'Cost per mile', type: 'number', prefix: '$', default: 0.3, min: 0, step: 0.01, info: 'Your own estimate of fuel plus wear per mile. Not assumed for you.' },
    { id: 'parking', label: 'Parking, tolls and transit fares per day', type: 'number', prefix: '$', default: 8, min: 0, step: 0.5, optional: true, info: 'Daily parking, tolls or fares.' },
    { id: 'lunch', label: 'Extra lunch and coffee per day', type: 'number', prefix: '$', default: 12, min: 0, step: 0.5, optional: true, info: 'What you spend at the office beyond what you would spend at home.' },
    { id: 'minutes', label: 'Round-trip commute time', type: 'number', default: 60, min: 0, step: 5, suffix: 'minutes', optional: true, info: 'Door to door, both ways.' },
    { id: 'weeks', label: 'Work weeks per year', type: 'number', default: 48, min: 1, max: 52, step: 1, suffix: 'weeks', info: 'Weeks you work, after holidays and leave.' },
    { id: 'home', label: 'Extra home cost per month', type: 'number', prefix: '$', default: 40, min: 0, step: 5, optional: true, info: 'Extra electricity, heating, internet and similar. Leave blank for none.' },
  ],
  outputs: [
    { id: 'net', label: 'Net savings per year', format: 'currency', precision: 2, primary: true, info: 'Gross savings minus extra home costs for 12 months.' },
    { id: 'perDay', label: 'Saved per home day', format: 'currency', precision: 2, info: 'Miles × rate + parking + lunch.' },
    { id: 'gross', label: 'Gross savings per year', format: 'currency', precision: 2, info: 'Per day × days per week × work weeks.' },
    { id: 'hours', label: 'Commute hours back per year', format: 'number', precision: 1, suffix: 'hours', info: 'Minutes × days × weeks ÷ 60.' },
  ],
  compute: (v) => {
    const days = num(v.days);
    const miles = num(v.miles);
    const rate = num(v.rate);
    const parking = num(v.parking) ?? 0;
    const lunch = num(v.lunch) ?? 0;
    const minutes = num(v.minutes) ?? 0;
    const weeks = num(v.weeks);
    const home = num(v.home) ?? 0;
    if (days === null || miles === null || rate === null || weeks === null) return { net: null };
    if (days < 0 || miles < 0 || rate < 0 || parking < 0 || lunch < 0 || minutes < 0 || weeks <= 0 || home < 0) return { net: null };
    const perDay = miles * rate + parking + lunch;
    const gross = perDay * days * weeks;
    const homeYear = home * 12;
    const net = gross - homeYear;
    const hours = (minutes * days * weeks) / 60;
    return {
      net,
      perDay,
      gross,
      hours,
      tone: net >= 0 ? 'good' : 'bad',
      badge: `${money(net)} a year`,
      note: `Each home day saves ${money(perDay)}. Over ${fmt(days)} days a week for ${fmt(weeks, 0)} weeks that is ${money(gross)}, or ${money(net)} after ${money(homeYear)} of extra home costs, and you get back ${fmt(hours)} hours of commuting.`,
      chart: net >= 0
        ? {
            type: 'donut',
            title: 'Where the savings come from',
            slices: [
              { label: 'Commute', value: miles * rate * days * weeks },
              { label: 'Parking and fares', value: parking * days * weeks },
              { label: 'Lunch and coffee', value: lunch * days * weeks },
            ].filter((s) => s.value > 0),
            format: { format: 'currency', precision: 2 },
            centerLabel: 'Gross',
            centerValue: money(gross),
          }
        : undefined,
      steps: [
        `Per day = ${fmt(miles)} × ${money(rate)} + ${money(parking)} + ${money(lunch)} = ${money(perDay)}`,
        `Gross = ${money(perDay)} × ${fmt(days)} × ${fmt(weeks, 0)} = ${money(gross)}`,
        `Net = ${money(gross)} − ${money(home)} × 12 = ${money(net)}`,
        `Hours = ${fmt(minutes, 0)} × ${fmt(days)} × ${fmt(weeks, 0)} ÷ 60 = ${fmt(hours)}`,
      ],
    };
  },
  content: {
    formula: [
      'Saved per day = miles × cost per mile + parking + lunch',
      'Gross per year = saved per day × days per week × work weeks',
      'Net per year = gross − extra home cost × 12',
      'Hours back = commute minutes × days × weeks ÷ 60',
    ],
    body: [
      'Working from home changes what you spend, not only where you sit. Every office day has a commute, parking or fares, and a lunch or coffee you would not buy at home, while home days add some electricity, heating and internet. This calculator nets them out and counts the hours you stop spending in transit.',
      'Example: 3 home days a week, a 20-mile round trip at $0.30 a mile, $8 parking and $12 lunch and coffee. That is $6 + $8 + $12 = $26 a day. Over 48 weeks, $26 × 3 × 48 = $3,744. After $40 a month of extra home costs ($480), net savings are $3,264, and a 60-minute commute returns 144 hours.',
      'Your cost per mile and other figures are your own estimates, so none are assumed. Use the gas cost calculator to price your fuel. Salary, taxes and any commuter benefits are not included. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does working from home save?', a: 'Multiply what each office day costs (commute, parking, lunch) by days at home and work weeks, then subtract extra home costs. The example comes to $3,264 a year.' },
      { q: 'How many hours does working from home save?', a: 'Commute minutes × home days per week × work weeks ÷ 60. A 60-minute round trip, 3 days, 48 weeks is 144 hours.' },
      { q: 'What cost per mile should I use?', a: 'Use your own estimate of fuel plus wear. The calculator does not assume a rate; $0.30 in the example is only an illustration.' },
      { q: 'Does this include taxes or salary changes?', a: 'No. It covers only the costs you enter. Pay changes, taxes and commuter benefits are not included.' },
    ],
    sources: [],
  },
  related: ['commute-cost', 'gas-cost', 'eating-out-cost', 'hours-of-work-cost', 'lifestyle-creep'],
  examples: [
    // per day 20*.3+8+12 = 26; gross 26*3*48 = 3744; net 3744-480 = 3264; hours 60*3*48/60 = 144
    { values: { days: 3, miles: 20, rate: 0.3, parking: 8, lunch: 12, minutes: 60, weeks: 48, home: 40 }, expect: { perDay: 26, gross: 3744, net: 3264, hours: 144 }, tolerance: 1e-6 },
    // per day 10*0.5 = 5; gross 5*5*50 = 1250; net 1250; hours 0
    { values: { days: 5, miles: 10, rate: 0.5, weeks: 50 }, expect: { perDay: 5, gross: 1250, net: 1250, hours: 0 }, tolerance: 1e-6 },
  ],
});
