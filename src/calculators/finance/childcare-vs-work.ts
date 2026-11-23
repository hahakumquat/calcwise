import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'childcare-vs-work',
  title: 'Childcare vs Working Calculator',
  seoTitle: 'Childcare vs Working Calculator',
  metaDescription: 'Find out what a job really adds after tax, childcare, commuting and work costs: your net gain per month, per year and per hour worked.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'See what you keep from working after tax, childcare and work costs, per month, per year and per hour, and how much of your take-home pay they use.',
  keywords: ['childcare vs working calculator', 'is it worth going back to work after baby', 'daycare cost vs salary', 'does working pay after childcare', 'net gain from working with childcare'],
  popular: false,
  inputs: [
    { id: 'gross', label: 'Gross pay per month', type: 'number', prefix: '$', default: 4000, min: 0, step: 100, info: 'Pay before tax, for the job you are weighing.' },
    { id: 'tax', label: 'Tax rate on that pay', type: 'number', suffix: '%', default: 25, min: 0, max: 99, step: 1, info: 'Your own estimate of the share lost to tax and payroll deductions.' },
    { id: 'care', label: 'Childcare per month', type: 'number', prefix: '$', default: 1500, min: 0, step: 50, info: 'The extra childcare you pay only because you work.' },
    { id: 'costs', label: 'Commute and work costs per month', type: 'number', prefix: '$', default: 300, min: 0, step: 25, info: 'Fuel, transit, parking, clothes, lunches and anything else the job adds.' },
    { id: 'hours', label: 'Hours worked per month', type: 'number', default: 160, min: 1, step: 5, suffix: 'h', info: 'Include commute time if you want it counted as work time.' },
  ],
  outputs: [
    { id: 'gain', label: 'Net gain per month', format: 'currency', primary: true, info: 'Take-home pay minus childcare and work costs. Negative means working costs more than it pays.' },
    { id: 'yearly', label: 'Net gain per year', format: 'currency', info: 'Monthly gain × 12.' },
    { id: 'perhour', label: 'Net gain per hour worked', format: 'currency', info: 'Monthly gain ÷ hours worked.' },
    { id: 'net', label: 'Take-home pay per month', format: 'currency', info: 'Gross pay × (1 - tax rate).' },
    { id: 'eaten', label: 'Share of take-home eaten by costs', format: 'number', precision: 1, suffix: '%', info: '(Childcare + work costs) ÷ take-home pay.' },
  ],
  compute: (v) => {
    const g = num(v.gross), t = num(v.tax), c = num(v.care), w = num(v.costs), h = num(v.hours);
    if ([g, t, c, w, h].some((x) => x === null)) return { gain: null };
    const [gross, tax, care, costs, hours] = [g, t, c, w, h] as number[];
    if (gross < 0 || tax < 0 || care < 0 || costs < 0) return { gain: null, error: 'Values cannot be negative.' };
    if (tax >= 100) return { gain: null, error: 'The tax rate must be below 100%.' };
    if (hours <= 0) return { gain: null, error: 'Hours worked must be above zero.' };
    const net = gross * (1 - tax / 100);
    const gain = net - care - costs;
    const eaten = net > 0 ? ((care + costs) / net) * 100 : null;
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Where a month of take-home pay goes ($)',
      categories: ['Take-home pay', 'Childcare', 'Work costs', 'Left over'],
      series: [{ name: 'Per month', values: [net, care, costs, gain] }],
      format: { format: 'currency' },
    };
    return {
      gain, yearly: gain * 12, perhour: gain / hours, net, eaten,
      tone: gain < 0 ? 'bad' : gain / hours < 10 ? 'warn' : 'ok',
      badge: gain < 0 ? 'Working costs more than it pays' : `${money(gain / hours, 2)} an hour after costs`,
      chart,
      steps: [
        `Take-home = ${money(gross, 0)} × (1 - ${tax}%) = ${money(net, 2)}`,
        `Net gain = ${money(net, 2)} - ${money(care, 0)} childcare - ${money(costs, 0)} work costs = ${money(gain, 2)}`,
        `Per hour = ${money(gain, 2)} ÷ ${hours} hours = ${money(gain / hours, 2)}`,
      ],
      note: 'This counts one month of money only. Career growth, pension, health cover, a raise later or childcare that gets cheaper as children start school are not included, and they can change the answer.',
    };
  },
  content: {
    formula: [
      'Take-home pay = gross pay × (1 - tax rate)',
      'Net gain = take-home pay - childcare - commute and work costs',
      'Per hour = net gain ÷ hours worked',
      'Share eaten = (childcare + work costs) ÷ take-home pay',
    ],
    body: [
      'When childcare is expensive, it is fair to ask whether a job really adds money. This calculator takes the job\'s pay after tax, subtracts the childcare you would pay only because you work and the other costs of the job, and shows what is left.',
      'The result is given per month, per year and per hour worked, along with the share of your take-home pay that the costs use up. A low or negative number does not mean you should not work. Pay rises, experience, pension, health cover and cheaper childcare once children start school all matter and are not counted here.',
      'The tax rate is your own estimate, and nothing here is financial advice. Use the figures you actually pay.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'Gross pay of $4,000 a month at a 25% tax rate leaves $3,000. Childcare of $1,500 and work costs of $300 total $1,800, so the net gain is $1,200 a month, or $14,400 a year. Over 160 hours that is $7.50 an hour. The costs use up 60% of take-home pay, leaving 40%.',
        ],
      },
      {
        heading: 'Related tools',
        paragraphs: [
          'The real hourly wage calculator folds commuting into your hourly rate, and the take-home pay calculator estimates pay after tax.',
        ],
      },
    ],
    faq: [
      { q: 'Is it worth working if childcare costs most of my pay?', a: 'It depends on more than this month. The calculator shows the cash gain after childcare and costs. Experience, pension, health cover and future pay rises are not counted, so weigh them separately.' },
      { q: 'Which childcare cost should I enter?', a: 'Enter the extra childcare you pay only because you work. If you would pay for some of it anyway, enter only the extra part.' },
      { q: 'What does a negative result mean?', a: 'The job costs more each month in tax, childcare and work costs than it pays. It is a cash figure only and ignores long-term effects on career and pension.' },
      { q: 'How is the hourly figure worked out?', a: 'It is the net gain divided by the hours you work in a month. In the example, $1,200 ÷ 160 hours = $7.50 an hour.' },
    ],
    sources: [],
  },
  related: ['real-hourly-wage', 'take-home-pay', 'net-to-gross'],
  examples: [
    // net 3000; gain 3000-1500-300=1200; yearly 14400; /160=7.5; eaten 1800/3000=60%? -> (1500+300)/3000=60
    { values: { gross: 4000, tax: 25, care: 1500, costs: 300, hours: 160 }, expect: { net: 3000, gain: 1200, yearly: 14400, perhour: 7.5, eaten: 60 }, tolerance: 1e-6 },
    // net 2000; gain 2000-2200-100=-300; /100h = -3
    { values: { gross: 2500, tax: 20, care: 2200, costs: 100, hours: 100 }, expect: { net: 2000, gain: -300, perhour: -3 }, tolerance: 1e-6 },
  ],
});
