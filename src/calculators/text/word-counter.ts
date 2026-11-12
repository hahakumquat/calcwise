import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { STOP_WORDS, bar, charts, mixDonut, str, words } from '../../lib/helpers/text';

/** "3 min 20 sec", rounded to the nearest second. */
function duration(minutes: number): string {
  const total = Math.round(minutes * 60);
  if (total === 0) return '0 sec';
  const m = Math.floor(total / 60);
  const s = total % 60;
  return [m ? `${m} min` : '', s ? `${s} sec` : ''].filter(Boolean).join(' ');
}

function countSentences(text: string): number {
  return text
    .split(/(?<=[.!?…。！？]['"”’)\]]*)\s+|\n+/)
    .filter((seg) => words(seg).length > 0).length;
}

function countParagraphs(text: string): number {
  return text.split(/\n\s*\n/).filter((p) => p.trim()).length;
}

export default defineCalculator({
  slug: 'word-counter',
  title: 'Word Counter',
  category: 'text',
  description: 'Count words, characters, sentences and paragraphs, and estimate reading and speaking time for any text.',
  keywords: ['word count', 'count words', 'character count', 'essay word count', 'reading time', 'speech length'],
  popular: true,
  layout: 'wide',
  inputs: [
    {
      id: 'text', info: 'Paste or type the text you want to measure. Everything is counted live in your browser.',
      label: 'Your text',
      type: 'textarea',
      rows: 10,
      placeholder: 'Type or paste your text here…',
      default:
        'Good writing is clear before it is clever. Say what you mean in as few words as the idea needs, then stop.\n\nA word counter helps you hit a target without padding. Use it for essays, cover letters, product copy and social posts.',
    },
    { id: 'readWpm', info: 'How many words per minute you read silently. Around 240 is typical for adults reading everyday prose.', label: 'Reading speed', type: 'number', default: 238, min: 50, max: 1000, suffix: 'words/min', help: 'Typical silent reading for adults is 200–260.' },
    { id: 'speakWpm', info: 'How fast you talk when presenting. Most speakers land between 120 and 160 words per minute.', label: 'Speaking speed', type: 'number', default: 140, min: 50, max: 400, suffix: 'words/min', help: 'Presentations are usually 120–160.' },
  ],
  outputs: [
    { id: 'words', info: 'Runs of letters or digits. Contractions like "don\'t" and hyphenated words count as one word.', label: 'Words', format: 'integer', primary: true },
    { id: 'chars', info: 'Every character including spaces and line breaks. Emoji and accented letters count as one.', label: 'Characters', format: 'integer' },
    { id: 'charsNoSpaces', info: 'Characters with all spaces, tabs and line breaks removed.', label: 'Characters (no spaces)', format: 'integer' },
    { id: 'sentences', info: 'Text segments ending in . ! ? or … followed by a space, or ending at a line break.', label: 'Sentences', format: 'integer' },
    { id: 'paragraphs', info: 'Blocks of text separated by at least one blank line.', label: 'Paragraphs', format: 'integer' },
    { id: 'readingTime', info: 'Word count divided by your reading speed, rounded to the nearest second.', label: 'Reading time', format: 'text' },
    { id: 'speakingTime', info: 'Word count divided by your speaking speed — roughly how long reading it aloud takes.', label: 'Speaking time', format: 'text' },
    { id: 'topWord', label: 'Most used word', format: 'text', info: 'The most frequent word, ignoring very common words like "the" and "and". Handy for spotting repetition.' },
    { id: 'avgWordLength', info: 'Average number of letters and digits per word. Plain English usually averages 4–5.', label: 'Average word length', format: 'number', precision: 1, suffix: 'characters' },
  ],
  compute: (v) => {
    const text = str(v.text);
    const read = num(v.readWpm) ?? 238;
    const speak = num(v.speakWpm) ?? 140;
    if (read <= 0 || speak <= 0) return { words: null, error: 'Speeds must be greater than zero.' };
    const w = words(text);
    const chars = Array.from(text).length;
    const charsNoSpaces = Array.from(text.replace(/\s/g, '')).length;
    const letters = w.reduce((a, x) => a + Array.from(x).length, 0);
    const freq = new Map<string, number>();
    for (const x of w) {
      const k = x.toLowerCase().replace(/’/g, "'");
      if (!STOP_WORDS.has(k) && !/^\d+$/.test(k)) freq.set(k, (freq.get(k) ?? 0) + 1);
    }
    const top = [...freq].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);
    return {
      words: w.length,
      chars,
      charsNoSpaces,
      sentences: countSentences(text),
      paragraphs: countParagraphs(text),
      readingTime: duration(w.length / read),
      speakingTime: duration(w.length / speak),
      avgWordLength: w.length ? letters / w.length : 0,
      topWord: top.length ? `${top[0][0]} (${top[0][1]}×)` : '—',
      chart: charts(
        bar('Most used words', top.map((t) => t[0]), top.map((t) => t[1]), { name: 'Times used', horizontal: true }),
        mixDonut(text),
      ),
    };
  },
  content: {
    formula: ['Reading time = words ÷ reading speed (words per minute)', 'Speaking time = words ÷ speaking speed'],
    body: [
      'A word here is any run of letters or digits. Contractions like "don\'t" and hyphenated compounds like "well-known" count as one word, which matches how most word processors and school assignments count. Punctuation, emoji and stray symbols are not words.',
      'Sentences end at a period, question mark, exclamation mark or ellipsis followed by a space, or at a line break. Paragraphs are blocks separated by a blank line. Abbreviations such as "e.g." can add an extra sentence now and then, so treat the sentence count as a close estimate.',
      'Reading and speaking times use the speeds you set. Silent reading of everyday prose averages roughly 240 words per minute, while a relaxed talk runs closer to 130–150. Slow the speaking speed down if your audience is non-native or the topic is technical.',
      'Everything is counted in your browser as you type. Your text is never uploaded or stored.',
    ],
    faq: [
      { q: 'How many pages is 1,000 words?', a: 'About two pages single-spaced or four pages double-spaced in a 12-point font with standard margins. Font, spacing and headings change this a lot.' },
      { q: 'Do numbers count as words?', a: 'Yes. "2025" or "42" each count as one word, the same as in Microsoft Word and Google Docs.' },
      { q: 'Why does my word processor show a slightly different number?', a: 'Editors disagree on edge cases such as URLs, slashes ("and/or") and em-dashes without spaces. Differences are usually under one percent.' },
    ],
  },
  related: ['character-counter', 'case-converter', 'remove-duplicate-lines', 'lorem-ipsum'],
  examples: [
    {
      values: { text: "Hello world. It's a test!\n\nSecond paragraph here", readWpm: 200, speakWpm: 100 },
      expect: { topWord: 'hello (1×)', words: 8, chars: 48, charsNoSpaces: 40, sentences: 3, paragraphs: 2, readingTime: '2 sec', speakingTime: '5 sec' },
    },
    { values: { text: '', readWpm: 238, speakWpm: 140 }, expect: { words: 0, sentences: 0, paragraphs: 0 } },
  ],
});
