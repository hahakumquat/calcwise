import { defineCalculator, type ComputeResult } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const money = (n: number) => `${n < 0 ? '−' : ''}$${fmt(Math.abs(n), 2)}`;

const BILL_DEFAULTS: { amount?: number; day?: number }[] = [
  { amount: 1200, day: 1 },
  { amount: 150, day: 5 },
  { amount: 100, day: 10 },
  { amount: 80, day: 20 },
  { amount: 60, day: 28 },
  {},
];

export default defineCalculator({
  slug: 'paycheck-bill-planner',
  title: 'Paycheck Bill Planner: Which Bills Come Out of Which Check',
  seoTitle: 'Paycheck Bill Planner: Which Bills Per Check',
  category: 'finance',
  description: 'Paid twice a month? Enter your pay days and up to six bills to see which paycheck should cover each one, and how much is left from each check.',
  keywords: ['paycheck bill planner', 'which bills to pay with which paycheck', 'bills by paycheck', 'budget by paycheck', 'paycheck budget calculator', 'twice a month bill schedule'],
  updated: '2026-11-21',
  inputs: [
    { id: 'takeHome', label: 'Take-home pay per check', type: 'number', prefix: '$', default: 1600, min: 0, step: 50, info: 'What lands in your account each time you are paid, after tax. Both checks are assumed to be the same size.' },
    { id: 'payDay1', label: 'First pay day of the month', type: 'number', default: 1, min: 1, max: 28, step: 1, info: 'Day of the month you are paid, 1 to 28.' },
    { id: 'payDay2', label: 'Second pay day (0 = paid once a month)', type: 'number', default: 15, min: 0, max: 28, step: 1, info: 'Day of the month of your second check, 1 to 28. Enter 0 if you get only one check a month.' },
    ...BILL_DEFAULTS.flatMap((b, i) => [
      { id: `amt${i + 1}`, label: `Bill ${i + 1} amount`, type: 'number' as const, prefix: '$', default: b.amount, min: 0, step: 10, optional: true, info: i === 0 ? 'Monthly amount. Leave unused bill slots blank.' : 'Monthly amount of this bill. Leave blank if unused.' },
      { id: `day${i + 1}`, label: `Bill ${i + 1} due day`, type: 'number' as const, default: b.day, min: 1, max: 31, step: 1, optional: true, info: i === 0 ? 'Day of the month the bill is due, 1 to 31.' : 'Day of the month this bill is due, 1 to 31.' },
    ]),
  ],
  outputs: [
    { id: 'tight', label: 'Left over on the tighter check', format: 'currency', primary: true, info: 'The smaller of the two leftovers (take-home pay minus the bills that check carries). Negative means that check cannot cover its bills.' },
    { id: 'tighter', label: 'Tighter check', format: 'text', info: 'The check with the smaller leftover.' },
    { id: 'bills1', label: 'Bills on first check', format: 'currency', info: 'Total of the bills assigned to the earlier pay day.' },
    { id: 'left1', label: 'Left from first check', format: 'currency', info: 'Take-home pay minus the bills on the first check.' },
    { id: 'bills2', label: 'Bills on second check', format: 'currency', info: 'Total of the bills assigned to the later pay day. Blank if you are paid once a month.' },
    { id: 'left2', label: 'Left from second check', format: 'currency', info: 'Take-home pay minus the bills on the second check.' },
    { id: 'total', label: 'Total bills per month', format: 'currency', info: 'All bills you entered added together.' },
  ],
  compute: (v) => {
    const pay = num(v.takeHome);
    const p1 = num(v.payDay1);
    const p2 = num(v.payDay2) ?? 0;
    if (pay === null || pay <= 0) return { tight: null };
    if (p1 === null || !Number.isInteger(p1) || p1 < 1 || p1 > 28) return { tight: null, error: 'Enter a first pay day from 1 to 28.' };
    if (!Number.isInteger(p2) || p2 < 0 || p2 > 28) return { tight: null, error: 'Enter a second pay day from 1 to 28, or 0 if you are paid once a month.' };
    if (p2 === p1) return { tight: null, error: 'The two pay days must be different. Enter 0 for the second if you are paid once a month.' };

    const days = (p2 === 0 ? [p1] : [p1, p2]).sort((a, b) => a - b);
    const checks = days.map((d) => ({ day: d, label: `Check on day ${d}`, sum: 0, items: [] as string[] }));
    const latest = checks.length - 1;

    let total = 0;
    let used = 0;
    for (let i = 1; i <= 6; i++) {
      const amt = num(v[`amt${i}`]);
      if (amt === null || amt <= 0) continue;
      const due = num(v[`day${i}`]);
      if (due === null || !Number.isInteger(due) || due < 1 || due > 31) return { tight: null, error: `Enter a due day from 1 to 31 for bill ${i}.` };
      // Latest check whose pay day is on or before the due day; otherwise the last check of the previous month.
      let idx = latest;
      for (let c = checks.length - 1; c >= 0; c--) {
        if (checks[c].day <= due) { idx = c; break; }
      }
      checks[idx].sum += amt;
      checks[idx].items.push(`$${fmt(amt, 2)}`);
      total += amt;
      used++;
    }
    if (used === 0) return { tight: null, note: 'Enter at least one bill amount.' };

    const left = checks.map((c) => pay - c.sum);
    const tightIdx = left.length === 2 && left[1] < left[0] ? 1 : 0;
    const tight = left[tightIdx];
    const tie = left.length === 2 && Math.abs(left[0] - left[1]) < 0.005;

    const out: ComputeResult = {
      tight,
      tighter: checks.length === 1 ? checks[0].label : tie ? 'Both equal' : checks[tightIdx].label,
      bills1: checks[0].sum,
      left1: left[0],
      bills2: checks.length === 2 ? checks[1].sum : null,
      left2: checks.length === 2 ? left[1] : null,
      total,
      steps: [
        ...checks.map((c, i) => `${c.label}: ${c.items.length ? c.items.join(' + ') : '$0.00'} = ${money(c.sum)} of bills; $${fmt(pay, 2)} − ${money(c.sum)} = ${money(left[i])} left`),
        `Total bills: ${money(total)}`,
      ],
      chart: {
        type: 'bar',
        title: 'Bills and leftover per paycheck',
        categories: checks.map((c) => `Day ${c.day}`),
        series: [
          { name: 'Bills', values: checks.map((c) => c.sum) },
          { name: 'Left over', values: left.map((l) => Math.max(0, l)) },
        ],
        stacked: true,
        format: { format: 'currency' },
      },
    };

    if (left.some((l) => l < 0)) {
      const short = Math.min(...left);
      out.tone = 'bad';
      out.badge = 'Short on a check';
      out.note = `The ${checks[left.indexOf(short)].label.toLowerCase()} is short by ${money(-short)}. Move a due date, split the bill, or ask the biller for a later date.`;
    } else if (tight < pay * 0.1) {
      out.tone = 'warn';
      out.badge = 'Very tight';
      out.note = `Only ${money(tight)} is left on the tighter check, less than 10% of it.`;
    } else {
      out.tone = 'good';
      out.badge = 'Covered';
      out.note = `Every check covers its bills. The tighter one has ${money(tight)} left.`;
    }
    return out;
  },
  content: {
    formula: [
      'Each bill is paid from the latest paycheck whose pay day is on or before the bill\'s due day',
      'If the due day is before your first pay day, the bill comes from the last check of the previous month',
      'Left from a check = take-home pay − bills assigned to that check',
    ],
    body: [
      'If you are paid twice a month, a monthly budget hides a problem: the rent and the car payment can land on one check while the other check is nearly untouched. This planner shows, bill by bill, which paycheck should cover what, and how much each check has left.',
      'Enter your take-home pay, your two pay days and up to six bills with their due days. Each bill is assigned to the most recent paycheck before it is due, so the money is already in your account when the bill hits. Everything runs in your browser and nothing is stored.',
      'The headline number is the leftover on the tighter check, because that is the one that decides whether your month works.',
    ],
    sections: [
      {
        heading: 'What to do when one check is too tight',
        paragraphs: [
          'Ask the biller to move the due date to just after your other pay day, which many utilities, card issuers and lenders allow for free. Or set aside a little from the lighter check towards the heavy one, which is the idea behind a sinking fund.',
          'Bills due before your first pay day of the month are paid from the previous month\'s last check, so that check carries them. Both checks are assumed equal in size, so if yours differ, treat the result as a guide.',
        ],
      },
    ],
    faq: [
      { q: 'How does the planner decide which check pays a bill?', a: 'Each bill comes from the latest paycheck whose pay day is on or before the due day. A bill due before your first pay day of the month comes from the last check of the previous month.' },
      { q: 'What do I get with $1,600 checks on days 1 and 15?', a: 'With bills of $1,200 (day 1), $150 (day 5), $100 (day 10), $80 (day 20) and $60 (day 28), the day 1 check carries $1,450 and has $150 left. The day 15 check carries $140 and has $1,460 left. The tighter check is day 1.' },
      { q: 'What if I am paid only once a month?', a: 'Enter 0 as the second pay day. Every bill then comes from that single check, and the leftover is your take-home pay minus all bills.' },
      { q: 'What does a negative leftover mean?', a: 'The bills assigned to that check add up to more than the check. Try moving a due date to after your other pay day, or cover the gap from savings.' },
    ],
  },
  related: ['zero-based-budget', 'paychecks-per-year', 'take-home-pay', 'sinking-fund', 'budget-50-30-20', 'salary-needed'],
  examples: [
    // Check 1 (day 1): 1200+150+100 = 1450, 1600-1450 = 150. Check 2 (day 15): 80+60 = 140, 1600-140 = 1460. Total 1590.
    { values: { takeHome: 1600, payDay1: 1, payDay2: 15, amt1: 1200, day1: 1, amt2: 150, day2: 5, amt3: 100, day3: 10, amt4: 80, day4: 20, amt5: 60, day5: 28, amt6: null, day6: null }, expect: { tight: 150, bills1: 1450, left1: 150, bills2: 140, left2: 1460, total: 1590 }, tolerance: 1e-9 },
    // Pay days 5 and 20. Day-2 bill is before the first pay day -> day-20 check. Day 5 -> check 5; day 19 -> check 5; day 20 -> check 20.
    // Check 5: 300+200 = 500, 2000-500 = 1500. Check 20: 900+100 = 1000, 2000-1000 = 1000. Total 1500.
    { values: { takeHome: 2000, payDay1: 5, payDay2: 20, amt1: 900, day1: 2, amt2: 300, day2: 5, amt3: 200, day3: 19, amt4: 100, day4: 20, amt5: null, day5: null, amt6: null, day6: null }, expect: { tight: 1000, bills1: 500, left1: 1500, bills2: 1000, left2: 1000, total: 1500 }, tolerance: 1e-9 },
    // Paid once a month (day 1): 2000+1500 = 3500 on one check; 3000-3500 = -500.
    { values: { takeHome: 3000, payDay1: 1, payDay2: 0, amt1: 2000, day1: 3, amt2: 1500, day2: 20, amt3: null, day3: null, amt4: null, day4: null, amt5: null, day5: null, amt6: null, day6: null }, expect: { tight: -500, bills1: 3500, left1: -500, total: 3500 }, tolerance: 1e-9 },
  ],
});
