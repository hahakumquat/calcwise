import { defineCalculator } from '../../lib/types';
import { bar, charts, on, str } from '../../lib/helpers/text';

const sizeChart = (a: string, b: string) => charts(bar('Length in characters', ['Input', 'Output'], [a.length, b.length], { name: 'Characters', horizontal: true, highlight: 1 }));

// Common named entities. Decoding also accepts any numeric entity (&#233; / &#xE9;).
const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', reg: '®', trade: '™', hellip: '…',
  mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', bull: '•', middot: '·',
  deg: '°', plusmn: '±', times: '×', divide: '÷', frac12: '½', frac14: '¼', frac34: '¾', micro: 'µ', para: '¶', sect: '§',
  cent: '¢', pound: '£', euro: '€', yen: '¥', iexcl: '¡', iquest: '¿', larr: '←', rarr: '→', uarr: '↑', darr: '↓',
  hearts: '♥', check: '✓', shy: '­', eacute: 'é', egrave: 'è', ecirc: 'ê', aacute: 'á', agrave: 'à', acirc: 'â',
  auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', ccedil: 'ç', ntilde: 'ñ', oacute: 'ó',
  iacute: 'í', uacute: 'ú', Eacute: 'É', aring: 'å', oslash: 'ø', aelig: 'æ', alpha: 'α', beta: 'β', pi: 'π', infin: '∞',
  ne: '≠', le: '≤', ge: '≥', sup2: '²', sup3: '³',
};
const BY_CHAR = new Map(Object.entries(NAMED).map(([k, c]) => [c, k]));

export default defineCalculator({
  slug: 'html-entities',
  title: 'HTML Entity Encoder & Decoder',
  category: 'developer',
  description: 'Escape text for safe use in HTML (&lt; &amp; &quot;…) or turn HTML entities back into plain characters.',
  keywords: ['html escape', 'html unescape', 'html encode', 'html decode', 'escape html characters', '&amp;'],
  layout: 'wide',
  inputs: [
    {
      id: 'mode', info: 'Encode escapes characters that have meaning in HTML; decode turns entities like &amp; back into characters.',
      label: 'Mode',
      type: 'select',
      default: 'encode',
      segmented: true,
      options: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
      ],
    },
    { id: 'text', info: 'Text or HTML to encode, or text containing entities to decode.', label: 'Input', type: 'textarea', mono: true, rows: 6, default: '<a href="/search?q=fish&chips">Fish & chips — £5</a>' },
    { id: 'nonAscii', info: 'Also replace accented letters, symbols and emoji with entities. Only needed for systems that cannot handle UTF-8.', showWhen: { input: 'mode', is: 'encode' }, label: 'Also encode non-ASCII characters (é → &eacute;)', type: 'toggle', default: false },
    { id: 'named', info: 'Use readable names like &eacute; where one exists, instead of numeric codes like &#233;.', showWhen: { input: 'mode', is: 'encode' }, label: 'Prefer named entities over numeric', type: 'toggle', default: true },
  ],
  outputs: [{ id: 'result', info: 'The escaped HTML or the decoded plain text.', label: 'Result', format: 'code', primary: true }],
  compute: (v) => {
    const text = str(v.text);
    if (str(v.mode) === 'decode') {
      const result = text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e: string) => {
        if (e[0] === '#') {
          const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
          return cp > 0 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff) ? String.fromCodePoint(cp) : m;
        }
        return NAMED[e] ?? m;
      });
      return { result, chart: sizeChart(text, result) };
    }
    const named = on(v.named);
    const enc = (c: string) => (named && BY_CHAR.has(c) ? `&${BY_CHAR.get(c)};` : `&#${c.codePointAt(0)};`);
    const basic: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    let result = text.replace(/[&<>"']/g, (c) => basic[c]);
    if (on(v.nonAscii)) result = result.replace(/[^\x00-\x7f]/gu, enc);
    return { result, chart: sizeChart(text, result) };
  },
  content: {
    body: [
      'Five characters have special meaning in HTML: < and > start and end tags, & starts an entity, and the two quote marks delimit attribute values. To show them as text you must write them as entities — &lt;, &gt;, &amp;, &quot; and &#39;. Forgetting this breaks layouts and, when the text comes from users, opens the door to cross-site scripting (XSS).',
      'Encoding these five is enough for any UTF-8 web page. Turn on non-ASCII encoding if the text will travel through a system that mangles accented letters or emoji, such as an old email template or a Latin-1 database; each such character becomes a named entity where a common one exists, or a numeric one like &#128512; otherwise.',
      'Decoding understands the common named entities plus every decimal (&#233;) and hexadecimal (&#xE9;) reference. Unknown entities are left as they are. Everything runs locally in your browser.',
    ],
    faq: [
      { q: 'Is HTML escaping enough to prevent XSS?', a: 'It is the right defence for text placed between tags or inside quoted attributes. It is not enough inside <script> blocks, unquoted attributes, URLs (javascript: links) or CSS — each context needs its own escaping. Prefer a template engine that escapes automatically.' },
      { q: 'What is the difference between &nbsp; and a normal space?', a: '&nbsp; is a non-breaking space: it looks like a space but prevents a line break at that point and is not collapsed with neighbouring spaces.' },
      { q: 'Why &#39; instead of &apos;?', a: '&apos; was not part of HTML 4, so some older parsers and email clients do not understand it. The numeric form works everywhere.' },
    ],
  },
  related: ['url-encoder', 'base64', 'find-and-replace'],
  examples: [
    { values: { mode: 'encode', text: '<b class="x">Tom & Jerry\'s</b>', nonAscii: 'off', named: 'on' }, expect: { result: '&lt;b class=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/b&gt;' } },
    { values: { mode: 'encode', text: 'Café 😀', nonAscii: 'on', named: 'on' }, expect: { result: 'Caf&eacute; &#128512;' } },
    { values: { mode: 'encode', text: 'é', nonAscii: 'on', named: 'off' }, expect: { result: '&#233;' } },
    { values: { mode: 'decode', text: '&lt;p&gt;5 &times; 3 &#x2264; &#49;6 &bogus;&lt;/p&gt;', nonAscii: 'off', named: 'on' }, expect: { result: '<p>5 × 3 ≤ 16 &bogus;</p>' } },
  ],
});
