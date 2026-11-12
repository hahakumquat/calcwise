import { defineCalculator } from '../../lib/types';
import { charts, mixDonut, splitLines, str } from '../../lib/helpers/text';

/** Splits into user-perceived characters so emoji and accented letters survive reversal. */
function graphemes(s: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment(s: string): Iterable<{ segment: string }> } }).Segmenter;
  if (Seg) return Array.from(new Seg(undefined, { granularity: 'grapheme' }).segment(s), (x) => x.segment);
  return Array.from(s);
}

export default defineCalculator({
  slug: 'reverse-text',
  title: 'Reverse Text',
  category: 'text',
  description: 'Reverse the characters, word order or line order of any text — emoji and accents stay intact.',
  keywords: ['backwards text', 'reverse string', 'mirror text', 'flip text', 'reverse words'],
  layout: 'wide',
  inputs: [
    {
      id: 'mode', info: 'What to reverse: every character, the order of words on each line, the spelling of each word, or the order of lines.',
      label: 'Reverse',
      type: 'select',
      default: 'chars',
      segmented: true,
      options: [
        { value: 'chars', label: 'Characters' },
        { value: 'words', label: 'Word order' },
        { value: 'eachWord', label: 'Each word' },
        { value: 'lines', label: 'Line order' },
      ],
    },
    { id: 'text', info: 'The text to reverse. Emoji, flags and accented letters are kept intact.', label: 'Text', type: 'textarea', rows: 6, default: 'Never odd or even. Café 👍🏽' },
  ],
  outputs: [{ id: 'result', info: 'Your text reversed in the chosen way, ready to copy.', label: 'Reversed', format: 'code', primary: true }],
  compute: (v) => {
    const text = str(v.text);
    const mode = str(v.mode) || 'chars';
    let result: string;
    if (mode === 'lines') result = splitLines(text).reverse().join('\n');
    else if (mode === 'words')
      result = splitLines(text)
        .map((l) => l.split(/(\s+)/).reverse().join(''))
        .join('\n');
    else if (mode === 'eachWord') result = text.replace(/\S+/g, (w) => graphemes(w).reverse().join(''));
    else result = graphemes(text).reverse().join('');
    const plain = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const isPal = mode === 'chars' && plain(text).length > 1 && plain(text) === plain(result);
    return { result, chart: charts(mixDonut(text)), note: isPal ? 'This text is a palindrome — it reads the same backwards.' : undefined };
  },
  content: {
    body: [
      'Reversing characters flips the entire text so the last character comes first. Unlike a naive string reversal, this tool keeps combined characters together: a skin-toned emoji, a flag or a letter with a separate accent mark stays one unit instead of turning into broken symbols.',
      'Word order keeps every word spelled normally but reverses their sequence on each line, while "each word" spells every word backwards but leaves them in place. Line order is handy for flipping a log file or a list so the newest entry is at the top.',
      'People use reversed text for puzzles, checking palindromes, quick obfuscation and testing how software handles unusual input. Everything runs in your browser.',
    ],
    faq: [
      { q: 'What is a palindrome?', a: 'A word or phrase that reads the same backwards, ignoring spaces, punctuation and case — like "level" or "Never odd or even". The tool tells you when your text is one.' },
      { q: 'Is reversed text the same as mirrored text?', a: 'Not quite. Reversing changes the order of characters; true mirror writing also flips each letter shape, which needs special Unicode look-alike characters.' },
    ],
  },
  related: ['case-converter', 'sort-lines', 'word-counter'],
  examples: [
    { values: { mode: 'chars', text: 'Hello, world' }, expect: { result: 'dlrow ,olleH' } },
    { values: { mode: 'chars', text: 'ab👍🏽c' }, expect: { result: 'c👍🏽ba' } },
    { values: { mode: 'words', text: 'one two  three' }, expect: { result: 'three  two one' } },
    { values: { mode: 'eachWord', text: 'abc def' }, expect: { result: 'cba fed' } },
    { values: { mode: 'lines', text: '1\n2\n3' }, expect: { result: '3\n2\n1' } },
  ],
});
