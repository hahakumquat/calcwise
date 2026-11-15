import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { CATCHUP_401K, CURRENCY, LIMIT_401K, money, pct, TAX_YEAR } from '../../lib/helpers/finance';

const PERIODS: Record<string, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };

export default defineCalculator({
  slug: '401k-max-out',
  title: '401(k) Max-Out Calculator',
  seoTitle: '401(k) Max-Out Calculator: Per Paycheck',
  category: 'finance',
  description: `How much to contribute per paycheck to max out your ${TAX_YEAR} 401(k) by Dec 31. See the dollar and percent amount, with a chart of your path.`,
  keywords: ['max out 401k', '401k per paycheck', 'how much to contribute to 401k', `401k contribution limit ${TAX_YEAR}`, '401k catch-up', '401k year end'],
  updated: '2026-11-15',
  popular: false,
  inputs: [
    { id: 'salary', label: 'Annual gross salary', type: 'number', prefix: '$', default: 85000, min: 0, step: 1000, info: 'Your yearly pay before taxes. Used to show the plan as a percent of each paycheck.' },
    {
      id: 'frequency',
      label: 'Pay frequency',
      type: 'select',
      default: 'biweekly',
      options: [
        { value: 'weekly', label: 'Weekly (52)' },
        { value: 'biweekly', label: 'Every two weeks (26)' },
        { value: 'semimonthly', label: 'Twice a month (24)' },
        { value: 'monthly', label: 'Monthly (12)' },
      ],
      info: 'How often you are paid. It sets how big each paycheck is, so it changes the percent you need.',
    },
    { id: 'ytd', label: 'Contributed so far this year', type: 'number', prefix: '$', default: 15000, min: 0, step: 500, info: 'Your year-to-date 401(k) total from your latest pay stub or plan website. Count your own pre-tax and Roth contributions, not your employer match.' },
    { id: 'left', label: 'Paychecks left this year', type: 'number', default: 6, min: 0, max: 60, step: 1, help: 'Roughly 6 if you are paid every two weeks in mid-November.', info: 'Count only paychecks that will arrive on or before Dec 31 (a paycheck dated Jan 2 belongs to next year). Ask payroll if unsure.' },
    {
      id: 'age',
      label: 'Your age this year',
      type: 'select',
      segmented: true,
      default: 'under50',
      options: [
        { value: 'under50', label: 'Under 50' },
        { value: '50plus', label: '50 or older' },
      ],
      info: 'If you turn 50 any time this year you qualify for the catch-up contribution.',
    },
    { id: 'current', label: 'Current contribution rate', type: 'number', suffix: '% of pay', min: 0, max: 100, step: 0.5, optional: true, info: 'Optional. The percent of each paycheck you contribute now. Leave blank to skip the "current pace" comparison.' },
  ],
  outputs: [
    { id: 'perPaycheck', label: 'Needed per paycheck', format: 'currency', primary: true, info: 'The dollar amount to contribute from each remaining paycheck to land exactly on the limit by Dec 31.' },
    { id: 'pctNeeded', label: 'Share of each paycheck', format: 'percent', precision: 1, info: 'That amount divided by your gross pay per paycheck. Set this percentage in your plan website.' },
    { id: 'room', label: 'Room left under the limit', format: 'currency', info: 'The limit for you this year minus what you have already put in.' },
    { id: 'limit', label: 'Your limit this year', format: 'currency', info: 'The IRS employee limit, plus the age 50+ catch-up if you chose it.' },
    { id: 'reachable', label: 'Can you get there by Dec 31?', format: 'text', info: '"Yes" or "No". "No" means even 100% of your remaining paychecks is not enough.' },
    { id: 'projected', label: 'Year-end total at your current pace', format: 'currency', info: 'What you would have contributed by Dec 31 if you keep your current rate. Capped at your limit.' },
    { id: 'gap', label: 'Left on the table at current pace', format: 'currency', info: 'Limit minus projected year-end total, never below zero. Blank when you leave the current rate empty.' },
  ],
  compute: (v) => {
    const salary = num(v.salary);
    const ytd = num(v.ytd);
    const leftRaw = num(v.left);
    const current = num(v.current);
    if (salary === null || salary <= 0 || ytd === null || ytd < 0 || leftRaw === null || leftRaw < 0) return { perPaycheck: null };
    if (current !== null && current < 0) return { perPaycheck: null };
    if (current !== null && current > 100) return { perPaycheck: null, error: 'Contribution rate cannot be over 100%.' };

    const left = Math.floor(leftRaw);
    const periods = PERIODS[String(v.frequency)] ?? 26;
    const plus50 = v.age === '50plus';
    const limit = LIMIT_401K + (plus50 ? CATCHUP_401K : 0);
    const room = Math.max(0, limit - ytd);
    const perPaycheck: number | null = left > 0 ? room / left : room > 0 ? null : 0;
    const grossPer = salary / periods;
    const pctNeeded = perPaycheck !== null ? perPaycheck / grossPer : null;
    const reachable = room === 0 || (left > 0 && pctNeeded !== null && pctNeeded <= 1);
    const overBy = Math.max(0, ytd - limit);

    const currentPer = current !== null ? (current / 100) * grossPer : null;
    const currentEnd = currentPer !== null ? ytd + currentPer * left : null;
    const shortfall = currentEnd !== null ? Math.max(0, limit - currentEnd) : null;
    const projected = currentEnd !== null ? Math.min(limit, currentEnd) : null;

    let tone: 'good' | 'ok' | 'warn' | 'bad';
    let badge: string;
    if (ytd >= limit) { tone = 'good'; badge = 'Already maxed out'; }
    else if (left === 0) { tone = 'bad'; badge = 'Out of paychecks'; }
    else if (pctNeeded! > 1) { tone = 'bad'; badge = "Can't get there"; }
    else if (pctNeeded! > 0.5) { tone = 'bad'; badge = 'Steep climb'; }
    else if (pctNeeded! > 0.3) { tone = 'warn'; badge = 'Doable, but tight'; }
    else if (pctNeeded! > 0.15) { tone = 'ok'; badge = 'Very doable'; }
    else { tone = 'good'; badge = 'Easy win'; }

    let note: string;
    if (ytd >= limit) {
      note = ytd > limit
        ? `You are ${money(overBy, 0)} over the limit. Contact your plan; excess deferrals usually must be withdrawn by April 15 to avoid double taxation. Estimate only, not tax advice.`
        : `You have already reached the ${TAX_YEAR} limit of ${money(limit, 0)}. Check your plan stops your deferrals so you do not exceed it.`;
    } else if (left === 0) {
      note = 'No paychecks left this year, so a normal payroll change cannot add more. Some plans allow a lump sum from a bonus; ask HR.';
    } else if (pctNeeded! > 1) {
      note = 'Even 100% of your remaining paychecks is not enough. A year-end bonus election may help, if your plan allows it.';
    } else {
      note = `Contribute ${money(perPaycheck!)} per paycheck (${pct(pctNeeded!, 1)} of gross) for the remaining ${left} paychecks. Estimate; check your plan's rules, and spread it out evenly in case your employer match is calculated per paycheck.`;
    }

    const steps = [
      plus50
        ? `Your ${TAX_YEAR} limit = ${money(LIMIT_401K, 0)} + ${money(CATCHUP_401K, 0)} catch-up = ${money(limit, 0)}`
        : `Your ${TAX_YEAR} limit = ${money(LIMIT_401K, 0)}`,
      `Room left = limit - contributed so far = ${money(limit, 0)} - ${money(ytd, 0)} = ${money(room, 0)}`,
    ];
    if (perPaycheck !== null) {
      steps.push(`Per paycheck = ${money(room, 0)} / ${left} = ${money(perPaycheck)}`);
      steps.push(`Gross per paycheck = ${money(salary, 0)} / ${periods} = ${money(grossPer)}, so the plan is ${pct(pctNeeded!, 1)}`);
    }
    if (current !== null && currentEnd !== null && shortfall !== null) {
      steps.push(`At ${current}% you will reach about ${money(Math.min(limit, currentEnd), 0)} by Dec 31, leaving ${money(shortfall, 0)} of room unused.`);
    }

    const out = {
      perPaycheck,
      pctNeeded,
      room,
      limit,
      reachable: reachable ? 'Yes' : 'No',
      projected,
      gap: shortfall,
      tone,
      badge,
      note,
      steps,
    };
    if (perPaycheck === null || left < 1) return out;

    const x = Array.from({ length: left + 1 }, (_, k) => k);
    const series: { name: string; values: number[] }[] = [{ name: 'Max-out plan', values: x.map((k) => ytd + k * perPaycheck) }];
    if (currentPer !== null) series.push({ name: 'Current pace', values: x.map((k) => Math.min(limit, ytd + k * currentPer)) });
    series.push({ name: 'Limit', values: x.map(() => limit) });
    const line: ChartSpec = {
      type: 'line',
      title: 'Your path to the limit',
      x,
      xLabel: 'Paychecks from now',
      xFormat: { format: 'integer' },
      yLabel: 'Contributed',
      yFormat: CURRENCY,
      series,
      markers: [{ x: left, label: 'Dec 31' }],
    };
    const charts: ChartSpec[] = [line];
    if (perPaycheck > 0 && pctNeeded !== null) {
      const share = pctNeeded * 100;
      charts.push({
        type: 'scale',
        title: 'How hard is it?',
        min: 0,
        max: 100,
        value: Math.min(100, share),
        valueLabel: `${Math.round(share)}% of each paycheck`,
        bands: [
          { from: 0, to: 15, label: 'Easy', tone: 'good' },
          { from: 15, to: 30, label: 'Very doable', tone: 'ok' },
          { from: 30, to: 50, label: 'Tight', tone: 'warn' },
          { from: 50, to: 100, label: 'Steep', tone: 'bad' },
        ],
        format: { format: 'number', suffix: '%' },
      });
    }
    return { ...out, chart: charts };
  },
  content: {
    formula: [
      'Room = limit - contributed so far',
      'Per paycheck = room / paychecks left',
      'Share of pay = per paycheck / (annual salary / pay periods per year)',
    ],
    body: [
      `The IRS caps what you can put into a 401(k) from your own pay each calendar year: ${money(LIMIT_401K, 0)} for ${TAX_YEAR}, plus ${money(CATCHUP_401K, 0)} more if you are 50 or older. It resets on January 1 and applies to you as a person, across all your jobs, not to each plan.`,
      'The planner takes what is left under your limit and divides it by the paychecks left this year. Check the paycheck count carefully; it is the number most people get wrong. Then it shows that dollar amount as a share of each paycheck, which is the percent you would set on your plan website.',
      'Spreading the amount evenly keeps you eligible for the employer match on every paycheck. Some plans only match per paycheck, so cramming it all into the last two checks can cost you free money. Contributions from your own pay do not include the match.',
    ],
    sections: [
      {
        heading: 'Catch-up contributions if you are 50 or older',
        paragraphs: [
          `If you turn 50 at any point in ${TAX_YEAR}, you can add a ${money(CATCHUP_401K, 0)} catch-up on top of the base limit, for a total of ${money(LIMIT_401K + CATCHUP_401K, 0)}. Choose "50 or older" above to include it. People aged 60 to 63 may be allowed a higher catch-up, and high earners may be required to make catch-up contributions as Roth, so check your plan.`,
        ],
      },
      {
        heading: 'Traditional vs Roth: does it change the limit?',
        paragraphs: [
          'No. The limit is the same for both and shared between them. Traditional contributions lower this year\'s taxable income, while Roth contributions do not. To see how a change affects your paycheck, try the take-home pay calculator.',
        ],
      },
      {
        heading: 'How to change your contribution',
        paragraphs: [
          'Log in to your plan website or HR portal. Set a percent or a dollar amount per paycheck. Confirm the change takes effect before your next paycheck; some changes take one to two pay cycles, so do it early.',
        ],
      },
    ],
    faq: [
      { q: 'Does the 401(k) limit include my employer match?', a: `No. The ${money(LIMIT_401K, 0)} limit covers your own deferrals; the match is on top. A separate, higher overall limit covers you plus your employer, and this calculator does not use it.` },
      { q: 'Is the limit per job or per person?', a: 'Per person across all 401(k), 403(b) and similar plans in a calendar year. Add up your year-to-date contributions from all jobs before entering them.' },
      { q: 'What happens if I contribute more than the limit?', a: 'Excess deferrals are generally taxed in the year contributed, and unless withdrawn by April 15 of the next year they are taxed again when withdrawn. Contact your plan administrator. This is an estimate, not tax advice.' },
      { q: 'When does the limit reset?', a: 'On January 1. It is per calendar year, regardless of your fiscal or plan year.' },
      { q: 'How many paychecks do I have left?', a: 'Count paychecks that will be paid on or before Dec 31, not period end dates. Biweekly payers sometimes have 27 paychecks in a year, and monthly payers in mid-November usually have 2 left (Nov 30 and Dec 31) if paid at month end.' },
      { q: 'How much per paycheck do I need with the default inputs?', a: `With an $85,000 salary paid every two weeks, $15,000 contributed and 6 paychecks left, you have ${money(LIMIT_401K - 15000, 0)} of room. That is $1,583.33 per paycheck, or 48.4% of each $3,269.23 gross paycheck.` },
      { q: 'Should I stop contributing once I hit the limit?', a: 'Plans often stop automatically, and some employers stop matching when you hit the limit early. Spread the contributions evenly through the year to keep the full match.' },
      { q: 'Does the catch-up count if I turn 50 late in the year?', a: 'Yes, if you turn 50 at any point in the calendar year.' },
    ],
    sources: [
      { label: 'IRS: 401(k) limit increases to $24,500 for 2026, IRA limit increases to $7,500', url: 'https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500' },
      { label: 'KPMG summary of IRS Notice 2025-67 (increased retirement plan contribution limits for 2026)', url: 'https://kpmg.com/us/en/taxnewsflash/news/2025/11/notice-2025-67-increased-retirement-plan-contribution-limits-2026.html' },
    ],
  },
  related: ['roth-vs-traditional', 'take-home-pay', 'retirement', 'income-tax', 'savings-goal', 'fire-number'],
  examples: [
    // limit 24500, room 24500-15000 = 9500, 9500/6 = 1583.3333; gross/paycheck 85000/26 = 3269.2308; 1583.3333/3269.2308 = 0.484314
    {
      values: { salary: 85000, frequency: 'biweekly', ytd: 15000, left: 6, age: 'under50', current: null },
      expect: { room: 9500, limit: 24500, perPaycheck: 1583.333333, pctNeeded: 0.484314, reachable: 'Yes', badge: 'Doable, but tight', tone: 'warn' },
    },
    // limit 24500+8000 = 32500, room 7500, /6 = 1250, 1250/3269.2308 = 0.382353
    {
      values: { salary: 85000, frequency: 'biweekly', ytd: 25000, left: 6, age: '50plus', current: null },
      expect: { limit: 32500, room: 7500, perPaycheck: 1250, pctNeeded: 0.382353 },
    },
    // ytd 26000 > 24500: room 0, per paycheck 0
    {
      values: { salary: 85000, frequency: 'biweekly', ytd: 26000, left: 6, age: 'under50', current: null },
      expect: { room: 0, perPaycheck: 0, tone: 'good', badge: 'Already maxed out' },
    },
    // room 24500 / 2 = 12250; gross/paycheck 60000/12 = 5000; 12250/5000 = 2.45
    {
      values: { salary: 60000, frequency: 'monthly', ytd: 0, left: 2, age: 'under50', current: null },
      expect: { perPaycheck: 12250, pctNeeded: 2.45, reachable: 'No', badge: "Can't get there", tone: 'bad' },
    },
    // projected 15000 + 0.10 * 3269.2308 * 6 = 16961.538; gap 24500 - 16961.538 = 7538.462
    {
      values: { salary: 85000, frequency: 'biweekly', ytd: 15000, left: 6, age: 'under50', current: 10 },
      expect: { projected: 16961.538, gap: 7538.462 },
    },
    // no paychecks left but room remains: no divide by zero
    {
      values: { salary: 85000, frequency: 'biweekly', ytd: 15000, left: 0, age: 'under50', current: null },
      expect: { room: 9500, reachable: 'No', badge: 'Out of paychecks', tone: 'bad' },
    },
  ],
});
