import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'study-time-planner',
  title: 'Study Time Planner for Finals',
  category: 'other',
  description: 'Turn days until your exam into a plan: chapters to cover each day and study hours per chapter, with time held back for review. Free, in your browser.',
  keywords: ['study planner', 'study time calculator', 'finals study schedule', 'how many hours to study per chapter', 'exam study plan', 'study hours per day'],
  updated: '2026-11-20',
  inputs: [
    { id: 'days', label: 'Days until the exam', type: 'number', default: 10, min: 1, max: 30, step: 1, info: 'Whole days you can study before the exam (1 to 30).' },
    { id: 'chapters', label: 'Chapters or topics in total', type: 'number', default: 12, min: 1, max: 200, step: 1, info: 'Everything the exam covers, counted in whatever unit you like.' },
    { id: 'done', label: 'Already finished', type: 'number', default: 2, min: 0, max: 200, step: 1, info: 'Chapters or topics you already know well.' },
    { id: 'hours', label: 'Study hours per day', type: 'number', default: 3, min: 0.5, max: 16, step: 0.5, info: 'Hours you can realistically study each day.' },
    { id: 'review', label: 'Share kept for review', type: 'number', suffix: '%', default: 20, min: 0, max: 90, step: 5, info: 'A planning assumption, not a rule: the part of your study time held back for revising and practice questions.' },
  ],
  outputs: [
    { id: 'perDay', label: 'Chapters per day', format: 'number', precision: 2, primary: true, info: 'Chapters left ÷ days.' },
    { id: 'hoursPerChapter', label: 'Study hours per chapter', format: 'number', precision: 2, info: 'Learning hours (total hours minus review) ÷ chapters left.' },
    { id: 'left', label: 'Chapters left', format: 'number', info: 'Total chapters minus the ones already finished.' },
    { id: 'learnHours', label: 'Learning hours available', format: 'number', precision: 1, info: 'Hours per day × days × (1 − review share).' },
    { id: 'reviewHours', label: 'Review hours', format: 'number', precision: 1, info: 'Hours per day × days × review share.' },
  ],
  compute: (v) => {
    const days = num(v.days);
    const chapters = num(v.chapters);
    const done = num(v.done) ?? 0;
    const hours = num(v.hours);
    const review = (num(v.review) ?? 0) / 100;
    if (days === null || chapters === null || hours === null || days < 1 || chapters < 1 || hours <= 0 || done < 0 || review < 0 || review >= 1) return { perDay: null };
    const left = Math.max(0, chapters - done);
    const total = hours * days;
    const learn = total * (1 - review);
    const rev = total * review;
    if (left === 0) {
      return { perDay: 0, hoursPerChapter: 0, left: 0, learnHours: learn, reviewHours: rev, tone: 'good', badge: 'All covered', note: 'You have already finished every chapter. Use the time for review and practice questions.' };
    }
    const perDay = left / days;
    const hpc = learn / left;
    const d = Math.round(days);
    const cumulative: number[] = [];
    for (let i = 1; i <= d; i++) cumulative.push(Math.min(left, perDay * i));
    return {
      perDay,
      hoursPerChapter: hpc,
      left,
      learnHours: learn,
      reviewHours: rev,
      chart: {
        type: 'bar',
        title: 'Chapters finished by the end of each day',
        categories: cumulative.map((_, i) => `Day ${i + 1}`),
        format: { format: 'number', precision: 1 },
        series: [{ name: 'Chapters finished', values: cumulative }],
      },
      steps: [
        `Chapters left: ${fmt(chapters)} − ${fmt(done)} = ${fmt(left)}`,
        `Per day: ${fmt(left)} ÷ ${fmt(days)} = ${fmt(perDay, 2)}`,
        `Learning hours: ${fmt(hours, 1)} × ${fmt(days)} × ${fmt(1 - review, 2)} = ${fmt(learn, 1)}`,
        `Hours per chapter: ${fmt(learn, 1)} ÷ ${fmt(left)} = ${fmt(hpc, 2)}`,
      ],
      tone: hpc >= 1 ? 'good' : 'ok',
      badge: hpc >= 1 ? 'Doable' : 'Tight',
      note: hpc >= 1
        ? `About ${fmt(perDay, 2)} chapters a day, with ${fmt(hpc, 2)} hours on each and ${fmt(rev, 1)} hours kept for review.`
        : `Under an hour per chapter (${fmt(hpc, 2)} h). Add study hours or days, or cut the review share, if the material is new to you.`,
    };
  },
  content: {
    formula: [
      'Chapters left = total chapters − finished chapters',
      'Chapters per day = chapters left ÷ days',
      'Learning hours = hours per day × days × (1 − review share)',
      'Hours per chapter = learning hours ÷ chapters left',
    ],
    body: [
      'Finals feel impossible mostly because the work is a blur. This planner turns it into two numbers: how many chapters to cover each day, and how many hours each one gets.',
      'Enter the days left, how many chapters or topics the exam covers, how many you already know and how many hours a day you can study. A share of your time is held back for review and practice questions; 20% is a common starting point, but it is only an assumption, so change it to suit you.',
      'The result is an even split. Hard chapters deserve more time than easy ones, so treat hours per chapter as an average. Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'Making the plan hold up',
        paragraphs: [
          'Start with the weakest chapters while you still have days to spare, and keep the last day light. If the hours per chapter come out low, the fix is rarely heroic all-nighters: add a short daily session, drop topics the exam is unlikely to stress, or ask the instructor what is covered.',
        ],
      },
    ],
    faq: [
      { q: 'How do you work out the study plan?', a: 'Chapters left divided by days gives chapters per day. Hours per day times days, minus the review share, divided by chapters left gives hours per chapter.' },
      { q: 'What does 10 days, 12 chapters, 2 done, 3 hours a day and 20% review give?', a: 'You have 10 chapters left, so 1 a day. Learning time is 3 × 10 × 0.8 = 24 hours, so 2.4 hours per chapter, with 6 hours for review.' },
      { q: 'Is 20% for review the right figure?', a: 'It is only a planning assumption. Use more if the exam is practice-question heavy and less if you are mostly learning new material.' },
      { q: 'Does it account for how hard each chapter is?', a: 'No. It splits time evenly. Move time towards your weakest chapters yourself.' },
    ],
  },
  related: ['final-grade', 'gpa', 'weighted-grade', 'test-grade', 'time-duration'],
  examples: [
    // left 10; perDay 1; learn 3*10*0.8 = 24; hpc 2.4; review 6
    { values: { days: 10, chapters: 12, done: 2, hours: 3, review: 20 }, expect: { left: 10, perDay: 1, hoursPerChapter: 2.4, learnHours: 24, reviewHours: 6 }, tolerance: 1e-9 },
    // left 10; perDay 2; learn 4*5 = 20; hpc 2
    { values: { days: 5, chapters: 10, done: 0, hours: 4, review: 0 }, expect: { left: 10, perDay: 2, hoursPerChapter: 2, learnHours: 20, reviewHours: 0 }, tolerance: 1e-9 },
    // left 10; perDay 10/7; learn 2*7*0.5 = 7; hpc 0.7
    { values: { days: 7, chapters: 14, done: 4, hours: 2, review: 50 }, expect: { left: 10, perDay: 10 / 7, hoursPerChapter: 0.7, learnHours: 7, reviewHours: 7 }, tolerance: 1e-9 },
  ],
});
