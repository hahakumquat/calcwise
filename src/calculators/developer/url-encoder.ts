import { defineCalculator } from '../../lib/types';
import { bar, charts, on, str } from '../../lib/helpers/text';

const sizeChart = (a: string, b: string) => charts(bar('Length in characters', ['Input', 'Output'], [a.length, b.length], { name: 'Characters', horizontal: true, highlight: 1 }));

export default defineCalculator({
  slug: 'url-encoder',
  title: 'URL Encode & Decode',
  category: 'developer',
  description: 'Percent-encode text for use in URLs and query strings, or decode %20-style escapes back to readable text.',
  keywords: ['url encoder', 'url decoder', 'percent encoding', 'encodeURIComponent', 'urlencode', 'query string encode'],
  layout: 'wide',
  inputs: [
    {
      id: 'mode', info: 'Encode converts special characters to %XX escapes; decode turns escapes back into readable text.',
      label: 'Mode',
      type: 'select',
      default: 'encode',
      segmented: true,
      options: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
      ],
    },
    {
      id: 'scope', info: 'Component escapes everything that has meaning in a URL (/ ? & = #) — right for one query value. Full URL keeps those so a complete address stays intact.',
      label: 'Encode as',
      type: 'select',
      default: 'component',
      options: [
        { value: 'component', label: 'Component — query value or path segment (encodeURIComponent)' },
        { value: 'uri', label: 'Full URL — keep : / ? & = # (encodeURI)' },
      ],
    },
    { id: 'text', info: 'The text or URL to encode, or the percent-encoded string to decode.', label: 'Input', type: 'textarea', mono: true, rows: 6, default: 'café & crème/brûlée?size=large #1' },
    { id: 'plus', info: 'Use + for spaces, as HTML forms do (application/x-www-form-urlencoded). When decoding, + is read as a space.', label: 'Spaces as + (HTML form style)', type: 'toggle', default: false },
  ],
  outputs: [{ id: 'result', info: 'The encoded or decoded text, ready to paste into a URL or read.', label: 'Result', format: 'code', primary: true }],
  compute: (v) => {
    const text = str(v.text);
    const plus = on(v.plus);
    try {
      if (str(v.mode) === 'decode') {
        const t = plus ? text.replace(/\+/g, ' ') : text;
        const out = str(v.scope) === 'uri' ? decodeURI(t) : decodeURIComponent(t);
        return { result: out, chart: sizeChart(text, out) };
      }
      let r = str(v.scope) === 'uri' ? encodeURI(text) : encodeURIComponent(text);
      if (str(v.scope) !== 'uri') r = r.replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()); // RFC 3986 strict
      if (plus) r = r.replace(/%20/g, '+');
      return { result: r, chart: sizeChart(text, r) };
    } catch {
      return {
        result: null,
        error:
          str(v.mode) === 'decode'
            ? 'Malformed percent-encoding: every % must be followed by two hex digits forming valid UTF-8 (e.g. %C3%A9 for é).'
            : 'The text contains an unpaired surrogate character and cannot be encoded.',
      };
    }
  },
  content: {
    body: [
      'URLs may only contain a limited set of ASCII characters. Everything else — spaces, accented letters, emoji, and characters that have special meaning in URLs like & and ? — must be percent-encoded: converted to UTF-8 bytes and written as % followed by two hex digits. A space becomes %20 and é becomes %C3%A9.',
      'Use component mode for a single piece you are inserting into a URL, such as a search term in ?q=… or one path segment. It encodes the reserved characters / ? & = # so they cannot break the URL structure. Full-URL mode leaves those characters alone and only escapes what is illegal, which is right when you already have a complete address with spaces or non-ASCII characters in it.',
      'HTML forms submitted with application/x-www-form-urlencoded write spaces as + instead of %20. Turn on the + option to produce or read that style. Encoding happens locally in your browser.',
    ],
    faq: [
      { q: 'What is the difference between encodeURI and encodeURIComponent?', a: 'encodeURI assumes you are giving it a whole URL and keeps characters like : / ? & = intact. encodeURIComponent assumes the text is one value and escapes those too. Using encodeURI on a query value is a common bug: an & inside the value would split it into two parameters.' },
      { q: 'Why does decoding fail with "malformed"?', a: 'There is a % not followed by two hex digits, or the bytes do not form valid UTF-8 — often a sign the text was encoded with an old Latin-1 encoder or is already decoded and contains a literal % sign.' },
      { q: 'Should I encode a URL twice?', a: 'No. Double encoding turns %20 into %2520, which servers will read as the literal text "%20". Encode each value once, right before building the URL.' },
    ],
  },
  related: ['base64', 'html-entities', 'slug-generator'],
  examples: [
    { values: { mode: 'encode', scope: 'component', text: 'a b&c/é', plus: 'off' }, expect: { result: 'a%20b%26c%2F%C3%A9' } },
    { values: { mode: 'encode', scope: 'uri', text: 'https://x.com/a b?q=é&r=1', plus: 'off' }, expect: { result: 'https://x.com/a%20b?q=%C3%A9&r=1' } },
    { values: { mode: 'encode', scope: 'component', text: "it's (ok) now", plus: 'on' }, expect: { result: 'it%27s+%28ok%29+now' } },
    { values: { mode: 'decode', scope: 'component', text: 'caf%C3%A9+au+lait', plus: 'on' }, expect: { result: 'café au lait' } },
    { values: { mode: 'decode', scope: 'component', text: '100%', plus: 'off' }, expect: { error: 'Malformed percent-encoding: every % must be followed by two hex digits forming valid UTF-8 (e.g. %C3%A9 for é).' } },
  ],
});
