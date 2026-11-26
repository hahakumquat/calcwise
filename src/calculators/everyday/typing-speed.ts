import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'typing-speed',
  title: 'Typing Speed (WPM) Calculator',
  category: 'everyday',
  description: 'Work out your typing speed in words per minute from characters typed, time and errors. See gross WPM, net WPM and accuracy using the 5-characters-per-word rule.',
  keywords: ['typing speed calculator', 'wpm calculator', 'words per minute calculator', 'net wpm', 'gross wpm', 'typing accuracy calculator', 'typing test score'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'chars', label: 'Characters typed', type: 'number', default: 1500, min: 0, step: 1, info: 'Everything you typed, including spaces and punctuation.' },
    { id: 'minutes', label: 'Time taken', type: 'number', default: 5, min: 0, step: 0.5, suffix: 'minutes', info: 'How long the test ran, in minutes.' },
    { id: 'errors', label: 'Uncorrected errors', type: 'number', default: 8, min: 0, step: 1, info: 'Mistakes left in the final text. Corrected typos are not counted here.' },
  ],
  outputs: [
    { id: 'net', label: 'Net WPM', format: 'number', precision: 1, primary: true, suffix: ' WPM', info: 'Gross WPM minus errors per minute, never below 0.' },
    { id: 'gross', label: 'Gross WPM', format: 'number', precision: 1, suffix: ' WPM', info: 'Characters ÷ 5 ÷ minutes.' },
    { id: 'accuracy', label: 'Accuracy', format: 'percent', precision: 1, info: '1 − errors ÷ words typed, never below 0.' },
    { id: 'words', label: 'Words typed', format: 'number', precision: 1, info: 'Characters ÷ 5.' },
  ],
  compute: (v) => {
    const chars = num(v.chars), minutes = num(v.minutes), errors = num(v.errors);
    if ([chars, minutes, errors].some((x) => x === null)) return { net: null };
    if (chars! <= 0 || minutes! <= 0 || errors! < 0) return { net: null };
    const words = chars! / 5;
    const gross = words / minutes!;
    const net = Math.max(0, gross - errors! / minutes!);
    const accuracy = Math.max(0, 1 - errors! / words);
    if (![words, gross, net, accuracy].every(Number.isFinite)) return { net: null };
    return {
      net,
      gross,
      accuracy,
      words,
      tone: 'ok',
      badge: `${fmt(net)} net WPM, ${fmt(accuracy * 100)}% accurate`,
      note: `You typed ${fmt(chars!, 0)} characters, or ${fmt(words)} words at 5 characters per word, in ${fmt(minutes!, 1)} minutes. That is ${fmt(gross)} gross WPM. With ${fmt(errors!, 0)} uncorrected ${errors === 1 ? 'error' : 'errors'}, your net speed is ${fmt(net)} WPM and your accuracy is ${fmt(accuracy * 100)}%. Test sites differ in how they count errors, so scores will not match exactly.`,
      chart: {
        type: 'bar',
        title: 'Words per minute',
        categories: ['Gross WPM', 'Net WPM'],
        series: [{ name: 'WPM', values: [gross, net] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Words = ${fmt(chars!, 0)} ÷ 5 = ${fmt(words)}`,
        `Gross WPM = ${fmt(words)} ÷ ${fmt(minutes!, 1)} = ${fmt(gross)}`,
        `Net WPM = ${fmt(gross)} − ${fmt(errors!, 0)} ÷ ${fmt(minutes!, 1)} = ${fmt(net)}`,
        `Accuracy = 1 − ${fmt(errors!, 0)} ÷ ${fmt(words)} = ${fmt(accuracy * 100)}%`,
      ],
    };
  },
  content: {
    formula: [
      'Words = characters typed ÷ 5',
      'Gross WPM = words ÷ minutes',
      'Net WPM = gross WPM − uncorrected errors ÷ minutes',
      'Accuracy = 1 − uncorrected errors ÷ words',
    ],
    body: [
      'Typing speed is measured in words per minute (WPM). Because words vary in length, tests use a standard word of 5 characters, counting letters, spaces and punctuation. Gross WPM is your raw speed. Net WPM subtracts a penalty of one word for each uncorrected error, so it rewards clean typing.',
      'Example: you type 1,500 characters in 5 minutes with 8 uncorrected errors. That is 300 words, so gross speed is 60 WPM. The errors cost 8 ÷ 5 = 1.6 WPM, so net speed is 58.4 WPM, and accuracy is 292 ÷ 300 = 97.3%.',
      'Conventions differ between typing test sites. Some count errors per word instead of per character, some count only corrected keystrokes, and some round differently. Use the same method each time when you track progress.',
      'To plan a longer job, divide the words by your speed. For example, 1,000 words at 40 WPM takes 25 minutes. To count the words in a text, try the word counter.',
      'Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How is WPM calculated?', a: 'Divide characters typed by 5 to get words, then divide by minutes. 1,500 characters in 5 minutes is 300 words, or 60 gross WPM.' },
      { q: 'What is the difference between gross and net WPM?', a: 'Gross WPM is raw speed. Net WPM subtracts uncorrected errors per minute. With 8 errors over 5 minutes, 60 gross WPM becomes 58.4 net WPM.' },
      { q: 'How is typing accuracy calculated?', a: 'One minus errors divided by words typed. 8 errors in 300 words gives 292 ÷ 300 = 97.3% accuracy.' },
      { q: 'Why does my score differ on another typing test?', a: 'Sites use different rules for counting errors, corrections and word length. This calculator uses the common 5-characters-per-word convention and counts only uncorrected errors.' },
      { q: 'How long will it take to type 1,000 words?', a: 'Divide words by your speed. At 40 WPM, 1,000 words takes 25 minutes.' },
    ],
    sources: [],
  },
  related: ['word-counter', 'practice-hours-goal', 'time-duration'],
  examples: [
    // words 1500/5 = 300; gross 300/5 = 60; net 60 - 8/5 = 58.4; accuracy (300-8)/300 = 0.97333
    { values: { chars: 1500, minutes: 5, errors: 8 }, expect: { words: 300, gross: 60, net: 58.4, accuracy: 0.9733 }, tolerance: 0.001 },
    // words 2400/5 = 480; gross 480/10 = 48; net 48; accuracy 1
    { values: { chars: 2400, minutes: 10, errors: 0 }, expect: { words: 480, gross: 48, net: 48, accuracy: 1 }, tolerance: 0.001 },
  ],
});
