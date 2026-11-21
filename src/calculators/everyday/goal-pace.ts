import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'goal-pace',
  title: 'Goal Pace Calculator: Per Day and Week',
  category: 'everyday',
  description: 'Turn a yearly goal into what you need per day, week and month from here on, and see if you are ahead or behind a straight-line pace. Miles, pages or dollars.',
  keywords: ['goal pace calculator', 'how much per day to reach my goal', 'am i on track for my goal', 'yearly goal tracker', 'new year goal calculator', 'run 1000 miles a year'],
  updated: '2026-11-21',
  inputs: [
    { id: 'goal', label: 'Goal amount', type: 'number', default: 1000, min: 0, step: 1, info: 'The total you want to reach by the end of the period, for example 1,000 miles, 5,000 pages or $12,000.' },
    { id: 'unit', label: 'Unit label', type: 'text', default: 'miles', placeholder: 'miles, pages, $, workouts', optional: true, info: 'Only used to label the results. It does not change the maths.' },
    { id: 'done', label: 'Progress so far', type: 'number', default: 200, min: 0, step: 1, info: 'How much of the goal you have completed to date.' },
    { id: 'elapsed', label: 'Days elapsed', type: 'number', default: 73, min: 0, step: 1, info: 'Days of the goal period already gone. 73 days is one fifth of a 365-day year. Try the date difference calculator to count them.' },
    { id: 'total', label: 'Days in goal period', type: 'number', default: 365, min: 1, step: 1, info: 'The full length of the goal. A calendar year is 365 days (366 in a leap year).' },
  ],
  outputs: [
    { id: 'perDay', label: 'Needed per day from now', format: 'number', precision: 2, primary: true, info: '(Goal − progress) ÷ days remaining.' },
    { id: 'perWeek', label: 'Needed per week', format: 'number', precision: 2, info: 'Needed per day × 7.' },
    { id: 'perMonth', label: 'Needed per month', format: 'number', precision: 1, info: 'Needed per day × 365 ÷ 12, an average month of 30.4 days.' },
    { id: 'remaining', label: 'Still to go', format: 'number', precision: 1, info: 'Goal minus progress, never below 0.' },
    { id: 'expected', label: 'Straight-line target today', format: 'number', precision: 1, info: 'Goal × days elapsed ÷ days in the period: where you would be at an even daily pace.' },
    { id: 'gap', label: 'Ahead (+) or behind (−)', format: 'number', precision: 1, info: 'Your progress minus the straight-line target. Positive means ahead.' },
  ],
  compute: (v) => {
    const goal = num(v.goal);
    const done = num(v.done);
    const elapsedRaw = num(v.elapsed);
    const total = num(v.total);
    const unitRaw = typeof v.unit === 'string' ? v.unit.trim() : '';
    if (goal === null || done === null || elapsedRaw === null || total === null || goal < 0 || done < 0 || elapsedRaw < 0 || total < 1) return { perDay: null };
    const elapsed = Math.min(elapsedRaw, total);
    const daysLeft = total - elapsed;
    const remaining = Math.max(0, goal - done);
    const expected = (goal * elapsed) / total;
    const gap = done - expected;
    const u = unitRaw ? ` ${unitRaw}` : '';
    const base = { remaining, expected, gap };
    const common = {
      ...base,
      chart: {
        type: 'line' as const,
        title: 'Your progress against a straight-line pace',
        x: [0, elapsed, total],
        xLabel: 'Days into the goal',
        yFormat: { format: 'number' as const, precision: 0 },
        series: [
          { name: 'Straight-line pace', values: [0, expected, goal] },
          { name: 'Your path if you hit the goal', values: [0, Math.min(done, goal), goal] },
        ],
        markers: [{ x: elapsed, label: 'Today' }],
      },
    };
    if (remaining === 0) {
      return {
        perDay: 0,
        perWeek: 0,
        perMonth: 0,
        ...common,
        tone: 'good' as const,
        badge: 'Goal reached',
        note: `You have already reached your goal of ${fmt(goal, 0)}${u}.`,
      };
    }
    if (daysLeft <= 0) {
      return {
        perDay: null,
        ...common,
        tone: 'bad' as const,
        badge: 'Period over',
        note: `All ${fmt(total)} days have passed, so there is no time left. You are ${fmt(remaining, 1)}${u} short of the goal.`,
      };
    }
    const perDay = remaining / daysLeft;
    const perWeek = perDay * 7;
    const perMonth = (perDay * 365) / 12;
    const even = Math.abs(gap) < 1e-9;
    const ahead = gap > 0;
    return {
      perDay,
      perWeek,
      perMonth,
      ...common,
      tone: ahead || even ? ('good' as const) : ('ok' as const),
      badge: even ? 'Right on pace' : ahead ? `${fmt(gap, 1)} ahead` : `${fmt(-gap, 1)} behind`,
      note: even
        ? `You are exactly on a straight-line pace. Keep going at ${fmt(perDay, 2)}${u} a day.`
        : ahead
          ? `You are ${fmt(gap, 1)}${u} ahead of an even pace. You need ${fmt(perDay, 2)}${u} a day, below the ${fmt(goal / total, 2)} a day the plan started at.`
          : `You are ${fmt(-gap, 1)}${u} behind an even pace. You need ${fmt(perDay, 2)}${u} a day, above the ${fmt(goal / total, 2)} a day the plan started at.`,
      steps: [
        `Still to go = ${fmt(goal, 1)} − ${fmt(done, 1)} = ${fmt(remaining, 1)}`,
        `Days left = ${fmt(total)} − ${fmt(elapsed)} = ${fmt(daysLeft)}`,
        `Needed per day = ${fmt(remaining, 1)} ÷ ${fmt(daysLeft)} = ${fmt(perDay, 3)}`,
        `Straight-line target today = ${fmt(goal, 1)} × ${fmt(elapsed)} ÷ ${fmt(total)} = ${fmt(expected, 1)}; gap = ${fmt(done, 1)} − ${fmt(expected, 1)} = ${fmt(gap, 1)}`,
      ],
    };
  },
  content: {
    formula: [
      'Still to go = goal − progress',
      'Needed per day = still to go ÷ (days in period − days elapsed)',
      'Straight-line target = goal × days elapsed ÷ days in period',
      'Ahead or behind = progress − straight-line target',
    ],
    body: [
      'A big goal for the year is easier to follow when it becomes a daily or weekly number. Enter the total you are aiming for, how much you have done and how many days have gone, and the calculator tells you what you need per day, per week and per month for the rest of the period.',
      'It also compares you with a straight-line pace, the amount you would have done by now if you had spread the goal evenly over every day. Being ahead means the daily number you need has dropped. Being behind means it has gone up.',
      'The unit label is only text, so it works for miles, pages, dollars saved, workouts or anything you can count. Days elapsed is an input rather than a date, so you can count from any start day, not only 1 January.',
      'To count days between two dates, use the date difference calculator. For books specifically, the reading goal calculator also works out minutes a day.',
    ],
    faq: [
      { q: 'How much per day do I need to reach 1,000 miles in a year?', a: 'Spread evenly over 365 days it is 1,000 ÷ 365 = 2.74 miles a day, or 19.18 a week. If you have already done 200 after 73 days, you are exactly on pace and still need 800 ÷ 292 = 2.74 a day.' },
      { q: 'What does behind pace mean?', a: 'You have done less than the straight-line target for today. With a goal of 1,000, 73 of 365 days gone and 100 done, the target is 200, so you are 100 behind and now need 900 ÷ 292 = 3.08 a day.' },
      { q: 'How is the monthly figure worked out?', a: 'It is the daily figure times 365 ÷ 12, an average month of about 30.4 days, so months of different lengths do not distort it.' },
      { q: 'What if I have already hit the goal?', a: 'The needed amounts show as 0 and the result says the goal is reached.' },
      { q: 'What if the period is over?', a: 'With no days left there is nothing to divide by, so no daily pace is shown. The calculator reports how far short you finished.' },
    ],
    sources: [],
  },
  related: ['year-progress', 'reading-goal', 'date-difference', 'savings-goal'],
  examples: [
    // 800 left / 292 days = 2.739726; week x7 = 19.17808; month x365/12 = 83.3333; expected 1000 x 73 / 365 = 200; gap 0
    { values: { goal: 1000, unit: 'miles', done: 200, elapsed: 73, total: 365 }, expect: { perDay: 800 / 292, perWeek: (800 / 292) * 7, perMonth: (800 / 292) * (365 / 12), remaining: 800, expected: 200, gap: 0 }, tolerance: 1e-9 },
    // done 100: remaining 900 / 292 = 3.0822; gap 100 - 200 = -100
    { values: { goal: 1000, unit: 'miles', done: 100, elapsed: 73, total: 365 }, expect: { perDay: 900 / 292, remaining: 900, expected: 200, gap: -100 }, tolerance: 1e-9 },
    // start of year: 365 / 365 = 1 a day, 7 a week, 30.4167 a month
    { values: { goal: 365, unit: 'pages', done: 0, elapsed: 0, total: 365 }, expect: { perDay: 1, perWeek: 7, perMonth: 365 / 12, expected: 0, gap: 0 }, tolerance: 1e-9 },
    // 300 done of 200: goal reached
    { values: { goal: 200, unit: '$', done: 300, elapsed: 100, total: 200 }, expect: { perDay: 0, remaining: 0, expected: 100, gap: 200 }, tolerance: 1e-9 },
  ],
});
