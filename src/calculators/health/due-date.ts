import { defineCalculator } from '../../lib/types';
import { formatDate, num, parseDate } from '../../lib/math';
import { addDays, daysBetween, todayUtc } from '../../lib/helpers/health';

export default defineCalculator({
  slug: 'due-date',
  title: 'Pregnancy Due Date Calculator',
  category: 'health',
  description: 'Estimate your baby’s due date from the first day of your last period or the date of conception, and see how far along you are.',
  keywords: ['due date', 'pregnancy calculator', 'how far along am I', 'pregnancy weeks', 'EDD', 'Naegele’s rule', 'conception date'],
  popular: true,
  inputs: [
    {
      id: 'method',
      label: 'Calculate from',
      type: 'select',
      default: 'lmp',
      segmented: true,
      options: [
        { value: 'lmp', label: 'Last period' },
        { value: 'conception', label: 'Conception date' },
      ],
      info: 'Most people use the first day of their last period. Use the conception date if you know it, for example after IVF or a known ovulation date.',
    },
    { id: 'date', label: 'Date', type: 'date', default: 'today', help: 'First day of your last menstrual period, or the conception date.', info: 'For the period method, enter the first day of bleeding of your last period — not the last day.' },
    { id: 'cycle', label: 'Average cycle length', type: 'number', suffix: 'days', default: 28, min: 20, max: 45, step: 1, showWhen: { input: 'method', is: 'lmp' }, info: 'Days from the start of one period to the start of the next. 28 is average; anything from 21 to 35 is common.' },
  ],
  outputs: [
    { id: 'dueDate', label: 'Estimated due date', primary: true, format: 'text', info: '40 weeks after the start of your last period (adjusted for cycle length) — the date you reach full term.' },
    { id: 'progress', label: 'How far along (today)', format: 'text', info: 'Gestational age today, counted in weeks and days from the start of your last period.' },
    { id: 'trimester', label: 'Trimester (today)', format: 'text', info: 'First trimester is weeks 1–13, second weeks 14–27 and third from week 28 until birth.' },
    { id: 'daysLeft', label: 'Days until due date', format: 'integer', info: 'Calendar days from today until the estimated due date. Negative means the date has passed.' },
    { id: 'conceptionDate', label: 'Estimated conception date', format: 'text', info: 'About two weeks after the start of your last period, around ovulation.' },
    { id: 'secondTrimester', label: 'Second trimester starts', format: 'text', info: 'The start of week 14 of pregnancy.' },
    { id: 'thirdTrimester', label: 'Third trimester starts', format: 'text', info: 'The start of week 28 of pregnancy.' },
  ],
  compute: (v) => {
    const d = parseDate(v.date);
    const cycle = num(v.cycle) ?? 28;
    if (!d) return { dueDate: null };
    if (cycle < 20 || cycle > 45) return { dueDate: null, error: 'Cycle length should be between 20 and 45 days.' };
    // Work with an "adjusted LMP": the date pregnancy weeks are counted from.
    const adj = v.method === 'conception' ? addDays(d, -14) : addDays(d, Math.round(cycle) - 28);
    const due = addDays(adj, 280);
    const ga = daysBetween(adj, todayUtc());
    let progress: string;
    let trimester: string;
    if (ga < 0) {
      progress = 'Date is in the future';
      trimester = '—';
    } else if (ga > 300) {
      progress = 'More than 42 weeks — check the date';
      trimester = '—';
    } else {
      const w = Math.floor(ga / 7);
      const dd = ga % 7;
      progress = `${w} week${w === 1 ? '' : 's'}, ${dd} day${dd === 1 ? '' : 's'}`;
      trimester = w < 14 ? 'First trimester' : w < 28 ? 'Second trimester' : 'Third trimester';
    }
    const weeks = Math.min(42, Math.max(0, ga / 7));
    return {
      dueDate: formatDate(due),
      progress,
      trimester,
      daysLeft: daysBetween(todayUtc(), due),
      conceptionDate: formatDate(addDays(adj, 14)),
      secondTrimester: formatDate(addDays(adj, 14 * 7)),
      thirdTrimester: formatDate(addDays(adj, 28 * 7)),
      chart: {
        type: 'scale',
        title: 'Pregnancy timeline (weeks)',
        min: 0,
        max: 42,
        value: weeks,
        valueLabel: ga >= 0 && ga <= 300 ? `Today: week ${Math.floor(ga / 7)}` : 'Today: outside pregnancy dates',
        format: { suffix: 'wk' },
        bands: [
          { from: 0, to: 14, label: '1st trimester', tone: 'ok' },
          { from: 14, to: 28, label: '2nd trimester', tone: 'good' },
          { from: 28, to: 37, label: '3rd trimester', tone: 'ok' },
          { from: 37, to: 42, label: 'Full term', tone: 'neutral' },
        ],
      },
      steps:
        v.method === 'conception'
          ? ['Due date = conception date + 266 days (38 weeks)']
          : [`Due date = last period + 280 days${cycle !== 28 ? ` + (${Math.round(cycle)} − 28) days for your cycle length` : ''}`],
      note: 'Only about 1 in 25 babies arrives exactly on the due date; most are born within two weeks either side. Your care provider may adjust the date after an ultrasound.',
    };
  },
  content: {
    formula: [
      'Due date = first day of last period + 280 days (40 weeks)',
      'Cycle adjustment: + (cycle length − 28) days',
      'From conception: due date = conception + 266 days (38 weeks)',
    ],
    body: [
      'Pregnancy is conventionally dated from the first day of the last menstrual period (LMP), about two weeks before conception actually happens. A full-term pregnancy is counted as 40 weeks, or 280 days, from that date. This rule is known as Naegele’s rule.',
      'The standard rule assumes a 28-day cycle with ovulation on day 14. If your cycles are usually longer or shorter, ovulation shifts by the same amount, so the calculator moves the due date to match. If you know the date you conceived — for example after fertility treatment — the due date is 266 days (38 weeks) after conception.',
      'Weeks 1–13 are the first trimester, weeks 14–27 the second and week 28 onward the third. A first-trimester ultrasound measurement is usually the most accurate way to date a pregnancy, so your provider’s date takes precedence over this estimate. This tool is for information only and is not medical advice.',
    ],
    faq: [
      { q: 'Why does pregnancy count from before conception?', a: 'Most people know when their last period started but not exactly when they ovulated. Counting from the period gives everyone a consistent reference point, so "week 6" means the same thing to every clinician.' },
      { q: 'How accurate is a due date?', a: 'It is an estimate. Around 4% of babies are born on the exact day; roughly 80–90% arrive between 37 and 42 weeks.' },
      { q: 'What if my cycles are irregular?', a: 'Date-based estimates are less reliable with irregular cycles. An early ultrasound gives a better estimate.' },
    ],
  },
  related: ['ovulation', 'bmi', 'water-intake', 'protein'],
  examples: [
    {
      values: { method: 'lmp', date: '2026-01-01', cycle: 28 },
      expect: { dueDate: 'Thu, October 8, 2026', conceptionDate: 'Thu, January 15, 2026', secondTrimester: 'Thu, April 9, 2026' },
    },
    { values: { method: 'lmp', date: '2026-01-01', cycle: 32 }, expect: { dueDate: 'Mon, October 12, 2026' } },
    { values: { method: 'conception', date: '2026-03-10', cycle: null }, expect: { dueDate: 'Tue, December 1, 2026' } },
  ],
});
