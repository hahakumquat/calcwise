import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'pay-cut-tradeoff',
  title: 'Four-Day Week Pay Cut Calculator',
  seoTitle: 'Four-Day Week Pay Cut Calculator',
  metaDescription: 'Work fewer hours for less pay? See your new hourly rate, what you give up each year and what each free hour really costs, plus the break-even pay cut.',
  updated: '2026-11-22',
  category: 'finance',
  description: 'See what a free day costs: new hourly pay, yearly pay lost and the price of each hour you get back.',
  keywords: ['four day week pay cut calculator', 'reduced hours pay calculator', 'is a pay cut for a day off worth it', 'cost of a day off', 'work fewer hours less pay', '32 hour work week pay'],
  popular: false,
  inputs: [
    { id: 'salary', label: 'Current yearly pay', type: 'number', prefix: '$', default: 80000, min: 0, step: 1000, info: 'Gross pay before tax, for the hours you work now.' },
    { id: 'hours', label: 'Hours per week now', type: 'number', suffix: 'h', default: 40, min: 1, max: 100, step: 1, info: 'The hours you are paid for today.' },
    { id: 'newHours', label: 'Hours per week offered', type: 'number', suffix: 'h', default: 32, min: 0, max: 100, step: 1, info: 'The shorter week, for example 32 hours for four days.' },
    { id: 'cut', label: 'Pay cut', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, info: 'How much the yearly pay drops. Enter 0 if pay stays the same.' },
    { id: 'weeks', label: 'Working weeks per year', type: 'number', default: 52, min: 1, max: 52, step: 1, info: 'Use 52 if you are paid for every week, or fewer if you take unpaid time.' },
  ],
  outputs: [
    { id: 'perHour', label: 'Cost of each free hour', format: 'currency', precision: 2, primary: true, info: 'Yearly pay lost ÷ hours you no longer work in a year.' },
    { id: 'newHourly', label: 'Hourly pay after the change', format: 'currency', precision: 2, info: 'New yearly pay ÷ (new hours × weeks).' },
    { id: 'oldHourly', label: 'Hourly pay now', format: 'currency', precision: 2, info: 'Current yearly pay ÷ (current hours × weeks).' },
    { id: 'hourlyChange', label: 'Change in hourly pay', format: 'percent', precision: 1, info: 'New hourly pay compared with today. Positive means each hour you work pays more.' },
    { id: 'lostYear', label: 'Pay lost per year', format: 'currency', precision: 0, info: 'Current yearly pay minus new yearly pay (gross).' },
    { id: 'lostMonth', label: 'Pay lost per month', format: 'currency', precision: 2, info: 'Yearly pay lost ÷ 12 (gross).' },
    { id: 'hoursGained', label: 'Hours back per year', format: 'number', precision: 0, suffix: 'h', info: '(Hours now − new hours) × weeks.' },
    { id: 'breakEven', label: 'Break-even pay cut', format: 'percent', precision: 1, info: 'The cut at which your hourly pay stays the same: 1 − new hours ÷ current hours.' },
  ],
  compute: (v) => {
    const salary = num(v.salary);
    const h = num(v.hours);
    const nh = num(v.newHours);
    const cutPct = num(v.cut);
    const weeks = num(v.weeks);
    if (salary === null || h === null || nh === null || cutPct === null || weeks === null) return { perHour: null };
    if (salary <= 0) return { perHour: null, error: 'Enter a yearly pay above $0.' };
    if (h <= 0 || weeks <= 0) return { perHour: null, error: 'Hours and weeks must be above 0.' };
    if (nh <= 0) return { perHour: null, error: 'Enter new weekly hours above 0.' };
    if (nh >= h) return { perHour: null, error: 'The new week must be shorter than your current one.' };
    if (cutPct < 0 || cutPct >= 100) return { perHour: null, error: 'Pay cut must be at least 0% and below 100%.' };

    const newPay = salary * (1 - cutPct / 100);
    const oldHourly = salary / (h * weeks);
    const newHourly = newPay / (nh * weeks);
    const lostYear = salary - newPay;
    const hoursGained = (h - nh) * weeks;
    const perHour = lostYear / hoursGained;
    const hourlyChange = newHourly / oldHourly - 1;
    const breakEven = 1 - nh / h;

    const cuts = [0, 5, 10, 15, 20, 25];
    const idx = cuts.indexOf(cutPct);
    const tone = hourlyChange >= 0 ? 'good' : hourlyChange > -0.1 ? 'ok' : 'warn';
    const badge = lostYear === 0 ? 'Free time at no cost' : hourlyChange >= 0 ? 'Each hour you work pays as much or more' : 'Each hour you work pays less';
    return {
      perHour,
      newHourly,
      oldHourly,
      hourlyChange,
      lostYear,
      lostMonth: lostYear / 12,
      hoursGained,
      breakEven,
      tone,
      badge,
      chart: {
        type: 'bar',
        title: 'Hourly pay after the change, by size of pay cut',
        categories: cuts.map((c) => `${c}% cut`),
        series: [{ name: 'Hourly pay', values: cuts.map((c) => +((salary * (1 - c / 100)) / (nh * weeks)).toFixed(2)) }],
        format: CURRENCY,
        highlight: idx >= 0 ? idx : undefined,
      },
      steps: [
        `Hourly pay now = ${money(salary, 0)} ÷ (${h} × ${weeks}) = ${money(oldHourly)}`,
        `New yearly pay = ${money(salary, 0)} × (1 − ${cutPct}%) = ${money(newPay, 0)}; new hourly = ${money(newPay, 0)} ÷ (${nh} × ${weeks}) = ${money(newHourly)}`,
        `Hours back = (${h} − ${nh}) × ${weeks} = ${hoursGained}; cost per free hour = ${money(lostYear, 0)} ÷ ${hoursGained} = ${money(perHour)}`,
      ],
      note: `Going from ${h} to ${nh} hours with a ${cutPct}% cut gives up ${money(lostYear, 0)} a year before tax for ${hoursGained} hours. Any cut below ${+(breakEven * 100).toFixed(1)}% leaves your hourly pay higher than today.`,
    };
  },
  content: {
    formula: [
      'Hourly pay = yearly pay ÷ (hours per week × working weeks)',
      'Pay lost = current yearly pay × pay cut',
      'Cost per free hour = pay lost ÷ ((hours now − new hours) × weeks)',
      'Break-even pay cut = 1 − new hours ÷ hours now',
    ],
    body: [
      'A shorter week usually comes with a question: is the day off worth the pay? This calculator turns it into numbers. It compares your hourly pay before and after, and tells you what each hour you get back costs.',
      'For $80,000 a year going from 40 to 32 hours with a 10% cut, your yearly pay drops to $72,000. Your hourly pay rises from $38.46 to $43.27, you give up $8,000 a year ($666.67 a month) and you get back 416 hours, so each free hour costs $19.23.',
    ],
    sections: [
      {
        heading: 'The break-even cut',
        paragraphs: [
          'Dropping from 40 to 32 hours removes 20% of your hours. If pay falls by exactly 20%, your hourly rate stays the same. A smaller cut means you are paid more per hour worked, and a free hour costs less than your current hourly rate. A bigger cut means each hour you still work pays less.',
          'The figures are gross and do not model tax, benefits, overtime or what you would do with the extra time. Tax usually takes a smaller bite from a lower income, so the take-home drop is often a little smaller than the gross drop.',
        ],
      },
    ],
    faq: [
      { q: 'Is a pay cut for a four-day week worth it?', a: 'Compare the cost per free hour with what your time is worth to you. At $80,000, 40 to 32 hours and a 10% cut, each free hour costs $19.23, about half your current $38.46 hourly pay. At a 20% cut each free hour costs $38.46.' },
      { q: 'What pay cut keeps my hourly rate the same?', a: 'One minus new hours divided by current hours. Going from 40 to 32 hours gives 1 − 32 ÷ 40 = 20%.' },
      { q: 'Does this include tax and benefits?', a: 'No. All figures are gross. Employer benefits, retirement matching and tax brackets can change the real take-home difference.' },
      { q: 'What if my pay stays the same?', a: 'Enter 0% for the pay cut. Your hourly pay rises by the ratio of old to new hours (25% for 40 to 32) and each free hour costs nothing.' },
    ],
    sources: [{ label: 'Hourly pay = pay ÷ hours worked; all inputs are your own figures' }],
  },
  related: ['salary-to-hourly', 'real-hourly-wage', 'take-home-pay', 'percentage-change'],
  examples: [
    // new pay 72000; old hourly 80000/2080 = 38.461538; new hourly 72000/1664 = 43.269231; change 0.125; lost 8000; month 666.6667; hours 416; per hour 19.230769; breakEven 0.2
    { values: { salary: 80000, hours: 40, newHours: 32, cut: 10, weeks: 52 }, expect: { oldHourly: 38.461538, newHourly: 43.269231, hourlyChange: 0.125, lostYear: 8000, lostMonth: 666.666667, hoursGained: 416, perHour: 19.230769, breakEven: 0.2 }, tolerance: 1e-4 },
    // 20% cut: new pay 64000 / 1664 = 38.461538, change 0, per hour 16000/416 = 38.461538
    { values: { salary: 80000, hours: 40, newHours: 32, cut: 20, weeks: 52 }, expect: { newHourly: 38.461538, hourlyChange: 0, lostYear: 16000, perHour: 38.461538 }, tolerance: 1e-4 },
  ],
});
