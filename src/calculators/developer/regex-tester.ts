import { defineCalculator } from '../../lib/types';
import { bar, charts, str } from '../../lib/helpers/text';

const MAX_MATCHES = 500;
const q = (s: string | undefined) => (s === undefined ? 'undefined' : JSON.stringify(s));

export default defineCalculator({
  slug: 'regex-tester',
  title: 'Regex Tester',
  category: 'developer',
  description: 'Test a JavaScript regular expression against sample text and see every match, its position and its capture groups.',
  keywords: ['regular expression', 'regex online', 'regexp tester', 'regex checker', 'regex match', 'capture groups'],
  layout: 'wide',
  inputs: [
    { id: 'pattern', info: 'The regular expression, written without the surrounding slashes. JavaScript syntax, including named groups (?<name>…).', label: 'Pattern', type: 'text', default: '(?<user>[\\w.+-]+)@(?<domain>[\\w-]+(?:\\.[\\w-]+)+)', placeholder: 'e.g. \\d{3}-\\d{4}', help: 'Without the surrounding slashes.' },
    { id: 'flags', info: 'Letters that change matching: g finds all matches, i ignores case, m makes ^ and $ work per line, s lets . match newlines.', label: 'Flags', type: 'text', default: 'g', optional: true, placeholder: 'g, i, m, s, u, y, d, v', help: 'g = all matches, i = ignore case, m = ^/$ per line, s = . matches newlines, u = Unicode.' },
    { id: 'text', info: 'Sample text to run the pattern against. Nothing you type here is uploaded.', label: 'Test string', type: 'textarea', mono: true, rows: 8, default: 'Contact ada@example.com or grace.hopper@navy.mil.\nInvalid: bob@localhost' },
  ],
  outputs: [
    { id: 'count', info: 'How many times the pattern matched. Without the g flag, at most one.', label: 'Matches', format: 'integer', primary: true },
    { id: 'matches', info: 'Each match with its start–end index, followed by the text captured by every group.', label: 'Match details', format: 'code' },
    { id: 'highlighted', info: 'Your test string with every match wrapped in ⟦ ⟧, so you can see what was and was not caught.', label: 'Matches marked with ⟦ ⟧', format: 'code' },
  ],
  compute: (v) => {
    const pattern = str(v.pattern);
    const flags = str(v.flags).replace(/[\s/,]/g, '');
    const text = str(v.text);
    if (!pattern) return { count: null, error: 'Enter a pattern to test.' };
    const bad = flags.replace(/[dgimsuyv]/g, '');
    if (bad) return { count: null, error: `Unknown flag "${bad[0]}". Valid flags are d, g, i, m, s, u, v and y.` };
    if (new Set(flags).size !== flags.length) return { count: null, error: 'Each flag can appear only once.' };
    let re: RegExp;
    try {
      re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    } catch (e) {
      return { count: null, error: (e as Error).message };
    }
    const global = flags.includes('g');
    const found: RegExpExecArray[] = [];
    for (const m of text.matchAll(re)) {
      found.push(m);
      if (!global || found.length >= MAX_MATCHES) break;
    }
    if (!found.length) return { count: 0, matches: 'No matches.', highlighted: text };
    const names = new Map<number, string>();
    // Map named groups to their numeric index by scanning the pattern's opening parentheses.
    let gi = 0;
    let inClass = false;
    const src = re.source;
    for (let k = 0; k < src.length; k++) {
      if (src[k] === '\\') { k++; continue; }
      if (inClass) { if (src[k] === ']') inClass = false; continue; }
      if (src[k] === '[') { inClass = true; continue; }
      if (src[k] === '(' && src[k + 1] !== '?') gi++;
      else if (src[k] === '(' && src[k + 1] === '?' && src[k + 2] === '<' && src[k + 3] !== '=' && src[k + 3] !== '!') {
        gi++;
        const end = src.indexOf('>', k);
        names.set(gi, src.slice(k + 3, end));
      }
    }
    const details = found.map((m, i) => {
      const lines = [`#${i + 1}  ${q(m[0])}  at index ${m.index}–${m.index + m[0].length}`];
      for (let g = 1; g < m.length; g++) lines.push(`    group ${g}${names.has(g) ? ` <${names.get(g)}>` : ''}: ${q(m[g])}`);
      return lines.join('\n');
    });
    let marked = '';
    let last = 0;
    for (const m of found) {
      if (m.index < last) continue;
      marked += text.slice(last, m.index) + '⟦' + m[0] + '⟧';
      last = m.index + m[0].length;
    }
    marked += text.slice(last);
    const groupCount = found[0].length - 1;
    const groupLabels = Array.from({ length: groupCount }, (_, g) => `Group ${g + 1}${names.has(g + 1) ? ` <${names.get(g + 1)}>` : ''}`);
    const groupHits = groupLabels.map((_, g) => found.filter((m) => m[g + 1] !== undefined).length);
    return {
      chart: charts(bar(groupCount ? 'Matches captured by each group' : 'Matches', groupCount ? ['Whole match', ...groupLabels] : ['Whole match'], [found.length, ...groupHits], { name: 'Matches', horizontal: true })),
      count: found.length,
      matches: details.join('\n'),
      highlighted: marked,
      note: found.length >= MAX_MATCHES ? `Showing the first ${MAX_MATCHES} matches.` : global ? undefined : 'Without the g flag only the first match is found.',
    };
  },
  content: {
    body: [
      'Type a pattern without the surrounding slashes and add flags separately — the same split as new RegExp(pattern, flags) in JavaScript. Results update as you type: the match count, each match with its start and end index, every capture group (named groups are labelled), and your test string with matches marked so you can spot what was and was not caught.',
      'The tester uses your browser\'s own JavaScript regex engine, so behaviour is exactly what you will get in Node.js and front-end code. Most syntax is shared with Python, Java and PCRE, but details differ — for example lookbehind support, possessive quantifiers and the meaning of \\w with Unicode text.',
      'Patterns with nested quantifiers like (a+)+ can take exponential time on some inputs ("catastrophic backtracking"). If the page freezes, simplify the pattern. Testing runs locally; your pattern and text are never uploaded.',
    ],
    faq: [
      { q: 'Why does my pattern find only one match?', a: 'Without the g (global) flag a regex stops after the first match. Add g to find them all.' },
      { q: 'How do I match a literal dot or bracket?', a: 'Escape it with a backslash: \\. matches a dot, \\( a parenthesis, \\[ a bracket. Inside a character class most characters are literal, so [.] also matches a dot.' },
      { q: 'What do ^ and $ match?', a: 'By default, the very start and end of the whole text. With the m (multiline) flag they match at the start and end of every line.' },
    ],
  },
  related: ['find-and-replace', 'text-diff', 'json-formatter'],
  examples: [
    {
      values: { pattern: '(?<user>[\\w.+-]+)@(?<domain>[\\w-]+(?:\\.[\\w-]+)+)', flags: 'g', text: 'Contact ada@example.com or grace.hopper@navy.mil.\nInvalid: bob@localhost' },
      expect: {
        count: 2,
        matches: '#1  "ada@example.com"  at index 8–23\n    group 1 <user>: "ada"\n    group 2 <domain>: "example.com"\n#2  "grace.hopper@navy.mil"  at index 27–48\n    group 1 <user>: "grace.hopper"\n    group 2 <domain>: "navy.mil"',
      },
    },
    { values: { pattern: '\\d+', flags: '', text: 'a1 b22 c333' }, expect: { count: 1, highlighted: 'a⟦1⟧ b22 c333' } },
    { values: { pattern: '\\d+', flags: 'g', text: 'a1 b22 c333' }, expect: { count: 3, highlighted: 'a⟦1⟧ b⟦22⟧ c⟦333⟧' } },
    { values: { pattern: 'x', flags: 'gq', text: 'x' }, expect: { error: 'Unknown flag "q". Valid flags are d, g, i, m, s, u, v and y.' } },
    { values: { pattern: 'z', flags: 'g', text: 'abc' }, expect: { count: 0 } },
  ],
});
