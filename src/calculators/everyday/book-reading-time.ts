import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmtH = (hours: number) => {
  const m = Math.round(hours * 60);
  return `${Math.floor(m / 60)} h ${m % 60} min`;
};

export default defineCalculator({
  slug: 'book-reading-time',
  title: 'Book Reading Time Calculator',
  category: 'everyday',
  description: 'Find out how long a book takes to read from its page count and your reading speed, how many days to finish it, and how many books a year that pace gives.',
  keywords: ['book reading time calculator', 'how long to read a book', 'reading time by pages', 'words per minute reading', 'how many books can I read in a year', 'days to finish a book'],
  updated: '2026-11-28',
  inputs: [
    { id: 'pages', label: 'Pages in the book', type: 'number', default: 320, min: 1, step: 1, info: 'The page count of the book. A typical novel is 250 to 400 pages.' },
    { id: 'wpp', label: 'Words per page', type: 'number', default: 275, min: 1, step: 1, info: 'About 250 to 300 words per page is common for paperbacks. Small print or dense layouts hold more, children’s books far fewer.' },
    { id: 'wpm', label: 'Reading speed', type: 'number', suffix: 'words/min', default: 238, min: 1, step: 1, info: 'The default of 238 words per minute is a commonly cited average for adult silent reading of nonfiction. Fiction is often a little faster, technical text slower. Time yourself for a better number.' },
    { id: 'perDay', label: 'Minutes you read per day', type: 'number', suffix: 'min', default: 30, min: 1, step: 1, info: 'How much time you can set aside for reading each day.' },
    { id: 'target', label: 'Books per year target (optional)', type: 'number', optional: true, min: 1, step: 1, info: 'Leave blank to skip. If you enter a goal, the result shows the daily minutes it would need at this book length and speed.' },
  ],
  outputs: [
    { id: 'hours', label: 'Total reading time', primary: true, precision: 2, suffix: 'hours', info: 'Words in the book divided by your reading speed, in hours.' },
    { id: 'words', label: 'Words in the book', format: 'integer', info: 'Pages times words per page.' },
    { id: 'minutes', label: 'Total reading time in minutes', precision: 1, suffix: 'min', info: 'Words divided by words per minute.' },
    { id: 'days', label: 'Days to finish', format: 'integer', suffix: 'days', info: 'Total minutes divided by minutes per day, rounded up to whole days.' },
    { id: 'booksPerYear', label: 'Books per year at this pace', precision: 1, info: '365 times daily minutes divided by the minutes one book takes.' },
    { id: 'neededPerDay', label: 'Daily minutes needed for your target', precision: 1, suffix: 'min', info: 'Only shown when you enter a books-per-year target: target times minutes per book, divided by 365.' },
  ],
  compute: (v) => {
    const pages = num(v.pages);
    const wpp = num(v.wpp);
    const wpm = num(v.wpm);
    const perDay = num(v.perDay);
    const target = num(v.target);
    if (pages === null || wpp === null || wpm === null || perDay === null || pages <= 0 || wpp <= 0 || wpm <= 0 || perDay <= 0) return { hours: null };
    if (target !== null && target <= 0) return { hours: null };
    const words = pages * wpp;
    const minutes = words / wpm;
    const hours = minutes / 60;
    const days = Math.ceil(minutes / perDay);
    const booksPerYear = (365 * perDay) / minutes;
    const needed = target !== null ? (target * minutes) / 365 : null;
    return {
      hours,
      words,
      minutes,
      days,
      booksPerYear,
      neededPerDay: needed,
      tone: 'ok',
      badge: `${days} ${days === 1 ? 'day' : 'days'} at ${perDay} min`,
      note: `About ${fmtH(hours)} in total. Reading speed varies a lot by person and by text, so treat this as an estimate.`,
      chart: {
        type: 'bar',
        title: 'Days to finish at different daily reading times',
        categories: ['15 min', '30 min', '45 min', '60 min', '90 min'],
        series: [{ name: 'Days', values: [15, 30, 45, 60, 90].map((m) => Math.ceil(minutes / m)) }],
        format: { format: 'integer', suffix: 'days' },
      },
      steps: [
        `Words = ${pages} × ${wpp} = ${words}`,
        `Minutes = ${words} ÷ ${wpm} = ${minutes.toFixed(1)}; hours = ${hours.toFixed(2)}`,
        `Days = ceil(${minutes.toFixed(1)} ÷ ${perDay}) = ${days}`,
        `Books per year = 365 × ${perDay} ÷ ${minutes.toFixed(1)} = ${booksPerYear.toFixed(1)}`,
        ...(needed !== null ? [`Minutes per day for ${target} books = ${target} × ${minutes.toFixed(1)} ÷ 365 = ${needed.toFixed(1)}`] : []),
      ],
    };
  },
  content: {
    formula: ['Words = pages × words per page', 'Hours = words ÷ words per minute ÷ 60', 'Days = round up (minutes ÷ minutes per day)', 'Books per year = 365 × minutes per day ÷ minutes per book'],
    body: [
      'Enter the page count of a book and your reading speed to see how long it will take. The calculator turns pages into words, divides by your words per minute, and then tells you how many days you need at your daily reading time.',
      'The defaults are 275 words per page and 238 words per minute, a commonly cited average for adults reading nonfiction silently. Real speeds vary widely between people and between texts: a gripping thriller can go much faster than a dense textbook, and reading in a second language is slower. Time yourself over a few pages and type in your own number.',
      'The books-per-year figure assumes you read every day of the year for the same time. If you want a target, enter it and the calculator shows the daily minutes it would take. For planning a whole reading challenge, try the reading goal calculator.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A 320 page book at 275 words per page has 88,000 words. At 238 words per minute that is 88,000 ÷ 238 = 369.7 minutes, or 6.16 hours. Reading 30 minutes a day it takes 369.7 ÷ 30 = 12.3, so 13 days. At that pace you would finish 365 × 30 ÷ 369.7 = 29.6 books of this length in a year.',
        ],
      },
    ],
    faq: [
      { q: 'How long does it take to read a 320 page book?', a: 'At 275 words per page and 238 words per minute, a 320 page book has 88,000 words and takes about 369.7 minutes, or 6.16 hours.' },
      { q: 'How many days will that take at 30 minutes a day?', a: '369.7 minutes ÷ 30 minutes is 12.3, so you finish on day 13.' },
      { q: 'How many books a year is that?', a: 'Reading 30 minutes every day of the year gives 365 × 30 ÷ 369.7 = 29.6 books of that length.' },
      { q: 'Is 238 words per minute right for me?', a: 'It is a commonly cited average for adult silent reading of nonfiction, not a rule. Your speed depends on you and on the text, so change the field to match your own timing.' },
    ],
    sources: [
      { label: 'Brysbaert, M. (2019). How many words do we read per minute? A review and meta-analysis of reading rate. Journal of Memory and Language, 109' },
    ],
  },
  related: ['reading-goal', 'year-progress', 'word-counter'],
  examples: [
    // 320 × 275 = 88,000 words; 88,000 ÷ 238 = 369.7479 min = 6.16246 h; 369.7479 ÷ 30 = 12.32 → 13 days; 365 × 30 ÷ 369.7479 = 29.6148.
    { values: { pages: 320, wpp: 275, wpm: 238, perDay: 30 }, expect: { words: 88000, minutes: 88000 / 238, hours: 88000 / 238 / 60, days: 13, booksPerYear: (365 * 30 * 238) / 88000 }, tolerance: 1e-6 },
    // Target 52 books: 52 × 369.7479 ÷ 365 = 52.675 min per day.
    { values: { pages: 320, wpp: 275, wpm: 238, perDay: 30, target: 52 }, expect: { neededPerDay: (52 * 88000) / 238 / 365 }, tolerance: 1e-6 },
    // 100 × 300 = 30,000 words ÷ 250 = 120 min = 2 h; 60 per day = exactly 2 days.
    { values: { pages: 100, wpp: 300, wpm: 250, perDay: 60 }, expect: { hours: 2, days: 2 }, tolerance: 1e-9 },
  ],
});
