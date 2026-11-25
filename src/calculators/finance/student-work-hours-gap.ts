import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'student-work-hours-gap',
  title: 'Work Hours to Cover a College Funding Gap',
  category: 'finance',
  description: 'Turn a college funding gap into the hours you would need to work, using your hourly wage, the share withheld and the weeks you have.',
  keywords: ['how many hours to work to pay for college', 'college funding gap calculator', 'student work hours calculator', 'hours to cover tuition gap', 'part time job to pay tuition', 'work hours per week to cover costs'],
  updated: '2026-11-25',
  inputs: [
    { id: 'gap', label: 'Money gap to cover', type: 'number', prefix: '$', default: 5200, min: 0, step: 100, info: 'Costs minus aid and savings, for example from an award letter.' },
    { id: 'wage', label: 'Hourly wage', type: 'number', prefix: '$', default: 15, min: 0, step: 0.5, info: 'Your pay before anything is withheld.' },
    { id: 'withheld', label: 'Share withheld from pay', type: 'number', suffix: '%', default: 10, min: 0, max: 60, step: 1, info: 'Your estimate of tax and other withholding. Many students with low earnings have little withheld; check a pay stub.' },
    { id: 'weeks', label: 'Weeks available to work', type: 'number', default: 15, min: 1, max: 60, step: 1, info: 'For example the length of a semester.' },
  ],
  outputs: [
    { id: 'hours', label: 'Total hours needed', format: 'number', precision: 1, suffix: 'h', primary: true, info: 'Gap ÷ take-home pay per hour.' },
    { id: 'perWeek', label: 'Hours per week', format: 'number', precision: 1, suffix: 'h', info: 'Total hours ÷ weeks available.' },
    { id: 'net', label: 'Take-home per hour', format: 'currency', info: 'Wage × (1 − share withheld).' },
  ],
  compute: (v) => {
    const gap = num(v.gap), wage = num(v.wage), wh = num(v.withheld), weeks = num(v.weeks);
    if (gap === null || wage === null || wh === null || weeks === null) return { hours: null };
    if (gap < 0 || wage < 0) return { hours: null, error: 'Amounts cannot be negative.' };
    if (wh < 0 || wh >= 100) return { hours: null, error: 'Share withheld must be from 0% up to (but under) 100%.' };
    if (weeks < 1) return { hours: null, error: 'Enter at least 1 week.' };
    const net = wage * (1 - wh / 100);
    if (net <= 0) return { hours: null, error: 'Enter a wage above $0.' };
    const hours = gap / net;
    const perWeek = hours / weeks;
    return {
      hours, perWeek, net,
      tone: perWeek > 20 ? 'warn' : 'ok',
      badge: `${perWeek.toFixed(1)} hours a week for ${weeks} weeks`,
      chart: {
        type: 'bar',
        title: 'Where each hour of pay goes',
        categories: ['Take-home', 'Withheld'],
        series: [{ name: 'Per hour', values: [net, wage - net] }],
        format: { format: 'currency' },
      },
      steps: [
        `Take-home per hour = ${usd(wage)} × (1 − ${wh}%) = ${usd(net)}`,
        `Hours = ${usd(gap)} ÷ ${usd(net)} = ${hours.toFixed(2)}`,
        `Per week = ${hours.toFixed(2)} ÷ ${weeks} = ${perWeek.toFixed(2)}`,
      ],
      note: 'Work-study earnings limits and your class load are not modelled. Whether this schedule is realistic alongside classes is your call.',
    };
  },
  content: {
    formula: ['Take-home per hour = wage × (1 − share withheld)', 'Hours = gap ÷ take-home per hour', 'Hours per week = hours ÷ weeks available'],
    body: [
      'When an award letter leaves a gap, the question is how many hours of work it takes. Convert your wage to take-home pay, divide the gap by it, then spread the hours over the weeks you have.',
      'Example: a $5,200 gap at $15 an hour with 10% withheld is $13.50 take-home. $5,200 ÷ 13.50 = 385.19 hours, or 25.68 hours a week over 15 weeks. Second example: $1,200 at $18 with 8% withheld is $16.56 per hour, 72.46 hours, 6.04 a week over 12 weeks.',
      'Work-study earnings caps and class load are not modelled, and the withholding share is your estimate. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How many hours do I need to work to cover a $5,200 gap?', a: 'At $15 an hour with 10% withheld you take home $13.50, so $5,200 ÷ $13.50 = 385.19 hours, about 25.68 a week over 15 weeks.' },
      { q: 'What share of my pay should I enter as withheld?', a: 'Use your pay stub. It is your own estimate; this tool does not calculate tax. Enter 0 to treat pay as take-home.' },
      { q: 'Does this account for work-study limits?', a: 'No. Work-study awards usually cap earnings, so check your award letter.' },
      { q: 'What if the weekly hours come out too high?', a: 'Lengthen the weeks available, raise the wage, or shrink the gap. Over 12 weeks, $1,200 at $18 with 8% withheld is only 6.04 hours a week.' },
      { q: 'Where do I find my funding gap?', a: 'Subtract aid and savings from the total cost. The college net price calculator helps with the first part.' },
    ],
    sources: [
      { label: 'Federal Student Aid: Federal Work-Study', url: 'https://studentaid.gov/understand-aid/types/work-study' },
    ],
  },
  related: ['college-net-price', 'hours-of-work-cost', 'salary-to-hourly'],
  examples: [
    // 15*0.9=13.5; 5200/13.5=385.185; /15=25.679
    { values: { gap: 5200, wage: 15, withheld: 10, weeks: 15 }, expect: { net: 13.5, hours: 385.19, perWeek: 25.68 }, tolerance: 0.01 },
    // 18*0.92=16.56; 1200/16.56=72.464; /12=6.039
    { values: { gap: 1200, wage: 18, withheld: 8, weeks: 12 }, expect: { net: 16.56, hours: 72.46, perWeek: 6.04 }, tolerance: 0.01 },
  ],
});
