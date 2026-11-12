import { defineCalculator } from '../../lib/types';
import { charts, lineDiff, on, splitLines, str } from '../../lib/helpers/text';

const MAX_CELLS = 4_000_000;

export default defineCalculator({
  slug: 'text-diff',
  title: 'Text Diff Checker',
  category: 'text',
  description: 'Compare two blocks of text line by line and see exactly which lines were added, removed or left unchanged.',
  keywords: ['diff', 'compare text', 'diff checker', 'text compare', 'find differences', 'diff online'],
  layout: 'wide',
  inputs: [
    { id: 'a', info: 'The earlier or reference version. Lines that exist only here are shown with "- ".', label: 'Original text', type: 'textarea', mono: true, rows: 10, default: 'apples\nbananas\ncherries\ndates\nelderberries' },
    { id: 'b', info: 'The newer or edited version. Lines that exist only here are shown with "+ ".', label: 'Changed text', type: 'textarea', mono: true, rows: 10, default: 'apples\nblueberries\ncherries\ndates\nfigs\nelderberries' },
    { id: 'ignoreWs', info: 'Treat lines as equal when they differ only in indentation or trailing spaces.', label: 'Ignore leading/trailing whitespace', type: 'toggle', default: false },
    { id: 'ignoreCase', info: 'Treat "Hello" and "hello" as the same line.', label: 'Ignore case', type: 'toggle', default: false },
  ],
  outputs: [
    { id: 'diff', info: 'Every line of both texts in order: "+ " added, "- " removed, two spaces unchanged. An edited line appears as a removal then an addition.', label: 'Differences', format: 'code', primary: true, help: '"+ " added, "- " removed, two spaces unchanged.' },
    { id: 'added', info: 'Lines that appear in the changed text but not in the original.', label: 'Lines added', format: 'integer' },
    { id: 'removed', info: 'Lines from the original that are missing from the changed text.', label: 'Lines removed', format: 'integer' },
    { id: 'unchanged', info: 'Lines common to both versions, matched in order using the longest common subsequence.', label: 'Lines unchanged', format: 'integer' },
  ],
  compute: (v) => {
    const a = splitLines(str(v.a));
    const b = splitLines(str(v.b));
    const norm = (s: string) => {
      let t = on(v.ignoreWs) ? s.trim() : s;
      if (on(v.ignoreCase)) t = t.toLowerCase();
      return t;
    };
    if (a.length * b.length > MAX_CELLS) return { diff: null, error: 'Texts are too long to compare here (keep each under about 2,000 lines).' };
    // Diff on normalised lines, but print the original text.
    const ops = lineDiff(a.map(norm), b.map(norm));
    let ia = 0;
    let ib = 0;
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    const out = ops.map((o) => {
      if (o.op === '+') {
        added++;
        return '+ ' + b[ib++];
      }
      if (o.op === '-') {
        removed++;
        return '- ' + a[ia++];
      }
      unchanged++;
      ib++;
      return '  ' + a[ia++];
    });
    return {
      diff: out.join('\n'),
      added,
      removed,
      unchanged,
      note: added || removed ? `${added} added, ${removed} removed` : 'The texts are identical.',
      chart: charts({
        type: 'donut',
        title: 'Lines by change type',
        slices: [
          { label: 'Unchanged', value: unchanged },
          { label: 'Added', value: added },
          { label: 'Removed', value: removed },
        ],
        format: { format: 'integer' },
        centerLabel: 'lines',
        centerValue: String(added + removed + unchanged),
      }),
    };
  },
  content: {
    body: [
      'Paste the original on the left and the edited version on the right. The checker finds the longest sequence of lines the two versions share — the longest common subsequence — and reports everything else as an addition or a removal. This is the same idea behind the classic Unix diff tool and the "changes" view in Git.',
      'Lines starting with "+ " exist only in the changed text, lines with "- " exist only in the original, and lines indented by two spaces are identical in both. A line that was edited shows up as one removal followed by one addition.',
      'Turn on "ignore whitespace" to skip differences in indentation or trailing spaces, which is handy when comparing code reformatted by an editor. Both texts stay in your browser; nothing is uploaded.',
    ],
    faq: [
      { q: 'Can it highlight changes within a line?', a: 'This tool compares whole lines. For prose, put each sentence on its own line first to get a finer-grained comparison.' },
      { q: 'Why does a moved line show as removed and added?', a: 'A line diff only knows about order. When a line moves, the shortest description is to delete it in one place and insert it in another.' },
      { q: 'Is there a size limit?', a: 'Comparison time grows with the product of the two line counts, so very large files (thousands of lines each) are refused to keep your browser responsive.' },
    ],
  },
  related: ['remove-duplicate-lines', 'sort-lines', 'find-and-replace', 'json-formatter'],
  examples: [
    {
      values: { a: 'a\nb\nc', b: 'a\nc\nd', ignoreWs: 'off', ignoreCase: 'off' },
      expect: { diff: '  a\n- b\n  c\n+ d', added: 1, removed: 1, unchanged: 2 },
    },
    {
      values: { a: 'Hello\n  world', b: 'hello\nworld', ignoreWs: 'on', ignoreCase: 'on' },
      expect: { added: 0, removed: 0, unchanged: 2, diff: '  Hello\n    world' },
    },
  ],
});
