import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'salary-to-hourly',
  title: 'Salary to Hourly Calculator',
  category: 'finance',
  description: 'Convert an annual salary to an hourly wage, or an hourly rate to a yearly salary, with weekly, biweekly and monthly pay.',
  keywords: ['salary to hourly', 'hourly to salary', 'annual salary', 'hourly wage', 'pay rate converter', 'wage calculator'],
  popular: true,
  inputs: [
    {
      id: 'mode',
      info: 'Choose which pay figure you know; the other is worked out from your hours.',
      label: 'Convert',
      type: 'select',
      segmented: true,
      default: 'toHourly',
      options: [
        { value: 'toHourly', label: 'Salary → hourly' },
        { value: 'toSalary', label: 'Hourly → salary' },
      ],
    },
    { id: 'salary', label: 'Annual salary', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, showWhen: { input: 'mode', is: 'toHourly' }, info: 'Your yearly gross pay before taxes and deductions, from your offer letter or pay stub.' },
    { id: 'hourly', label: 'Hourly wage', type: 'number', prefix: '$', default: 25, min: 0, step: 0.25, showWhen: { input: 'mode', is: 'toSalary' }, info: 'Your gross pay per hour before taxes.' },
    { id: 'hours', label: 'Hours per week', type: 'number', suffix: 'hours', default: 40, min: 0, max: 168, step: 0.5, info: 'Hours you are paid for in a typical week. Full time is usually 40.' },
    { id: 'weeks', label: 'Paid weeks per year', type: 'number', suffix: 'weeks', default: 52, min: 0, max: 53, step: 1, help: 'Use 52 if you get paid time off; fewer if unpaid weeks.', info: 'Weeks you are paid for each year. Use 52 if you get paid holidays and vacation.' },
  ],
  outputs: [
    { id: 'hourlyRate', label: 'Hourly wage', format: 'currency', primary: true, showWhen: { input: 'mode', is: 'toHourly' }, info: 'Your gross pay per hour of paid work: salary divided by paid hours in a year.' },
    { id: 'annual', label: 'Annual salary', format: 'currency', primary: true, showWhen: { input: 'mode', is: 'toSalary' }, info: 'Gross pay for the year: hourly wage × hours per week × paid weeks.' },
    { id: 'daily', label: 'Daily (5-day week)', format: 'currency', info: 'Gross pay for one day, assuming your weekly hours are spread over five days.' },
    { id: 'weekly', label: 'Weekly', format: 'currency', info: 'Gross pay for one week of work.' },
    { id: 'biweekly', label: 'Every two weeks', format: 'currency', info: 'Gross pay per paycheck if you are paid every two weeks (26 checks a year).' },
    { id: 'semimonthly', label: 'Twice a month', format: 'currency', info: 'Gross pay per paycheck if you are paid twice a month (24 checks a year).' },
    { id: 'monthly', label: 'Monthly', format: 'currency', info: 'Gross pay per month: yearly pay divided by 12.' },
  ],
  compute: (v) => {
    const hours = num(v.hours);
    const weeks = num(v.weeks);
    const none = v.mode === 'toSalary' ? { annual: null } : { hourlyRate: null };
    if (hours === null || weeks === null || hours <= 0 || weeks <= 0) return none;
    const hoursPerYear = hours * weeks;
    let annual: number;
    let hourlyRate: number;
    if (v.mode === 'toSalary') {
      const h = num(v.hourly);
      if (h === null || h < 0) return none;
      hourlyRate = h;
      annual = h * hoursPerYear;
    } else {
      const s = num(v.salary);
      if (s === null || s < 0) return none;
      annual = s;
      hourlyRate = s / hoursPerYear;
    }
    const weekly = annual / weeks;
    return {
      hourlyRate,
      chart: { type: 'bar', title: 'Gross pay by period', categories: ['Hour', 'Day', 'Week', '2 weeks', 'Month'], series: [{ name: 'Gross pay', values: [hourlyRate, weekly / 5, weekly, annual / 26, annual / 12] }], format: CURRENCY },
      daily: weekly / 5,
      weekly,
      biweekly: annual / 26,
      semimonthly: annual / 24,
      monthly: annual / 12,
      annual,
      steps: [
        `Hours per year = ${hours} × ${weeks} = ${hoursPerYear}`,
        v.mode === 'toSalary' ? `Salary = ${money(hourlyRate)} × ${hoursPerYear} = ${money(annual)}` : `Hourly = ${money(annual)} ÷ ${hoursPerYear} = ${money(hourlyRate)}`,
      ],
      note: 'These are gross (pre-tax) figures. Use the take-home pay calculator to see pay after taxes.',
    };
  },
  content: {
    formula: ['Hourly = annual salary ÷ (hours per week × weeks per year)', 'Salary = hourly × hours per week × weeks per year'],
    body: [
      'A full-time U.S. schedule of 40 hours a week for 52 weeks is 2,080 hours a year. That gives a handy shortcut: an hourly wage is roughly the annual salary divided by 2,000 — so $60,000 a year is about $30 an hour (exactly $28.85).',
      'If you are salaried with paid vacation and holidays, keep 52 weeks: your salary already covers that time off. If you are an hourly or contract worker who is not paid for time off, use the number of weeks you actually work — 48 or 50 is common — to see the salary your hourly rate really adds up to.',
      'The pay-period amounts show what one paycheck looks like before taxes. "Every two weeks" (26 checks a year) and "twice a month" (24 checks) are different schedules, which is why the biweekly figure is a little smaller.',
    ],
    faq: [
      { q: 'How many work hours are in a year?', a: '2,080 hours for 40 hours a week over 52 weeks. Subtract unpaid time off to get your actual paid hours.' },
      { q: 'How do I compare a salaried job with a contract rate?', a: 'Contractors usually pay both halves of payroll tax and get no benefits or paid leave, so a contract hourly rate needs to be noticeably higher — often 25–40% — than the salaried equivalent to come out even.' },
      { q: 'Does overtime change the calculation?', a: 'For hourly workers, yes: hours over 40 a week are usually paid at 1.5×. This calculator assumes all hours are paid at the same rate.' },
    ],
  },
  related: ['take-home-pay', 'income-tax', 'retirement', 'percentage'],
  examples: [
    { values: { mode: 'toHourly', salary: 60000, hourly: null, hours: 40, weeks: 52 }, expect: { hourlyRate: 28.846153846, biweekly: 2307.6923077 } },
    { values: { mode: 'toSalary', salary: null, hourly: 25, hours: 40, weeks: 50 }, expect: { annual: 50000, weekly: 1000, daily: 200 } },
  ],
});
