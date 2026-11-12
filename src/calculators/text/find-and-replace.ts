import { defineCalculator } from '../../lib/types';
import { bar, charts, escapeRegExp, on, str } from '../../lib/helpers/text';

export default defineCalculator({
  slug: 'find-and-replace',
  title: 'Find and Replace',
  category: 'text',
  description: 'Replace every occurrence of a word, phrase or regular expression in a block of text.',
  keywords: ['search and replace', 'replace text', 'regex replace', 'bulk replace', 'substitute'],
  layout: 'wide',
  inputs: [
    { id: 'text', info: 'The text to search in. Replacements happen in one pass over the whole text.', label: 'Text', type: 'textarea', rows: 8, default: 'Our colour palette uses a warm colour for headings and a cool colour for links.' },
    { id: 'find', info: 'The word, phrase or pattern to look for. In plain mode every character is matched literally.', label: 'Find', type: 'text', default: 'colour' },
    { id: 'replace', info: 'What to put in place of each match. Leave empty to delete the matches.', label: 'Replace with', type: 'text', default: 'color', optional: true, help: 'In regex mode, use $1, $2… for captured groups, $& for the whole match, and \\n for a line break.' },
    { id: 'regex', info: 'Treat the Find box as a JavaScript regular expression, so you can match patterns and reuse captured groups.', label: 'Regular expression', type: 'toggle', default: false },
    { id: 'caseSensitive', info: 'When on, "Colour" and "colour" are different. Turn off to match any capitalisation.', label: 'Case sensitive', type: 'toggle', default: true },
    { id: 'wholeWord', info: 'Only match complete words, so "cat" does not match inside "category".', label: 'Whole words only', type: 'toggle', default: false },
  ],
  outputs: [
    { id: 'result', info: 'Your text after every replacement has been made.', label: 'Result', format: 'code', primary: true },
    { id: 'count', info: 'How many matches were found and replaced.', label: 'Replacements made', format: 'integer' },
  ],
  compute: (v) => {
    const text = str(v.text);
    const find = str(v.find);
    const replace = str(v.replace);
    if (!find) return { result: text, count: 0, note: 'Enter something to find.' };
    let source = on(v.regex) ? find : escapeRegExp(find);
    if (on(v.wholeWord)) source = `(?<![\\p{L}\\p{N}_])(?:${source})(?![\\p{L}\\p{N}_])`;
    const flags = 'g' + (on(v.regex) ? 'm' : '') + (on(v.caseSensitive) ? '' : 'i');
    let re: RegExp;
    try {
      re = new RegExp(source, flags + 'u');
    } catch (e) {
      try {
        // Some older patterns (e.g. "\\-" outside a class) are only valid without the Unicode flag.
        if (on(v.wholeWord)) throw e;
        re = new RegExp(source, flags);
      } catch {
        return { result: null, error: `Invalid regular expression: ${(e as Error).message.replace(/^Invalid regular expression: /, '')}` };
      }
    }
    let count = 0;
    const perMatch = new Map<string, number>();
    const result = text.replace(re, (...args) => {
      count++;
      perMatch.set(args[0] as string, (perMatch.get(args[0] as string) ?? 0) + 1);
      if (!on(v.regex)) return replace;
      // Expand $1, $<name>, $& and $$ ourselves so we can count matches in the same pass.
      const match = args[0] as string;
      const hasGroups = typeof args[args.length - 1] === 'object';
      const groups = (hasGroups ? args[args.length - 1] : undefined) as Record<string, string> | undefined;
      const caps = args.slice(1, hasGroups ? -3 : -2) as (string | undefined)[];
      return replace.replace(/\$(\$|&|\d{1,2}|<[^>]*>)|\\([nt\\])/g, (tok, k: string | undefined, esc: string | undefined) => {
        if (esc) return esc === 'n' ? '\n' : esc === 't' ? '\t' : '\\';
        if (k === undefined) return tok;
        if (k === '$') return '$';
        if (k === '&') return match;
        if (k.startsWith('<')) return groups?.[k.slice(1, -1)] ?? '';
        const n = Number(k);
        return n >= 1 && n <= caps.length ? (caps[n - 1] ?? '') : tok;
      });
    });
    const top = [...perMatch].sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      result,
      count,
      chart: charts(bar('Replacements by matched text', top.map(([k]) => (k.length > 24 ? k.slice(0, 23) + '…' : k) || '(empty)'), top.map(([, n]) => n), { name: 'Replaced', horizontal: true })),
    };
  },
  content: {
    body: [
      'In plain mode the text you type is matched literally — dots, brackets and question marks have no special meaning. Turn on regular expression mode to match patterns instead: \\d+ for any number, ^ and $ for the start and end of each line, or (\\w+)@(\\w+) to capture parts you can reuse in the replacement as $1 and $2.',
      'Whole words only stops "cat" from matching inside "category", and works with letters from any language. Case sensitive off makes "Colour", "COLOUR" and "colour" all match. Every occurrence is replaced in one pass, and the counter shows how many changes were made.',
      'Your text is processed locally in your browser and never uploaded.',
    ],
    faq: [
      { q: 'How do I replace line breaks?', a: 'Turn on regex mode and search for \\n. To join lines with a comma, replace \\n with ", ". In regex mode the replacement understands \\n and \\t too, so replacing ", " with \\n splits a comma-separated list onto separate lines.' },
      { q: 'How do I insert a literal dollar sign in regex mode?', a: 'Write $$ in the replacement. A single $ followed by a number refers to a captured group.' },
      { q: 'Which regex syntax is supported?', a: 'JavaScript regular expressions with the Unicode flag, including lookbehind, named groups (?<name>…) and Unicode property escapes like \\p{L}.' },
    ],
  },
  related: ['regex-tester', 'case-converter', 'remove-duplicate-lines', 'text-diff'],
  examples: [
    {
      values: { text: 'Our colour palette uses a warm colour.', find: 'colour', replace: 'color', regex: 'off', caseSensitive: 'on', wholeWord: 'off' },
      expect: { result: 'Our color palette uses a warm color.', count: 2 },
    },
    {
      values: { text: 'cat category Cat', find: 'cat', replace: 'dog', regex: 'off', caseSensitive: 'off', wholeWord: 'on' },
      expect: { result: 'dog category dog', count: 2 },
    },
    {
      values: { text: 'John Smith, Jane Doe', find: '(\\w+) (\\w+)', replace: '$2 $1 ($$)', regex: 'on', caseSensitive: 'on', wholeWord: 'off' },
      expect: { result: 'Smith John ($), Doe Jane ($)', count: 2 },
    },
    { values: { text: 'a.b.c', find: '.', replace: '-', regex: 'off', caseSensitive: 'on', wholeWord: 'off' }, expect: { result: 'a-b-c', count: 2 } },
    { values: { text: 'a, b, c', find: ', ', replace: '\\n', regex: 'on', caseSensitive: 'on', wholeWord: 'off' }, expect: { result: 'a\nb\nc', count: 2 } },
  ],
});
