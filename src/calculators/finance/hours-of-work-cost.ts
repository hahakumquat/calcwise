import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const n1 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });
const n2 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'hours-of-work-cost',
  title: 'Hours of Work a Purchase Costs',
  category: 'finance',
  description: 'Turn any price into the hours of your working life it takes to pay for it, using your hourly wage after tax. Plain arithmetic, no judgement.',
  keywords: ['hours of work calculator', 'how many hours to afford', 'cost in hours of work', 'price in work hours', 'is it worth it hours of life', 'time cost of purchase'],
  inputs: [
    { id: 'price', label: 'Price', type: 'number', prefix: '$', default: 240, min: 0, step: 1, info: 'What the purchase costs.' },
    { id: 'wage', label: 'Gross hourly wage', type: 'number', prefix: '$', default: 30, min: 0.01, step: 0.5, info: 'Your pay per hour before tax. For a salary, divide by 2,080 (40 hours × 52 weeks).' },
    { id: 'tax', label: 'Tax rate', type: 'number', suffix: '%', default: 20, min: 0, max: 90, step: 1, info: 'Your own estimate of the share of each paycheck that goes to tax. This is not looked up for you.' },
    { id: 'day', label: 'Hours per workday', type: 'number', default: 8, min: 1, max: 24, step: 0.5, info: 'Used to turn hours into workdays.' },
  ],
  outputs: [
    { id: 'hours', label: 'Hours of work', format: 'number', precision: 1, suffix: 'h', primary: true, info: 'Price ÷ take-home hourly pay.' },
    { id: 'days', label: 'Workdays', format: 'number', precision: 2, info: 'Hours ÷ hours per workday.' },
    { id: 'net', label: 'Take-home per hour', format: 'currency', info: 'Gross hourly wage × (1 − tax rate).' },
  ],
  compute: (v) => {
    const price = num(v.price), wage = num(v.wage), tax = num(v.tax) ?? 0, day = num(v.day) ?? 8;
    if (price === null || wage === null) return { hours: null, note: 'Enter a price and an hourly wage.' };
    if (price < 0 || wage <= 0 || tax < 0 || tax >= 100 || day <= 0) return { hours: null, error: 'Use a price of 0 or more, a wage above 0, and a tax rate under 100%.' };
    const net = wage * (1 - tax / 100);
    const hours = price / net;
    const days = hours / day;
    return {
      hours,
      days,
      net,
      tone: 'ok',
      badge: `${n2(days)} workdays`,
      chart: {
        type: 'bar',
        title: 'Hours of work for different prices',
        categories: [0.5, 1, 2].map((m) => `$${Math.round(price * m).toLocaleString('en-US')}`),
        series: [{ name: 'Hours', values: [0.5, 1, 2].map((m) => (price * m) / net) }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Take-home per hour = $${n2(wage)} × (1 − ${n1(tax)}%) = $${n2(net)}`,
        `Hours = $${n2(price)} ÷ $${n2(net)} = ${n1(hours)} hours`,
        `Workdays = ${n1(hours)} ÷ ${n1(day)} = ${n2(days)}`,
      ],
    };
  },
  content: {
    formula: ['Take-home per hour = gross hourly wage × (1 − tax rate)', 'Hours of work = price ÷ take-home per hour', 'Workdays = hours ÷ hours per workday'],
    body: [
      'Prices are easier to judge when you see them in the thing you actually spend to earn them: time. This calculator divides a price by what you take home each hour, so a $240 jacket becomes a number of working hours.',
      'You choose the tax rate yourself, because it depends on where you live and how much you earn. Use the share of your gross pay that you do not see in your account. If you only know a salary, divide it by 2,080 to get an hourly wage.',
      'It is a way of looking at a price, not a verdict. Some purchases are worth every hour. For items you will use many times, the cost per use calculator is the better lens. To see what your time is really worth after commuting and work costs, try the real hourly wage calculator.',
    ],
    faq: [
      { q: 'How many hours of work is $240 at $30 an hour?', a: 'With a 20% tax estimate, take-home is $24 an hour, so $240 is 10 hours, or 1.25 workdays of 8 hours.' },
      { q: 'How many workdays is $1,200 at $25 an hour?', a: 'At 20% tax your take-home is $20 an hour, so $1,200 is 60 hours, which is 7.5 workdays.' },
      { q: 'What tax rate should I enter?', a: 'Your own estimate of the share of your gross pay that goes to tax. Setting it to 0 gives the cost in gross hours, which understates the real time.' },
      { q: 'I am paid a salary. What do I enter?', a: 'Divide your yearly salary by 2,080, which assumes 40 hours a week for 52 weeks, and enter that as the hourly wage.' },
    ],
    sources: [
      { label: 'U.S. Bureau of Labor Statistics: Hourly wages and work hours', url: 'https://www.bls.gov/' },
    ],
  },
  related: ['real-hourly-wage', 'cost-per-use', 'salary-to-hourly', 'latte-factor'],
  examples: [
    { values: { price: 240, wage: 30, tax: 20, day: 8 }, expect: { hours: 10, days: 1.25, net: 24 } },
    { values: { price: 1200, wage: 25, tax: 20, day: 8 }, expect: { hours: 60, days: 7.5, net: 20 } },
    { values: { price: 100, wage: 50, tax: 0, day: 8 }, expect: { hours: 2, days: 0.25, net: 50 } },
  ],
});
