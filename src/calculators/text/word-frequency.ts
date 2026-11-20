import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { bar, charts, on, str, words } from '../../lib/helpers/text';

const TOP = 20;

export default defineCalculator({
  slug: 'word-frequency',
  title: 'Word Frequency Counter',
  category: 'text',
  description: 'Paste any text to see how many times each word appears, ranked from most to least used, with unique word count and a chart. Runs in your browser.',
  keywords: ['word frequency counter', 'word frequency', 'count word occurrences', 'repeated words checker', 'most used words', 'word count by word', 'keyword density'],
  updated: '2026-11-20',
  layout: 'wide',
  inputs: [
    {
      id: 'text', label: 'Your text', type: 'textarea', rows: 10, placeholder: 'Type or paste your text here…',
      info: 'Paste the text to analyse. Every word is counted live in your browser and nothing is uploaded.',
      default: 'the cat and the hat and the bat',
    },
    { id: 'ignoreCase', label: 'Ignore case', type: 'toggle', default: true, info: 'On: "The" and "the" count as the same word. Off: they are counted separately.' },
    { id: 'minLength', label: 'Minimum word length', type: 'number', default: 1, min: 1, max: 20, step: 1, suffix: 'letters', optional: true, info: 'Skip words shorter than this. Set 4 to ignore "the", "and", "a" and similar short words. Leave at 1 to count everything.' },
  ],
  outputs: [
    { id: 'total', label: 'Words counted', format: 'integer', primary: true, info: 'Every word that meets the minimum length, repeats included.' },
    { id: 'unique', label: 'Unique words', format: 'integer', info: 'How many different words appear.' },
    { id: 'topWord', label: 'Most used word', format: 'text', info: 'The word that appears most often. Ties go to the alphabetically first word.' },
    { id: 'table', label: `Top ${TOP} words`, format: 'code', info: `Words ranked by count, with each word's share of all words counted. Ties are listed alphabetically.` },
  ],
  compute: (v) => {
    const text = str(v.text);
    const fold = on(v.ignoreCase);
    const min = num(v.minLength) ?? 1;
    if (min < 1 || !Number.isInteger(min)) return { total: null, error: 'Minimum word length must be a whole number of 1 or more.' };

    const list = words(text)
      .map((w) => (fold ? w.toLowerCase().replace(/’/g, "'") : w.replace(/’/g, "'")))
      .filter((w) => Array.from(w).length >= min);
    const freq = new Map<string, number>();
    for (const w of list) freq.set(w, (freq.get(w) ?? 0) + 1);
    const ranked = [...freq].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const top = ranked.slice(0, TOP);
    const total = list.length;

    const width = Math.max(0, ...top.map(([w]) => Array.from(w).length));
    const table = top
      .map(([w, c], i) => `${String(i + 1).padStart(2)}. ${w.padEnd(width)}  ${String(c).padStart(5)}  ${((c / total) * 100).toFixed(1)}%`)
      .join('\n');

    return {
      total,
      unique: ranked.length,
      topWord: top.length ? `${top[0][0]} (${top[0][1]}×)` : '—',
      table: table || '—',
      chart: charts(bar('Most used words', top.slice(0, 10).map((t) => t[0]), top.slice(0, 10).map((t) => t[1]), { name: 'Times used', horizontal: true })),
      tone: 'ok',
      badge: `${total.toLocaleString('en-US')} words, ${ranked.length.toLocaleString('en-US')} unique`,
      note: 'This counts every word, including common ones like "the". Raise the minimum word length to hide short filler words.',
    };
  },
  content: {
    formula: [
      'Share of text = times a word appears ÷ total words counted × 100',
      'Unique words = number of different words after case and length rules',
    ],
    body: [
      'Paste text and the calculator lists every word with how often it appears, ranked from most to least used. It also shows the total words counted, how many are unique, and a chart of the ten most common words.',
      'A word is a run of letters or digits. Contractions like "don\'t" and hyphenated words like "well-known" count as one word. Turn off "Ignore case" to treat "Apple" and "apple" as different words, or raise the minimum word length to skip short filler words.',
      'It is useful for spotting overused words in an essay, checking which terms dominate a page of copy, or finding the repeated words in a transcript. Nothing leaves your browser.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'The text "the cat and the hat and the bat" has 8 words and 5 unique words. "the" appears 3 times (37.5%), "and" twice (25%), and "bat", "cat" and "hat" once each (12.5% each).',
        ],
      },
    ],
    faq: [
      { q: 'How do I count how many times a word appears?', a: 'Paste your text and find the word in the ranked list. For "the cat and the hat and the bat", "the" appears 3 times and "and" appears 2 times.' },
      { q: 'What is the difference between total words and unique words?', a: 'Total counts every word including repeats. Unique counts each different word once. The example sentence has 8 total words and 5 unique words.' },
      { q: 'Does it treat "The" and "the" as the same word?', a: 'Yes by default. Turn off Ignore case to count them separately.' },
      { q: 'How do I hide words like "the" and "and"?', a: 'Set the minimum word length to 4. Words shorter than that are skipped and also left out of the totals.' },
      { q: 'Is this the same as keyword density?', a: 'The share column is each word\'s count divided by all words counted, which is the usual definition of keyword density for single words.' },
    ],
  },
  related: ['word-counter', 'character-counter', 'remove-duplicate-lines', 'sort-lines'],
  examples: [
    // the 3, and 2, bat/cat/hat 1 each; 8 words, 5 unique.
    { values: { text: 'the cat and the hat and the bat', ignoreCase: 'on', minLength: 1 }, expect: { total: 8, unique: 5, topWord: 'the (3×)' } },
    // Case folded: "The" + "the" + "THE" = 3 of the; case sensitive gives 3 separate words, all unique.
    { values: { text: 'The the THE', ignoreCase: 'on', minLength: 1 }, expect: { total: 3, unique: 1, topWord: 'the (3×)' } },
    { values: { text: 'The the THE', ignoreCase: 'off', minLength: 1 }, expect: { total: 3, unique: 3, topWord: 'THE (1×)' } },
    // minLength 4 drops "the", "cat", "and", "hat", "bat" -> only "bird" and "birds" remain.
    { values: { text: 'the bird and the birds', ignoreCase: 'on', minLength: 4 }, expect: { total: 2, unique: 2, topWord: 'bird (1×)' } },
  ],
});
