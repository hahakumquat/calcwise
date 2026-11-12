import { defineCalculator } from '../../lib/types';
import { bar, charts, on, splitLines, str } from '../../lib/helpers/text';

export default defineCalculator({
  slug: 'remove-duplicate-lines',
  title: 'Remove Duplicate Lines',
  category: 'text',
  description: 'Delete repeated lines from a list while keeping the first occurrence of each and the original order.',
  keywords: ['dedupe', 'deduplicate', 'unique lines', 'remove duplicates', 'distinct lines'],
  layout: 'wide',
  inputs: [
    { id: 'text', info: 'Your list, one item per line. The first copy of each line is kept and the original order is preserved.', label: 'Lines', type: 'textarea', rows: 10, default: 'apple\nbanana\nApple\napple\n\ncherry\nbanana \ncherry' },
    { id: 'trim', info: 'Ignore spaces at the start and end of each line when comparing, and remove them from the output.', label: 'Trim spaces before comparing', type: 'toggle', default: true },
    { id: 'ignoreCase', info: 'Treat lines that differ only in capitalisation as duplicates. The first spelling is kept.', label: 'Ignore case', type: 'toggle', default: false },
    { id: 'removeEmpty', info: 'Drop blank lines (including lines with only spaces) from the result.', label: 'Remove empty lines', type: 'toggle', default: true },
  ],
  outputs: [
    { id: 'result', info: 'Your list with duplicates removed, in the original order.', label: 'Unique lines', format: 'code', primary: true },
    { id: 'kept', info: 'How many lines are in the cleaned-up list.', label: 'Lines kept', format: 'integer' },
    { id: 'removed', info: 'How many lines were dropped as duplicates or blanks.', label: 'Lines removed', format: 'integer' },
  ],
  compute: (v) => {
    const text = str(v.text);
    if (!text) return { result: '', kept: 0, removed: 0 };
    const trim = on(v.trim);
    const lines = splitLines(text);
    const seen = new Set<string>();
    const out: string[] = [];
    let blanks = 0;
    for (const line of lines) {
      const shown = trim ? line.trim() : line;
      if (on(v.removeEmpty) && shown.trim() === '') {
        blanks++;
        continue;
      }
      const key = on(v.ignoreCase) ? shown.toLowerCase() : shown;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(shown);
    }
    const dupes = lines.length - out.length - blanks;
    return {
      result: out.join('\n'),
      kept: out.length,
      removed: lines.length - out.length,
      chart: charts(bar('What happened to each line', ['Kept', 'Duplicates removed', 'Blank lines removed'], [out.length, dupes, blanks], { name: 'Lines', horizontal: true })),
    };
  },
  content: {
    body: [
      'Paste a list with one item per line — email addresses, keywords, file names, log entries — and every repeat after the first is dropped. The surviving lines stay in their original order, so nothing gets shuffled the way a sort-and-dedupe would.',
      'With trimming on, "banana" and "banana " (with a trailing space) are treated as the same line, and the output is cleaned of leading and trailing spaces. Ignore case makes "Apple" and "apple" duplicates; the first spelling you wrote is the one kept. Removing empty lines also strips blank lines out of the result.',
      'The work happens entirely in your browser, so private lists never leave your device.',
    ],
    faq: [
      { q: 'Which copy of a duplicate is kept?', a: 'Always the first one. Later copies are removed, so the order of the remaining lines matches your original list.' },
      { q: 'How can I keep only lines that appear once?', a: 'This tool keeps one copy of every line. To find lines that are repeated, compare the "removed" count, or sort the list first with the Sort Lines tool so duplicates sit next to each other.' },
    ],
  },
  related: ['sort-lines', 'text-diff', 'find-and-replace', 'word-counter'],
  examples: [
    {
      values: { text: 'apple\nbanana\nApple\napple\n\ncherry\nbanana \ncherry', trim: 'on', ignoreCase: 'off', removeEmpty: 'on' },
      expect: { result: 'apple\nbanana\nApple\ncherry', kept: 4, removed: 4 },
    },
    {
      values: { text: 'apple\nApple\n\n\nx', trim: 'off', ignoreCase: 'on', removeEmpty: 'off' },
      expect: { result: 'apple\n\nx', kept: 3, removed: 2 },
    },
  ],
});
