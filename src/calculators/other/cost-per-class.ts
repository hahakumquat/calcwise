import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (n: number) => '$' + fmt(n, 2);

export default defineCalculator({
  slug: 'cost-per-class',
  title: 'Cost Per Class Calculator',
  category: 'other',
  description: 'Find out what each lecture costs: divide your term tuition by every class meeting, and see the price of a skipped class and of each hour. Free, in your browser.',
  keywords: ['cost per class', 'cost per lecture', 'what does skipping class cost', 'tuition per class calculator', 'cost per class hour', 'college class cost'],
  updated: '2026-11-21',
  inputs: [
    { id: 'tuition', label: 'Tuition for the term', type: 'number', prefix: '$', default: 3000, min: 0, step: 50, info: 'What you pay for this course or this term. Use the course price to see one class, or the whole term to see an average class.' },
    { id: 'perWeek', label: 'Class meetings per week', type: 'number', default: 3, min: 1, max: 14, step: 1, info: 'How many times the class meets each week.' },
    { id: 'weeks', label: 'Weeks in the term', type: 'number', default: 15, min: 1, max: 52, step: 1, info: 'Weeks with classes. Leave out exam or break weeks if there are no lectures.' },
    { id: 'missed', label: 'Classes missed', type: 'number', default: 0, min: 0, step: 1, optional: true, info: 'Optional. How many meetings you skipped or plan to skip.' },
    { id: 'minutes', label: 'Length of each class', type: 'number', suffix: 'min', min: 1, max: 600, step: 5, optional: true, placeholder: '50', info: 'Optional. Minutes per meeting, to get a cost per hour.' },
  ],
  outputs: [
    { id: 'perClass', label: 'Cost per class', format: 'currency', primary: true, info: 'Tuition ÷ total class meetings.' },
    { id: 'total', label: 'Total classes in the term', format: 'integer', info: 'Meetings per week × weeks.' },
    { id: 'skipped', label: 'Cost of a skipped class', format: 'currency', info: 'The same as the cost per class: the share of tuition each meeting covers.' },
    { id: 'perHour', label: 'Cost per class hour', format: 'currency', info: 'Cost per class ÷ (minutes ÷ 60). Needs the class length.' },
    { id: 'missedCost', label: 'Spent on missed classes', format: 'currency', info: 'Classes missed × cost per class.' },
  ],
  compute: (v) => {
    const tuition = num(v.tuition);
    const perWeek = num(v.perWeek);
    const weeks = num(v.weeks);
    const missed = num(v.missed) ?? 0;
    const minutes = num(v.minutes);
    if (tuition === null || perWeek === null || weeks === null || tuition < 0 || perWeek < 1 || weeks < 1 || missed < 0) return { perClass: null };
    const total = perWeek * weeks;
    if (missed > total) return { perClass: null };
    const perClass = tuition / total;
    const missedCost = missed * perClass;
    const hasLen = minutes !== null && minutes > 0;
    const perHour = hasLen ? perClass / (minutes / 60) : null;
    const attended = total - missed;
    const steps = [
      `Total classes: ${fmt(perWeek)} × ${fmt(weeks)} = ${fmt(total)}`,
      `Cost per class: ${usd(tuition)} ÷ ${fmt(total)} = ${usd(perClass)}`,
    ];
    if (hasLen) steps.push(`Cost per hour: ${usd(perClass)} ÷ (${fmt(minutes)} ÷ 60) = ${usd(perHour as number)}`);
    if (missed > 0) steps.push(`Missed: ${fmt(missed)} × ${usd(perClass)} = ${usd(missedCost)}`);
    const cum: number[] = [];
    const cats: string[] = [];
    const n = Math.min(Math.round(weeks), 52);
    for (let i = 1; i <= n; i++) { cats.push(`Week ${i}`); cum.push(Math.min(tuition, perWeek * i * perClass)); }
    return {
      perClass,
      total,
      skipped: perClass,
      perHour,
      missedCost,
      chart: {
        type: 'bar',
        title: 'Tuition used up by the end of each week',
        categories: cats,
        format: { format: 'currency', precision: 0 },
        series: [{ name: 'Tuition used', values: cum }],
      },
      steps,
      tone: missed > 0 ? 'ok' : 'good',
      badge: `${usd(perClass)} a class`,
      note: missed > 0
        ? `You attend ${fmt(attended)} of ${fmt(total)} classes. The ${fmt(missed)} you miss account for ${usd(missedCost)} of your tuition.`
        : `Each of the ${fmt(total)} classes covers ${usd(perClass)} of your tuition, so skipping one gives up that amount.`,
    };
  },
  content: {
    formula: [
      'Total classes = meetings per week × weeks',
      'Cost per class = tuition ÷ total classes',
      'Cost per hour = cost per class ÷ (class minutes ÷ 60)',
      'Spent on missed classes = classes missed × cost per class',
    ],
    body: [
      'Tuition is a big single number, which makes it hard to feel. Split across every class meeting, it becomes a price you can picture: what one lecture costs you.',
      'Enter your tuition, how often the class meets and how many weeks the term runs. Add the class length in minutes if you want a cost per hour, and the classes you missed to see how much of your tuition they represent.',
      'This is plain division. It treats every meeting as equal and ignores books, fees and what you could be earning instead. Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'Using the number',
        paragraphs: [
          'The cost of a skipped class is simply the cost of any class. Use the course price to see one class, or the full term bill to see an average class across all your courses. Whether a class is worth attending depends on more than money, so treat the figure as a prompt, not a verdict.',
        ],
      },
    ],
    faq: [
      { q: 'How do you work out the cost per class?', a: 'Multiply meetings per week by weeks to get total classes, then divide tuition by that number.' },
      { q: 'What does $3,000 for 3 classes a week over 15 weeks give?', a: 'There are 3 × 15 = 45 classes, so each costs $3,000 ÷ 45 = $66.67. With 50-minute classes that is $80.00 an hour.' },
      { q: 'What does skipping a class cost?', a: 'The same as any class. At $1,800 for 2 classes a week over 15 weeks, each class is $60.00, so 3 missed classes represent $180.00.' },
      { q: 'How is the cost per hour worked out?', a: 'Divide the cost per class by the class length in hours. A $100.00 class that runs 90 minutes costs $100.00 ÷ 1.5 = $66.67 an hour.' },
    ],
  },
  related: ['credits-to-graduate', 'study-time-planner', 'gpa', 'final-grade', 'weighted-grade'],
  examples: [
    // total 3*15 = 45; perClass 3000/45 = 66.6667; perHour 66.6667/(50/60) = 80
    { values: { tuition: 3000, perWeek: 3, weeks: 15, missed: 0, minutes: 50 }, expect: { total: 45, perClass: 3000 / 45, skipped: 3000 / 45, perHour: 80, missedCost: 0 }, tolerance: 1e-9 },
    // total 2*15 = 30; perClass 60; perHour 60/1.25 = 48; missed 3*60 = 180
    { values: { tuition: 1800, perWeek: 2, weeks: 15, missed: 3, minutes: 75 }, expect: { total: 30, perClass: 60, skipped: 60, perHour: 48, missedCost: 180 }, tolerance: 1e-9 },
    // total 4*14 = 56; perClass 5600/56 = 100; perHour 100/1.5 = 66.6667; missed 4*100 = 400
    { values: { tuition: 5600, perWeek: 4, weeks: 14, missed: 4, minutes: 90 }, expect: { total: 56, perClass: 100, skipped: 100, perHour: 200 / 3, missedCost: 400 }, tolerance: 1e-9 },
  ],
});
