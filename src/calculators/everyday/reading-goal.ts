import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'reading-goal',
  title: 'Reading Goal Calculator: Pages Per Day',
  category: 'everyday',
  description: 'Turn a yearly reading goal into pages and minutes per day. Enter books, pages per book, days left and books finished to see the daily pace you need.',
  keywords: ['reading goal calculator', 'pages per day calculator', 'how many pages a day to read 24 books', 'reading challenge calculator', 'book goal tracker'],
  updated: '2026-11-20',
  inputs: [
    { id: 'goal', label: 'Books goal', type: 'number', default: 24, min: 1, step: 1, info: 'How many books you want to finish in total for the goal period.' },
    { id: 'pages', label: 'Average pages per book', type: 'number', default: 300, min: 1, info: 'A typical novel is 250–400 pages. Use your own average if you know it.' },
    { id: 'days', label: 'Days left in the goal', type: 'number', default: 365, min: 1, step: 1, info: 'Days from today until the end of your goal. A full year is 365.' },
    { id: 'done', label: 'Books already finished', type: 'number', default: 0, min: 0, step: 1, info: 'Books you have already read toward this goal.' },
    { id: 'speed', label: 'Reading speed (assumption)', type: 'number', suffix: 'pages/hour', default: 40, min: 1, info: 'An assumption, not a measurement: many adults read roughly 30–60 pages an hour. Time yourself for a real number.' },
  ],
  outputs: [
    { id: 'perDay', label: 'Pages per day', format: 'number', precision: 1, suffix: 'pages', primary: true, info: 'Pages you need to read each day to finish on time.' },
    { id: 'minutes', label: 'Minutes per day', format: 'number', precision: 1, suffix: 'min', info: 'Pages per day divided by your reading speed, times 60.' },
    { id: 'pagesLeft', label: 'Pages left', format: 'integer', info: 'Books still to read times pages per book.' },
    { id: 'booksLeft', label: 'Books left', format: 'integer', info: 'Goal minus books already finished.' },
  ],
  compute: (v) => {
    const goal = num(v.goal);
    const pages = num(v.pages);
    const days = num(v.days);
    const done = num(v.done) ?? 0;
    const speed = num(v.speed);
    if (goal === null || pages === null || days === null || speed === null || goal <= 0 || pages <= 0 || days <= 0 || speed <= 0 || done < 0) {
      return { perDay: null };
    }
    const left = Math.max(0, goal - done);
    const pagesLeft = left * pages;
    const perDay = pagesLeft / days;
    const minutes = (perDay / speed) * 60;
    const donePages = Math.min(done, goal) * pages;
    return {
      perDay,
      minutes,
      pagesLeft,
      booksLeft: left,
      tone: 'ok',
      badge: left === 0 ? 'Goal reached' : `${Math.round(minutes)} min a day`,
      chart: {
        type: 'donut',
        title: 'Pages in your goal',
        format: { format: 'integer', suffix: 'pages' },
        slices: [
          { label: 'Already read', value: donePages },
          { label: 'Still to read', value: pagesLeft },
        ],
        centerValue: `${Math.round(perDay * 10) / 10}`,
        centerLabel: 'pages a day',
      },
      steps: [
        `Books left = ${goal} − ${done} = ${left}`,
        `Pages left = ${left} × ${pages} = ${pagesLeft}`,
        `Pages per day = ${pagesLeft} ÷ ${days} = ${perDay.toFixed(2)}`,
        `Minutes per day = ${perDay.toFixed(2)} ÷ ${speed} × 60 = ${minutes.toFixed(1)}`,
      ],
      note: left === 0 ? 'You have already reached your goal.' : `About ${perDay.toFixed(1)} pages, or ${minutes.toFixed(0)} minutes, a day at ${speed} pages an hour.`,
    };
  },
  content: {
    formula: ['Pages left = (goal − finished) × pages per book', 'Pages per day = pages left ÷ days left', 'Minutes per day = pages per day ÷ pages per hour × 60'],
    body: [
      'Reading challenges feel big until you break them into a daily amount. Enter how many books you want to finish, how long the average book is and how many days remain, and the calculator gives the pages and minutes you need each day.',
      'Already started? Add the books you have finished and the pace is recalculated for what is left. If you are ahead of schedule the daily number drops; if you are behind it goes up.',
      'Reading speed is an assumption you can change. The default of 40 pages an hour is a rough middle for adult novels; dense non-fiction is slower and light fiction is often faster. Time yourself for one chapter to get a number that fits you.',
      'To see how much of the year is gone, try the year progress calculator.',
    ],
    faq: [
      { q: 'How many pages a day to read 24 books in a year?', a: 'At 300 pages a book, 24 books is 7,200 pages. Over 365 days that is 19.73 pages a day, about 29.6 minutes at 40 pages an hour.' },
      { q: 'I am partway through the goal. What now?', a: 'With 10 of 24 books done and 150 days left, 14 books × 300 pages = 4,200 pages, which is 28 pages a day.' },
      { q: 'Does an audiobook count?', a: 'Yes if you want it to. Set the pages-per-book to your usual length and the speed to however many pages that would be per hour of listening.' },
    ],
    sources: [],
  },
  related: ['year-progress', 'time-duration', 'date-difference'],
  examples: [
    // 24 x 300 = 7200; /365 = 19.7260; /40*60 = 29.589
    { values: { goal: 24, pages: 300, days: 365, done: 0, speed: 40 }, expect: { perDay: 7200 / 365, minutes: (7200 / 365 / 40) * 60, pagesLeft: 7200, booksLeft: 24 }, tolerance: 1e-6 },
    // 14 x 300 = 4200; /150 = 28
    { values: { goal: 24, pages: 300, days: 150, done: 10, speed: 40 }, expect: { perDay: 28, minutes: 42, pagesLeft: 4200 }, tolerance: 1e-9 },
    { values: { goal: 12, pages: 250, days: 30, done: 12, speed: 50 }, expect: { perDay: 0, booksLeft: 0 }, tolerance: 1e-9 },
  ],
});
