import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const bandFor = (e: number) =>
  e >= 90 ? 'Very easy' : e >= 80 ? 'Easy' : e >= 70 ? 'Fairly easy' : e >= 60 ? 'Plain English' : e >= 50 ? 'Fairly difficult' : e >= 30 ? 'Difficult' : 'Very difficult';

export default defineCalculator({
  slug: 'flesch-reading-ease',
  title: 'Flesch Reading Ease and Grade Calculator',
  category: 'text',
  description: 'Calculate the Flesch reading ease score and Flesch-Kincaid grade level from your word, sentence and syllable counts, with the standard readability bands.',
  keywords: ['flesch reading ease calculator', 'flesch kincaid grade level', 'readability score', 'reading level calculator', 'readability formula', 'plain english score'],
  updated: '2026-11-28',
  layout: 'wide',
  inputs: [
    { id: 'words', label: 'Words', type: 'number', default: 100, min: 1, step: 1, info: 'Total words in your passage. A word counter can give you this.' },
    { id: 'sentences', label: 'Sentences', type: 'number', default: 5, min: 1, step: 1, info: 'Total sentences in your passage.' },
    { id: 'syllables', label: 'Syllables', type: 'number', default: 130, min: 1, step: 1, info: 'Total syllables in your passage. You count these yourself, because this calculator does not read your text. It must be at least the number of words.' },
  ],
  outputs: [
    { id: 'ease', label: 'Flesch reading ease', primary: true, precision: 2, info: 'Higher is easier. About 60 to 70 is plain English; under 30 is very difficult. The bands are approximate.' },
    { id: 'grade', label: 'Flesch-Kincaid grade level', precision: 2, info: 'An approximate US school grade needed to follow the text.' },
    { id: 'band', label: 'Reading ease band', format: 'text', info: 'The standard description for your ease score. Approximate.' },
    { id: 'wps', label: 'Words per sentence', precision: 2, info: 'Words divided by sentences.' },
    { id: 'spw', label: 'Syllables per word', precision: 2, info: 'Syllables divided by words.' },
  ],
  compute: (v) => {
    const w = num(v.words);
    const s = num(v.sentences);
    const y = num(v.syllables);
    if (w === null || s === null || y === null || w <= 0 || s <= 0 || y <= 0 || y < w) return { ease: null };
    const wps = w / s;
    const spw = y / w;
    const ease = 206.835 - 1.015 * wps - 84.6 * spw;
    const grade = 0.39 * wps + 11.8 * spw - 15.59;
    const band = bandFor(ease);
    return {
      ease,
      grade,
      band,
      wps,
      spw,
      tone: ease >= 60 ? 'good' : ease >= 30 ? 'ok' : 'warn',
      badge: band,
      note: 'Scores are approximate and suit English prose only. Very short passages give noisy results.',
      chart: {
        type: 'scale',
        title: 'Reading ease scale',
        min: 0,
        max: 100,
        value: Math.max(0, Math.min(100, ease)),
        valueLabel: ease.toFixed(1),
        bands: [
          { from: 0, to: 30, label: 'Very difficult', tone: 'bad' },
          { from: 30, to: 50, label: 'Difficult', tone: 'warn' },
          { from: 50, to: 60, label: 'Fairly difficult', tone: 'warn' },
          { from: 60, to: 70, label: 'Plain English', tone: 'ok' },
          { from: 70, to: 80, label: 'Fairly easy', tone: 'good' },
          { from: 80, to: 90, label: 'Easy', tone: 'good' },
          { from: 90, to: 100, label: 'Very easy', tone: 'good' },
        ],
        format: { format: 'integer' },
      },
      steps: [
        `Words per sentence = ${w} ÷ ${s} = ${wps.toFixed(2)}`,
        `Syllables per word = ${y} ÷ ${w} = ${spw.toFixed(3)}`,
        `Ease = 206.835 − 1.015 × ${wps.toFixed(2)} − 84.6 × ${spw.toFixed(3)} = ${ease.toFixed(2)}`,
        `Grade = 0.39 × ${wps.toFixed(2)} + 11.8 × ${spw.toFixed(3)} − 15.59 = ${grade.toFixed(2)}`,
      ],
    };
  },
  content: {
    formula: ['Reading ease = 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words)', 'Grade level = 0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59'],
    body: [
      'The Flesch reading ease score rates how easy English text is to read, using only the average sentence length and the average number of syllables per word. Shorter sentences and shorter words push the score up. The Flesch-Kincaid grade level uses the same two ratios to estimate the US school grade needed to follow the text.',
      'Enter your word, sentence and syllable counts. This calculator does not read your text, so counting syllables is up to you; a word counter helps with the words and sentences. The syllable count cannot be lower than the word count.',
      'Approximate bands: 90 and above is very easy, 80 to 90 easy, 70 to 80 fairly easy, 60 to 70 plain English, 50 to 60 fairly difficult, 30 to 50 difficult, and under 30 very difficult. The formulas were designed for English prose, so they are unreliable for other languages, poetry, lists or code.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A passage of 100 words, 5 sentences and 130 syllables averages 20 words per sentence and 1.3 syllables per word. Ease = 206.835 − 20.3 − 109.98 = 76.56, which is fairly easy. Grade = 7.8 + 15.34 − 15.59 = 7.55, roughly a seventh to eighth grade reading level.',
        ],
      },
    ],
    faq: [
      { q: 'What is a good Flesch reading ease score?', a: 'For general audiences, 60 to 70 (plain English) or higher is a common aim. Under 30 is very difficult, typical of academic or legal writing. The bands are approximate.' },
      { q: 'What does 100 words, 5 sentences and 130 syllables score?', a: 'The reading ease is 76.56 (fairly easy) and the Flesch-Kincaid grade level is 7.55.' },
      { q: 'How do I count syllables?', a: 'Count them yourself by tapping out each word, or use another tool. This calculator only does the arithmetic with the counts you enter.' },
      { q: 'Does it work for other languages?', a: 'No. The constants were fitted to English, so scores for other languages are not meaningful.' },
    ],
    sources: [
      { label: 'Flesch, R. (1948). A new readability yardstick. Journal of Applied Psychology, 32(3), 221-233' },
      { label: 'Kincaid, J. P., Fishburne, R. P., Rogers, R. L., Chissom, B. S. (1975). Derivation of new readability formulas for Navy enlisted personnel. Naval Technical Training Command Research Branch Report 8-75' },
    ],
  },
  related: ['word-counter', 'character-counter', 'speech-length'],
  examples: [
    // wps = 20, spw = 1.3: 206.835 − 20.3 − 109.98 = 76.555; grade 7.8 + 15.34 − 15.59 = 7.55
    { values: { words: 100, sentences: 5, syllables: 130 }, expect: { ease: 76.555, grade: 7.55, band: 'Fairly easy', wps: 20, spw: 1.3 }, tolerance: 1e-6 },
    // wps = 10, spw = 1.0: 206.835 − 10.15 − 84.6 = 112.085; grade 3.9 + 11.8 − 15.59 = 0.11
    { values: { words: 50, sentences: 5, syllables: 50 }, expect: { ease: 112.085, grade: 0.11, band: 'Very easy' }, tolerance: 1e-6 },
    // wps = 25, spw = 2.0: 206.835 − 25.375 − 169.2 = 12.26; grade 9.75 + 23.6 − 15.59 = 17.76
    { values: { words: 100, sentences: 4, syllables: 200 }, expect: { ease: 12.26, grade: 17.76, band: 'Very difficult' }, tolerance: 1e-6 },
  ],
});
