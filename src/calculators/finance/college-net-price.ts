import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'college-net-price',
  title: 'College Net Price Calculator',
  category: 'finance',
  description: 'Compare an award letter to the real bill. Enter tuition, housing, books and grants to see the net price per year, over all years, and how much aid covers.',
  keywords: ['college net price calculator', 'net cost of college', 'financial aid award letter calculator', 'cost of attendance after grants', 'college cost per year'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'tuition', label: 'Tuition and fees per year', type: 'number', prefix: '$', default: 28000, min: 0, step: 500, info: 'The sticker price from the school, before any aid.' },
    { id: 'room', label: 'Room and board per year', type: 'number', prefix: '$', default: 14000, min: 0, step: 500, info: 'On-campus housing and meal plan, or your estimate if you live off campus.' },
    { id: 'books', label: 'Books, travel and other per year', type: 'number', prefix: '$', default: 2000, min: 0, step: 100, info: 'Use the school\'s estimate or your own.' },
    { id: 'grants', label: 'Grants and scholarships per year', type: 'number', prefix: '$', default: 18000, min: 0, step: 500, info: 'Money you do not repay. Do not include loans or work-study: they are still part of what you pay.' },
    { id: 'years', label: 'Years', type: 'number', default: 4, min: 1, max: 10, step: 1, info: 'How many years you will pay this amount.' },
  ],
  outputs: [
    { id: 'net', label: 'Net price per year', format: 'currency', precision: 0, primary: true, info: 'Cost of attendance minus grants and scholarships.' },
    { id: 'cost', label: 'Total cost per year', format: 'currency', precision: 0, info: 'Tuition and fees plus room and board plus books and other.' },
    { id: 'total', label: 'Net price over all years', format: 'currency', precision: 0, info: 'Net price per year × years.' },
    { id: 'covered', label: 'Share covered by grants', format: 'percent', precision: 1, info: 'Grants ÷ total cost per year.' },
  ],
  compute: (v) => {
    const t = num(v.tuition);
    const r = num(v.room);
    const b = num(v.books);
    const g = num(v.grants);
    const y = num(v.years);
    if ([t, r, b, g, y].some((x) => x === null)) return { net: null };
    if ([t, r, b, g].some((x) => (x as number) < 0)) return { net: null, error: 'Values cannot be negative.' };
    if (y! < 1) return { net: null, error: 'Enter at least 1 year.' };
    const cost = t! + r! + b!;
    const net = Math.max(cost - g!, 0);
    const total = net * y!;
    const covered = cost > 0 ? Math.min(g! / cost, 1) * 100 : 0;
    return {
      net,
      cost,
      total,
      covered,
      tone: covered >= 60 ? 'good' : 'warn',
      badge: `${pct(covered / 100, 1)} covered by grants`,
      note: `Over ${y} year${y === 1 ? '' : 's'} you would pay about ${money(total)}. Costs usually rise each year; that is not modelled. Loans and work-study count toward this net price, they do not reduce it.`,
      chart: {
        type: 'donut' as const,
        title: 'Cost per year',
        slices: [
          { label: 'Grants', value: cost - net },
          { label: 'You pay', value: net },
        ].filter((s) => s.value > 0),
        format: CURRENCY,
        centerLabel: 'You pay',
        centerValue: money(net, 0),
      },
      steps: [
        `Total cost = ${money(t!)} + ${money(r!)} + ${money(b!)} = ${money(cost)}`,
        `Net price = ${money(cost)} − ${money(g!)} = ${money(net)}`,
        `Over ${y} years = ${money(net)} × ${y} = ${money(total)}`,
      ],
    };
  },
  content: {
    formula: [
      'Total cost = tuition and fees + room and board + books and other',
      'Net price = total cost − grants and scholarships',
      'Total net price = net price × years',
    ],
    body: [
      'An award letter mixes grants, loans and work-study, so the headline number can look better than it is. The net price strips it down to what you pay after the money you never repay.',
      'Example: tuition $28,000, room and board $14,000 and $2,000 for books make $44,000 a year. With $18,000 of grants, the net price is $26,000 a year, $104,000 over 4 years, and grants cover 40.9%.',
      'Take the figures from your award letter and the school\'s cost of attendance. Price rises, scholarships that shrink after year one and the chance of finishing in more than 4 years are not modelled, so run it again with different numbers. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is net price?', a: 'The cost of attendance minus grants and scholarships. Loans and work-study are not subtracted because you repay or earn them.' },
      { q: 'What is the net price for $44,000 of cost and $18,000 of grants?', a: '$26,000 a year, or $104,000 over 4 years. Grants cover 40.9% of the cost.' },
      { q: 'Should loans count as aid?', a: 'Not when comparing offers. They are part of what you pay, with interest. Compare net price first, then see how much you would borrow.' },
      { q: 'Does it include price increases?', a: 'No. Tuition and housing usually rise, so the real total is often higher.' },
      { q: 'Where do I find the numbers?', a: 'On your award letter and the school\'s net price calculator or cost of attendance page. The federal College Navigator lists published prices.' },
    ],
    sources: [
      { label: 'U.S. Department of Education: College Navigator', url: 'https://nces.ed.gov/collegenavigator/' },
      { label: 'Federal Student Aid: Cost of attendance', url: 'https://studentaid.gov/complete-aid-process/how-calculated' },
    ],
  },
  related: ['credits-to-graduate', 'degree-payback', 'student-loan-payoff', 'aotc-credit'],
  examples: [
    // cost 44000; net 26000; total 104000; covered 18000/44000 = 40.909...%
    { values: { tuition: 28000, room: 14000, books: 2000, grants: 18000, years: 4 }, expect: { cost: 44000, net: 26000, total: 104000 } },
    // grants exceed cost: net 0, covered 100
    { values: { tuition: 10000, room: 0, books: 0, grants: 12000, years: 4 }, expect: { cost: 10000, net: 0, total: 0, covered: 100 } },
  ],
});
