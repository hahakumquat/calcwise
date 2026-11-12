import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { bar, charts, on, str } from '../../lib/helpers/text';

const OPENING = 'lorem ipsum dolor sit amet consectetur adipiscing elit'.split(' ');
const WORDS = (
  'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco ' +
  'laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla ' +
  'pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum ' +
  'praesent luctus massa vitae tortor condimentum lacinia quisque sagittis purus faucibus ornare suspendisse felis ' +
  'donec pretium vulputate sapien nec morbi tristique senectus netus malesuada fames turpis egestas integer feugiat ' +
  'scelerisque varius viverra accumsan arcu cursus euismod mauris pellentesque habitant nunc mattis'
).split(' ');

/** Small seeded PRNG (mulberry32) so the same count always yields the same text. */
function prng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function generator(startLorem: boolean) {
  const rand = prng(20240101);
  const pick = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
  let opening = startLorem ? [...OPENING] : [];
  let last = '';
  const word = () => {
    if (opening.length) return opening.shift()!;
    let w: string;
    do w = WORDS[Math.floor(rand() * WORDS.length)];
    while (w === last);
    last = w;
    return w;
  };
  const sentence = (len = pick(7, 14)) => {
    const ws: string[] = [];
    const comma = len > 9 ? pick(3, len - 4) : -1;
    for (let i = 0; i < len; i++) ws.push(word() + (i === comma ? ',' : ''));
    return capFirst(ws.join(' ')) + '.';
  };
  const first = () => {
    // The classic opening is exactly one sentence.
    if (!opening.length) return sentence();
    const s = capFirst(OPENING.slice(0, 5).join(' ') + ', ' + OPENING.slice(5).join(' ')) + '.';
    opening = [];
    return s;
  };
  return { word, sentence, first, pick };
}

export default defineCalculator({
  slug: 'lorem-ipsum',
  title: 'Lorem Ipsum Generator',
  category: 'text',
  description: 'Generate lorem ipsum placeholder text by paragraphs, sentences or words for mockups and layouts.',
  keywords: ['placeholder text', 'dummy text', 'filler text', 'lipsum', 'lorem ipsum dolor'],
  layout: 'wide',
  inputs: [
    { id: 'count', info: 'How many paragraphs, sentences or words to generate (1 to 1,000).', label: 'How many', type: 'number', default: 3, min: 1, max: 1000, step: 1 },
    {
      id: 'unit', info: 'Whether the count above means paragraphs, sentences or individual words.',
      label: 'Of',
      type: 'select',
      default: 'paragraphs',
      segmented: true,
      options: [
        { value: 'paragraphs', label: 'Paragraphs' },
        { value: 'sentences', label: 'Sentences' },
        { value: 'words', label: 'Words' },
      ],
    },
    { id: 'startLorem', info: 'Begin with the classic "Lorem ipsum dolor sit amet, consectetur adipiscing elit." Turn off for less recognisable filler.', label: 'Start with "Lorem ipsum dolor sit amet…"', type: 'toggle', default: true },
  ],
  outputs: [
    { id: 'result', info: 'The generated placeholder text. The same settings always give the same text.', label: 'Placeholder text', format: 'code', primary: true },
    { id: 'words', info: 'Total words in the generated text.', label: 'Words', format: 'integer' },
    { id: 'chars', info: 'Total characters including spaces and paragraph breaks.', label: 'Characters', format: 'integer' },
  ],
  compute: (v) => {
    const n = num(v.count);
    if (n === null || n < 1 || !Number.isInteger(n)) return { result: null, error: 'Enter a whole number of at least 1.' };
    if (n > 1000) return { result: null, error: 'Please ask for 1,000 or fewer.' };
    const g = generator(on(v.startLorem));
    const unit = str(v.unit) || 'paragraphs';
    let result: string;
    if (unit === 'words') {
      const ws = Array.from({ length: n }, g.word);
      result = capFirst(ws.join(' ')) + '.';
    } else if (unit === 'sentences') {
      result = Array.from({ length: n }, (_, i) => (i === 0 ? g.first() : g.sentence())).join(' ');
    } else {
      const paras: string[] = [];
      for (let p = 0; p < n; p++) {
        const k = g.pick(4, 7);
        paras.push(Array.from({ length: k }, (_, i) => (p === 0 && i === 0 ? g.first() : g.sentence())).join(' '));
      }
      result = paras.join('\n\n');
    }
    const wc = (s: string) => s.split(/\s+/).filter(Boolean).length;
    let chart;
    if (unit === 'words') {
      const lens = new Map<number, number>();
      for (const w of result.replace(/[.,]/g, '').split(' ')) lens.set(w.length, (lens.get(w.length) ?? 0) + 1);
      const ks = [...lens.keys()].sort((a, b) => a - b);
      chart = bar('Word lengths', ks.map((k) => `${k} letters`), ks.map((k) => lens.get(k)!), { name: 'Words' });
    } else {
      const units = unit === 'sentences' ? result.split(/(?<=\.) /) : result.split('\n\n');
      const shown = units.slice(0, 30);
      chart = bar(unit === 'sentences' ? 'Words per sentence' : 'Words per paragraph', shown.map((_, i) => `${unit === 'sentences' ? 'S' : 'P'}${i + 1}`), shown.map(wc), { name: 'Words' });
    }
    return { result, words: wc(result), chars: result.length, chart: charts(chart) };
  },
  content: {
    body: [
      'Lorem ipsum is scrambled Latin that designers and developers drop into layouts before the real copy exists. Because it looks like natural language — varied word lengths, commas, sentences of different sizes — it shows how a design will really read without distracting anyone with meaning.',
      'The passage traces back to a philosophical work by Cicero from 45 BC, chopped up and altered by typesetters centuries later. The words are no longer proper Latin, which is exactly the point: readers cannot get pulled into the content.',
      'This generator is deterministic: the same settings always produce the same text, so screenshots and test fixtures stay stable between runs. Turn off the classic opening if you want the placeholder to look less obviously like lorem ipsum.',
    ],
    faq: [
      { q: 'Should I ship lorem ipsum to production?', a: 'No. Search engines treat it as low-quality content and it is easy to miss in reviews. Search your project for "lorem" before every release.' },
      { q: 'Why not just use real text?', a: 'Real copy makes reviewers read and comment on the words instead of the layout. Lorem ipsum keeps feedback focused on spacing, typography and hierarchy.' },
    ],
  },
  related: ['word-counter', 'character-counter', 'case-converter'],
  examples: [
    { values: { count: 5, unit: 'words', startLorem: 'on' }, expect: { result: 'Lorem ipsum dolor sit amet.', words: 5 } },
    { values: { count: 1, unit: 'sentences', startLorem: 'on' }, expect: { result: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', words: 8 } },
    { values: { count: 12, unit: 'words', startLorem: 'off' }, expect: { words: 12 } },
    { values: { count: 0, unit: 'words', startLorem: 'on' }, expect: { error: 'Enter a whole number of at least 1.' } },
  ],
});
