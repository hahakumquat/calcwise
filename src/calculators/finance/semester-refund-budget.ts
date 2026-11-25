import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'semester-refund-budget',
  title: 'Semester Refund Budget Calculator',
  category: 'finance',
  description: 'Turn a student loan or aid refund into a weekly and daily spending budget after rent, food plan and planned one-offs. Shows if the refund runs short.',
  keywords: ['semester refund budget', 'financial aid refund budget calculator', 'student refund check how long will it last', 'college refund per week', 'aid disbursement budget'],
  updated: '2026-11-25',
  inputs: [
    { id: 'refund', label: 'Refund received', type: 'number', prefix: '$', default: 3200, min: 0, step: 50, info: 'The amount left after tuition and fees are paid.' },
    { id: 'weeks', label: 'Weeks in the term', type: 'number', default: 15, min: 1, step: 1, info: 'Count from the day the money arrives to the end of the term.' },
    { id: 'fixed', label: 'Fixed costs for the term', type: 'number', prefix: '$', default: 1800, min: 0, step: 50, info: 'Rent, food plan, phone, transit pass.' },
    { id: 'oneoffs', label: 'Planned one-off costs', type: 'number', prefix: '$', default: 350, min: 0, step: 25, info: 'Books, a flight home, a laptop repair.' },
  ],
  outputs: [
    { id: 'perWeek', label: 'Spending per week', format: 'currency', primary: true, info: 'Free money divided by weeks. Negative means you are short.' },
    { id: 'perDay', label: 'Spending per day', format: 'currency', info: 'Weekly amount divided by 7.' },
    { id: 'free', label: 'Left after fixed and one-off costs', format: 'currency', info: 'Refund minus fixed costs minus one-offs.' },
  ],
  compute: (v) => {
    const refund = num(v.refund), weeks = num(v.weeks), fixed = num(v.fixed), oneoffs = num(v.oneoffs);
    if (refund === null || weeks === null || fixed === null || oneoffs === null) return { perWeek: null };
    if (refund < 0 || fixed < 0 || oneoffs < 0) return { perWeek: null, error: 'Amounts cannot be negative.' };
    if (weeks < 1) return { perWeek: null, error: 'Enter at least 1 week.' };
    const free = refund - fixed - oneoffs;
    const perWeek = free / weeks;
    const perDay = perWeek / 7;
    return {
      perWeek, perDay, free,
      tone: free < 0 ? 'bad' : 'good',
      badge: free < 0 ? `Short by ${usd(-free)} this term` : 'Refund covers your costs',
      chart: {
        type: 'bar',
        title: 'Where the refund goes',
        categories: ['Refund', 'Fixed costs', 'One-offs', 'Left over'],
        series: [{ name: 'Amount', values: [refund, fixed, oneoffs, Math.max(0, free)] }],
        format: { format: 'currency' },
      },
      steps: [
        `Left over = ${usd(refund)} − ${usd(fixed)} − ${usd(oneoffs)} = ${usd(free)}`,
        `Per week = ${usd(free)} ÷ ${weeks} weeks = ${usd(perWeek)}`,
        `Per day = ${usd(perWeek)} ÷ 7 = ${usd(perDay)}`,
      ],
      note: 'A refund of borrowed aid is not free money: interest and repayment are not modelled, and your school\'s terms apply.',
    };
  },
  content: {
    formula: ['Left over = refund − fixed costs − one-off costs', 'Per week = left over ÷ weeks in the term', 'Per day = per week ÷ 7'],
    body: [
      'A refund check feels large on the day it lands, then has to cover a whole term. Subtract the costs you already know about, spread what is left across the weeks, and you get a number you can actually spend.',
      'Example: a $3,200 refund over 15 weeks, with $1,800 of fixed costs and $350 of one-offs, leaves $1,050. That is $70.00 a week or $10.00 a day. Second example: $1,500 over 16 weeks with $1,200 fixed and $400 of one-offs is $100 short, or −$6.25 a week.',
      'If the refund came from loans, you will repay it with interest, which this calculator does not model. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I make a financial aid refund last the semester?', a: 'List the fixed costs first, take out planned one-offs, then divide what is left by the weeks in the term. $1,050 left over 15 weeks is $70 a week.' },
      { q: 'What does a negative number mean?', a: 'Your costs are bigger than the refund. With $1,500, $1,200 fixed and $400 of one-offs you are $100 short, which is −$6.25 a week over 16 weeks.' },
      { q: 'Is the refund free money?', a: 'Not if it comes from loans. You repay it with interest later, and this calculator does not include that.' },
      { q: 'Which weeks should I count?', a: 'From the day the refund arrives to the last day you need to cover costs, usually the end of the term.' },
    ],
    sources: [
      { label: 'Federal Student Aid: Receiving your aid', url: 'https://studentaid.gov/understand-aid/types/loans' },
    ],
  },
  related: ['college-net-price', 'student-work-hours-gap', 'paycheck-bill-planner'],
  examples: [
    // free 1050; /15 = 70; /7 = 10
    { values: { refund: 3200, weeks: 15, fixed: 1800, oneoffs: 350 }, expect: { perWeek: 70, perDay: 10, free: 1050 }, tolerance: 0.01 },
    // free -100; /16 = -6.25
    { values: { refund: 1500, weeks: 16, fixed: 1200, oneoffs: 400 }, expect: { perWeek: -6.25, free: -100 }, tolerance: 0.01 },
  ],
});
