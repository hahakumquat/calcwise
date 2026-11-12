import { defineCalculator } from '../../lib/types';
import { bar, base64Decode, base64Encode, charts, on, str, utf8Decode, utf8Encode } from '../../lib/helpers/text';

const sizeChart = (a: number, b: number) => charts(bar('Size in bytes', ['Input', 'Output'], [a, b], { name: 'Bytes', horizontal: true, highlight: 1 }));

export default defineCalculator({
  slug: 'base64',
  title: 'Base64 Encode & Decode',
  category: 'developer',
  description: 'Encode text to Base64 or decode Base64 back to text, with full UTF-8 and URL-safe Base64 support.',
  keywords: ['base64 encoder', 'base64 decoder', 'base64url', 'decode base64', 'encode base64', 'atob', 'btoa'],
  popular: true,
  layout: 'wide',
  inputs: [
    {
      id: 'mode', info: 'Encode turns text into Base64; decode turns Base64 back into text.',
      label: 'Mode',
      type: 'select',
      default: 'encode',
      segmented: true,
      options: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
      ],
    },
    { id: 'text', info: 'Text to encode, or Base64 to decode. Decoding accepts both alphabets, missing padding and line breaks.', label: 'Input', type: 'textarea', mono: true, rows: 8, default: 'Hello, world! Grüße 👋' },
    { id: 'urlSafe', info: 'Use - and _ instead of + and / and drop the = padding (Base64URL), so the result is safe in URLs, file names and JWTs.', showWhen: { input: 'mode', is: 'encode' }, label: 'URL-safe alphabet (- and _, no padding)', type: 'toggle', default: false },
  ],
  outputs: [
    { id: 'result', info: 'The encoded Base64 or the decoded text.', label: 'Result', format: 'code', primary: true },
    { id: 'inBytes', info: 'Size of the input: UTF-8 bytes when encoding, Base64 characters when decoding.', label: 'Input size', format: 'integer', suffix: 'bytes' },
    { id: 'outBytes', info: 'Size of the result. Encoding grows data by about a third.', label: 'Output size', format: 'integer', suffix: 'bytes' },
  ],
  compute: (v) => {
    const text = str(v.text);
    if (str(v.mode) === 'decode') {
      const bytes = base64Decode(text);
      if (!bytes) return { result: null, error: 'This is not valid Base64. Only A–Z, a–z, 0–9, +, / (or - and _) and trailing = are allowed.' };
      const decoded = utf8Decode(bytes);
      if (decoded === null)
        return { result: null, error: `Decoded ${bytes.length} bytes, but they are not UTF-8 text (probably a binary file such as an image).` };
      return { result: decoded, inBytes: text.trim().length, outBytes: bytes.length, chart: sizeChart(text.trim().length, bytes.length) };
    }
    const bytes = utf8Encode(text);
    const result = base64Encode(bytes, on(v.urlSafe));
    return { result, inBytes: bytes.length, outBytes: result.length, chart: sizeChart(bytes.length, result.length) };
  },
  content: {
    formula: ['3 bytes (24 bits) → 4 characters of 6 bits each', 'Encoded length = 4 × ⌈bytes ÷ 3⌉'],
    body: [
      'Base64 represents arbitrary bytes using only 64 safe characters: A–Z, a–z, 0–9, + and /. Every 3 bytes of input become 4 characters, so encoded data is about a third larger. The = signs at the end are padding that makes the length a multiple of four.',
      'Text is first converted to UTF-8 bytes, so accented letters, Chinese characters and emoji round-trip correctly — the browser\'s built-in btoa() fails on these. When decoding, the tool accepts both alphabets, missing padding and stray whitespace or line breaks, which is common in emails and PEM files.',
      'The URL-safe variant (Base64URL) swaps + and / for - and _ and drops the padding, so the result can sit in a URL or file name without escaping. JSON Web Tokens use it.',
      'Base64 is an encoding, not encryption: anyone can decode it. Encoding and decoding happen in your browser, so secrets you paste are not sent anywhere — but do not rely on Base64 to hide them.',
    ],
    faq: [
      { q: 'Why does decoding give an error about UTF-8?', a: 'The Base64 holds binary data — an image, PDF or compressed file — rather than text. The bytes decoded correctly but cannot be shown as characters.' },
      { q: 'Why is Base64 used at all?', a: 'Many systems — email, JSON, URLs, HTML attributes — only handle text safely. Base64 lets you carry binary data such as images or keys through them without corruption.' },
      { q: 'How much bigger does Base64 make data?', a: 'About 33% larger, plus up to two padding characters. A 3 MB image becomes roughly 4 MB of Base64.' },
    ],
  },
  related: ['url-encoder', 'jwt-decoder', 'hash-generator', 'html-entities'],
  examples: [
    { values: { mode: 'encode', text: 'Hello, world!', urlSafe: 'off' }, expect: { result: 'SGVsbG8sIHdvcmxkIQ==', inBytes: 13, outBytes: 20 } },
    { values: { mode: 'encode', text: 'Grüße 👋', urlSafe: 'off' }, expect: { result: 'R3LDvMOfZSDwn5GL' } },
    { values: { mode: 'decode', text: 'R3LDvMOfZSDwn5GL', urlSafe: 'off' }, expect: { result: 'Grüße 👋' } },
    { values: { mode: 'encode', text: '??>', urlSafe: 'on' }, expect: { result: 'Pz8-' } },
    { values: { mode: 'decode', text: 'Pz8-', urlSafe: 'off' }, expect: { result: '??>' } },
    { values: { mode: 'decode', text: 'SGk', urlSafe: 'off' }, expect: { result: 'Hi' } },
  ],
});
