import { defineCalculator } from '../../lib/types';
import { bar, charts, on, randomInt, splitLines, str } from '../../lib/helpers/text';

const firstNumber = (s: string): number => {
  const m = s.replace(/,(?=\d{3}\b)/g, '').match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
};

export default defineCalculator({
  slug: 'sort-lines',
  title: 'Sort Lines',
  category: 'text',
  description: 'Sort lines of text alphabetically, in reverse, by length or by number — or reverse or shuffle their order.',
  keywords: ['alphabetize', 'sort alphabetically', 'sort list', 'a-z', 'shuffle lines', 'reverse lines', 'natural sort'],
  layout: 'wide',
  random: true,
  inputs: [
    {
      id: 'order', info: 'How to arrange the lines. Shuffle uses a secure random generator; press Regenerate for a new order.',
      label: 'Order',
      type: 'select',
      default: 'az',
      options: [
        { value: 'az', label: 'A → Z' },
        { value: 'za', label: 'Z → A' },
        { value: 'length', label: 'Shortest first' },
        { value: 'lengthDesc', label: 'Longest first' },
        { value: 'numeric', label: 'By number (smallest first)' },
        { value: 'reverse', label: 'Reverse current order' },
        { value: 'shuffle', label: 'Shuffle (random)' },
      ],
    },
    { id: 'text', info: 'The lines to sort, one item per line.', label: 'Lines', type: 'textarea', rows: 10, default: 'Pear\napple\nItem 10\nbanana\nItem 2\nCherry' },
    { id: 'ignoreCase', info: 'Sort "apple" and "Apple" together, the way a dictionary does, instead of putting all capitals first.', showWhen: { input: 'order', is: ['az', 'za', 'length', 'lengthDesc', 'numeric'] }, label: 'Ignore case', type: 'toggle', default: true },
    { id: 'natural', info: 'Compare numbers inside text by value, so "Item 2" comes before "Item 10".', showWhen: { input: 'order', is: ['az', 'za', 'length', 'lengthDesc'] }, label: 'Natural number order (2 before 10)', type: 'toggle', default: true },
    { id: 'removeEmpty', info: 'Drop blank lines before sorting so they do not collect at the top.', label: 'Remove empty lines', type: 'toggle', default: true },
  ],
  outputs: [
    { id: 'result', info: 'Your lines in the new order, ready to copy.', label: 'Sorted lines', format: 'code', primary: true },
    { id: 'count', info: 'Number of lines in the result.', label: 'Lines', format: 'integer' },
  ],
  compute: (v) => {
    let lines = splitLines(str(v.text));
    if (on(v.removeEmpty)) lines = lines.filter((l) => l.trim() !== '');
    const collator = new Intl.Collator('en', { numeric: on(v.natural), sensitivity: on(v.ignoreCase) ? 'base' : 'variant', caseFirst: 'upper' });
    const cmp = (a: string, b: string) => collator.compare(a, b) || (a < b ? -1 : a > b ? 1 : 0);
    const order = str(v.order) || 'az';
    let out: string[];
    switch (order) {
      case 'za':
        out = [...lines].sort((a, b) => cmp(b, a));
        break;
      case 'length':
        out = [...lines].sort((a, b) => a.length - b.length || cmp(a, b));
        break;
      case 'lengthDesc':
        out = [...lines].sort((a, b) => b.length - a.length || cmp(a, b));
        break;
      case 'numeric': {
        const key = (s: string) => firstNumber(s);
        out = [...lines].sort((a, b) => {
          const x = key(a);
          const y = key(b);
          if (Number.isNaN(x) && Number.isNaN(y)) return cmp(a, b);
          if (Number.isNaN(x)) return 1; // lines without numbers go last
          if (Number.isNaN(y)) return -1;
          return x - y || cmp(a, b);
        });
        break;
      }
      case 'reverse':
        out = [...lines].reverse();
        break;
      case 'shuffle':
        out = [...lines];
        for (let i = out.length - 1; i > 0; i--) {
          const j = randomInt(i + 1);
          [out[i], out[j]] = [out[j], out[i]];
        }
        break;
      default:
        out = [...lines].sort(cmp);
    }
    // Chart: how many lines start with each first character (A–Z, digits, other).
    const buckets = new Map<string, number>();
    for (const l of out) {
      const c = l.trim().charAt(0).toUpperCase();
      const k = /[A-Z]/.test(c) ? c : /\d/.test(c) ? '0–9' : c ? 'Other' : '(blank)';
      buckets.set(k, (buckets.get(k) ?? 0) + 1);
    }
    const keys = [...buckets.keys()].sort((a, b) => (a.length - b.length) || a.localeCompare(b));
    return {
      result: out.join('\n'),
      count: out.length,
      chart: charts(bar('Lines by first character', keys, keys.map((k) => buckets.get(k)!), { name: 'Lines' })),
    };
  },
  content: {
    body: [
      'Alphabetical sorting uses proper language-aware comparison, so accented letters sit next to their plain versions instead of after "z". With natural order on, numbers inside text are compared by value: "Item 2" comes before "Item 10", which a plain character-by-character sort gets wrong.',
      '"By number" looks for the first number in each line — including decimals, negatives and thousands separators like 1,250 — and sorts on that. Lines with no number go to the end. Length sorting counts characters and breaks ties alphabetically.',
      'Shuffle uses your browser\'s cryptographic random generator for a fair Fisher–Yates shuffle; press regenerate for a new order. All sorting happens on your device.',
    ],
    faq: [
      { q: 'Why does "Zebra" come before "apple" in some tools?', a: 'Simple sorts compare character codes, and every uppercase letter has a lower code than every lowercase one. With "ignore case" on, this tool sorts the way a dictionary does.' },
      { q: 'Can I sort and remove duplicates at once?', a: 'Sort here, then paste the result into the Remove Duplicate Lines tool. Because duplicates are now adjacent, they are also easy to spot by eye.' },
    ],
  },
  related: ['remove-duplicate-lines', 'text-diff', 'reverse-text', 'find-and-replace'],
  examples: [
    {
      values: { order: 'az', text: 'Pear\napple\nItem 10\nbanana\nItem 2\nCherry', ignoreCase: 'on', natural: 'on', removeEmpty: 'on' },
      expect: { result: 'apple\nbanana\nCherry\nItem 2\nItem 10\nPear', count: 6 },
    },
    { values: { order: 'za', text: 'b\na\nc', ignoreCase: 'on', natural: 'on', removeEmpty: 'on' }, expect: { result: 'c\nb\na' } },
    { values: { order: 'numeric', text: 'x 10\nno number\ny -2.5\nz 1,250', ignoreCase: 'on', natural: 'on', removeEmpty: 'on' }, expect: { result: 'y -2.5\nx 10\nz 1,250\nno number' } },
    { values: { order: 'length', text: 'ccc\na\nbb', ignoreCase: 'on', natural: 'on', removeEmpty: 'on' }, expect: { result: 'a\nbb\nccc' } },
    { values: { order: 'reverse', text: '1\n2\n\n3', ignoreCase: 'on', natural: 'on', removeEmpty: 'on' }, expect: { result: '3\n2\n1', count: 3 } },
    { values: { order: 'shuffle', text: '1\n2\n3\n4', ignoreCase: 'on', natural: 'on', removeEmpty: 'on' }, expect: { count: 4 } },
  ],
});
