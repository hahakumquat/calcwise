import { defineCalculator } from '../../lib/types';
import { bar, byteLength, charts, mixDonut, splitLines, str, words } from '../../lib/helpers/text';

// GSM 03.38 basic character set (1 septet each) and extension table (2 septets each).
const GSM_BASIC = new Set(
  Array.from('@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'),
);
const GSM_EXT = new Set(Array.from('^{}\\[~]|€\f'));

function limit(count: number, max: number): string {
  return count <= max ? `${count} / ${max} — ${max - count} left` : `${count} / ${max} — ${count - max} over`;
}

function sms(text: string): string {
  if (!text) return '0 messages';
  const chars = Array.from(text);
  const gsm = chars.every((c) => GSM_BASIC.has(c) || GSM_EXT.has(c));
  const units = gsm ? chars.reduce((a, c) => a + (GSM_EXT.has(c) ? 2 : 1), 0) : text.length; // UCS-2 counts UTF-16 units
  const [single, multi] = gsm ? [160, 153] : [70, 67];
  const parts = units <= single ? 1 : Math.ceil(units / multi);
  const enc = gsm ? 'GSM-7' : 'Unicode';
  return `${parts} ${parts === 1 ? 'message' : 'messages'} (${enc}, ${units} / ${parts === 1 ? single : parts * multi})`;
}

export default defineCalculator({
  slug: 'character-counter',
  title: 'Character Counter',
  category: 'text',
  description: 'Count characters with and without spaces, bytes and lines, and check your text against X, meta description and SMS limits.',
  keywords: ['letter count', 'char count', 'tweet length', 'meta description length', 'sms length', 'character limit'],
  popular: true,
  layout: 'wide',
  inputs: [
    {
      id: 'text', info: 'Paste or type the text to measure — a post, a meta description, a text message or a form field.',
      label: 'Your text',
      type: 'textarea',
      rows: 6,
      placeholder: 'Type or paste text…',
      default: 'Free, fast calculators and developer tools that run entirely in your browser. No sign-up, no tracking of what you type.',
    },
  ],
  outputs: [
    { id: 'chars', info: 'Unicode characters including spaces and line breaks. Each emoji or accented letter counts as one.', label: 'Characters', format: 'integer', primary: true },
    { id: 'charsNoSpaces', info: 'The character count with every space, tab and line break removed.', label: 'Characters (no spaces)', format: 'integer' },
    { id: 'words', info: 'Runs of letters or digits; contractions and hyphenated words count once.', label: 'Words', format: 'integer' },
    { id: 'lines', info: 'Number of lines, counting each line break. Empty text has zero lines.', label: 'Lines', format: 'integer' },
    { id: 'bytes', info: 'Storage size in UTF-8: 1 byte for basic Latin, 2–4 for accents, other scripts and emoji. Databases often limit bytes.', label: 'Size (UTF-8 bytes)', format: 'integer' },
    { id: 'tweet', info: 'Room left in a 280-character post on X. Links always count as 23 characters there, so treat this as a guide.', label: 'X / Twitter post (280)', format: 'text' },
    { id: 'meta', info: 'Search engines show roughly 150–160 characters of a meta description before truncating it.', label: 'Meta description (160)', format: 'text' },
    { id: 'title', info: 'Search results usually show about 50–60 characters of a page title.', label: 'Page title tag (60)', format: 'text' },
    { id: 'sms', info: 'How many text-message segments this needs. Emoji or non-Latin letters switch the message to Unicode, cutting the limit to 70.', label: 'SMS', format: 'text', help: '160 characters per message for plain text, 70 when emoji or non-Latin characters are present.' },
  ],
  compute: (v) => {
    const text = str(v.text);
    const chars = Array.from(text).length;
    return {
      chars,
      charsNoSpaces: Array.from(text.replace(/\s/g, '')).length,
      words: words(text).length,
      lines: text ? splitLines(text).length : 0,
      bytes: byteLength(text),
      tweet: limit(chars, 280),
      meta: limit(chars, 160),
      title: limit(chars, 60),
      sms: sms(text),
      chart: charts(
        bar('Share of each limit used', ['Page title (60)', 'Meta description (160)', 'SMS (160)', 'X post (280)'], [chars / 60, chars / 160, chars / 160, chars / 280], {
          name: 'Used',
          horizontal: true,
          format: { format: 'percent' },
        }),
        mixDonut(text),
      ),
    };
  },
  content: {
    body: [
      'Characters are counted as Unicode code points, so an accented letter or most emoji count as one character — the way people read them. Spaces, line breaks and punctuation all count, because every platform limit includes them. The "no spaces" figure strips every kind of whitespace.',
      'The limit rows tell you how much room is left for common destinations. X allows 280 characters per post (links always count as 23, and some CJK characters count double, so treat this as a close guide). Search engines usually show around 150–160 characters of a meta description and 50–60 characters of a title before cutting it off.',
      'Text messages are trickier. Plain Latin text uses the 7-bit GSM alphabet: 160 characters fit in one SMS, and longer messages are split into 153-character segments. A single emoji or character outside that alphabet switches the whole message to Unicode, where the limit drops to 70 (67 per segment). Characters like € and [ take two GSM slots.',
      'Counting happens locally in your browser; nothing you paste is sent anywhere.',
    ],
    faq: [
      { q: 'Why does one emoji make my SMS cost more?', a: 'Emoji are not in the GSM-7 alphabet, so the phone switches the entire message to UCS-2 encoding. That cuts the per-message limit from 160 to 70 characters.' },
      { q: 'Is the byte count the same as the character count?', a: 'Only for plain ASCII. In UTF-8, accented letters take 2 bytes, most Asian scripts take 3, and emoji take 4. Databases and APIs often limit bytes, not characters.' },
      { q: 'Do line breaks count as characters?', a: 'Yes. Each line break counts as one character, which matches how most form fields and social networks measure length.' },
    ],
  },
  related: ['word-counter', 'case-converter', 'slug-generator'],
  examples: [
    {
      values: { text: 'Hello, world!' },
      expect: { chars: 13, charsNoSpaces: 12, words: 2, lines: 1, bytes: 13, tweet: '13 / 280 — 267 left', sms: '1 message (GSM-7, 13 / 160)' },
    },
    { values: { text: 'Café 😀' }, expect: { chars: 6, bytes: 10, sms: '1 message (Unicode, 7 / 70)' } },
    { values: { text: 'a'.repeat(170) }, expect: { meta: '170 / 160 — 10 over', sms: '2 messages (GSM-7, 170 / 306)' } },
  ],
});
