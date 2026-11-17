import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'real-hourly-wage',
  title: 'Real Hourly Wage Calculator',
  category: 'everyday',
  description: 'Find what your job really pays per hour once you count the commute, unpaid prep time and the money you spend just to go to work.',
  keywords: ['real hourly wage calculator', 'true hourly wage', 'what is my real hourly rate', 'hourly rate after commute', 'is my job worth it', 'cost of working'],
  updated: '2026-11-17',
  inputs: [
    { id: 'pay', label: 'Yearly take-home pay', type: 'number', prefix: '$', default: 52000, min: 0, step: 500, info: 'Pay after tax and payroll deductions, per year. Use take-home pay so the result is money you can actually spend.' },
    { id: 'hours', label: 'Paid hours per week', type: 'number', suffix: 'h', default: 40, min: 0, max: 168, step: 0.5, info: 'The hours you are paid for each week.' },
    { id: 'weeks', label: 'Weeks worked per year', type: 'number', default: 50, min: 1, max: 52, step: 1, info: 'Weeks you work. 50 leaves two weeks of unpaid time off; use 52 if all your leave is paid.' },
    { id: 'days', label: 'Commute days per week', type: 'number', default: 5, min: 0, max: 7, step: 1, info: 'How many days a week you travel to work.' },
    { id: 'minutes', label: 'Round-trip commute', type: 'number', suffix: 'min', default: 60, min: 0, step: 5, info: 'Minutes door to door for the trip there and back, per commute day.' },
    { id: 'extra', label: 'Unpaid work time per week', type: 'number', suffix: 'h', optional: true, min: 0, step: 0.5, info: 'Getting ready, unpaid breaks, work emails after hours. Leave blank for none.' },
    { id: 'costs', label: 'Work-related costs per year', type: 'number', prefix: '$', optional: true, min: 0, step: 100, info: 'Fuel, parking, transit, work clothes, lunches bought because of work, childcare you need only because you work. Leave blank for none.' },
  ],
  outputs: [
    { id: 'real', label: 'Real hourly wage', format: 'currency', primary: true, info: '(Yearly take-home pay − work-related costs) ÷ all hours your job takes, including commute and unpaid time.' },
    { id: 'stated', label: 'Paid hourly wage', format: 'currency', info: 'Yearly take-home pay ÷ paid hours only.' },
    { id: 'drop', label: 'Lower than the paid rate', format: 'percent', precision: 1, info: 'How much smaller the real wage is than the paid rate.' },
    { id: 'weekHours', label: 'Hours your job takes per week', format: 'number', precision: 1, suffix: 'h', info: 'Paid hours + commute + unpaid time.' },
    { id: 'yearHours', label: 'Hours your job takes per year', format: 'number', precision: 0, suffix: 'h', info: 'Weekly total × weeks worked.' },
  ],
  compute: (v) => {
    const pay = num(v.pay);
    const hours = num(v.hours);
    const weeks = num(v.weeks);
    const days = num(v.days);
    const mins = num(v.minutes);
    const extra = num(v.extra) ?? 0;
    const costs = num(v.costs) ?? 0;
    if (pay === null || hours === null || weeks === null || days === null || mins === null) return { real: null };
    if (pay < 0 || hours < 0 || weeks <= 0 || days < 0 || mins < 0 || extra < 0 || costs < 0) return { real: null, error: 'Values cannot be negative, and weeks worked must be above 0.' };
    const commuteWeek = (days * mins) / 60;
    const weekHours = hours + commuteWeek + extra;
    const yearHours = weekHours * weeks;
    const paidYear = hours * weeks;
    if (paidYear <= 0) return { real: null, error: 'Enter some paid hours to compare.' };
    const stated = pay / paidYear;
    const real = (pay - costs) / yearHours;
    const drop = 1 - real / stated;
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Hourly wage: paid vs real',
      categories: ['Paid rate', 'Real rate'],
      series: [{ name: 'Per hour', values: [stated, Math.max(real, 0)] }],
      format: { format: 'currency' },
      highlight: 1,
    };
    return {
      real,
      stated,
      drop,
      weekHours,
      yearHours,
      tone: drop < 0.1 ? 'good' : drop < 0.25 ? 'ok' : 'warn',
      badge: drop < 0.005 ? 'No hidden cost' : `Real wage ${Math.round(drop * 100)}% lower`,
      chart,
      note: 'This is a way to compare jobs and work-from-home options, not a verdict on whether a job is worth it. Pay is only part of why people work.',
      steps: [
        `Paid rate = ${money(pay, 0)} ÷ (${hours} h × ${weeks} weeks) = ${money(stated)}.`,
        `Commute = ${days} days × ${mins} min ÷ 60 = ${+commuteWeek.toFixed(2)} h a week; job takes ${+weekHours.toFixed(2)} h a week.`,
        `Real rate = (${money(pay, 0)} − ${money(costs, 0)}) ÷ (${+weekHours.toFixed(2)} h × ${weeks} weeks) = ${money(real)}.`,
      ],
    };
  },
  content: {
    formula: [
      'Paid rate = take-home pay ÷ (paid hours per week × weeks)',
      'Job hours per week = paid hours + commute days × round-trip minutes ÷ 60 + unpaid hours',
      'Real rate = (take-home pay − work-related costs) ÷ (job hours per week × weeks)',
    ],
    body: [
      'Your hourly wage on paper counts only the hours you are paid for. The real cost of a job also includes the time you spend getting there and the money you spend to be there. This calculator adds both and shows what you earn for every hour the job takes from your life.',
      'The idea comes from the book Your Money or Your Life by Vicki Robin and Joe Dominguez, which suggests tracking your "real hourly wage" after job-related costs and time. Here the method is kept simple: take-home pay minus costs, divided by all the hours.',
      'Use it to compare a closer job with a higher-paid one, or an office day with a work-from-home day. Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'Take-home pay of $52,000 for 40 paid hours over 50 weeks is $52,000 ÷ 2,000 h = $26.00 an hour. A one-hour round trip on five days adds 5 hours a week, so the job takes 45 hours a week or 2,250 hours a year.',
          'With $2,500 a year in fuel, parking and lunches, the real wage is ($52,000 − $2,500) ÷ 2,250 = $22.00 an hour, about 15.4% lower than the paid rate.',
        ],
      },
    ],
    faq: [
      { q: 'What is a real hourly wage?', a: 'It is your take-home pay, minus what you spend because of the job, divided by every hour the job takes, including commuting and unpaid time.' },
      { q: 'Should I use gross or take-home pay?', a: 'Take-home pay, because it is the money you can spend. Using gross pay would count tax as if it were income.' },
      { q: 'What counts as a work-related cost?', a: 'Fuel, parking, transit, work clothes, lunches you buy because of work, and childcare you would not need otherwise. Do not include costs you would have anyway, such as rent.' },
      { q: 'How do I compare working from home?', a: 'Set commute days per week to your office days and lower the work-related costs, then compare the real hourly wage of each setup.' },
    ],
    sources: [{ label: 'Your Money or Your Life, Vicki Robin and Joe Dominguez (real hourly wage concept)', url: 'https://yourmoneyoryourlife.com/' }],
  },
  related: ['commute-cost', 'salary-to-hourly', 'hours-worked', 'take-home-pay'],
  examples: [
    // paid = 52000/2000 = 26; week hours 45; year 2250; real = (52000-2500)/2250 = 22; drop = 1-22/26 = 0.153846
    { values: { pay: 52000, hours: 40, weeks: 50, days: 5, minutes: 60, costs: 2500 }, expect: { stated: 26, real: 22, weekHours: 45, yearHours: 2250, drop: 0.153846 }, tolerance: 0.001 },
    // no commute, no costs: real = stated = 26
    { values: { pay: 52000, hours: 40, weeks: 50, days: 0, minutes: 0 }, expect: { real: 26, stated: 26, drop: 0 } },
    // 2h unpaid/week, no commute: 42h * 50 = 2100; 52000/2100 = 24.7619
    { values: { pay: 52000, hours: 40, weeks: 50, days: 0, minutes: 0, extra: 2 }, expect: { real: 24.7619 }, tolerance: 0.001 },
  ],
});
