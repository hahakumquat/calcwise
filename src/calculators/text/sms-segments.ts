import { defineCalculator } from '../../lib/types';
import { bar } from '../../lib/helpers/text';
import { num } from '../../lib/math';

// 3GPP TS 23.040: a single GSM-7 SMS holds 160 septets, a UCS-2 SMS 70 characters.
// When a message is split (concatenated SMS) a 6-byte header takes space: 153 septets or 67 UCS-2 characters per segment.
const LIMITS = {
  gsm: { single: 160, multi: 153, name: 'GSM-7' },
  ucs2: { single: 70, multi: 67, name: 'Unicode (UCS-2)' },
} as const;

function segmentsFor(units: number, enc: 'gsm' | 'ucs2'): number {
  const { single, multi } = LIMITS[enc];
  if (units <= 0) return 0;
  return units <= single ? 1 : Math.ceil(units / multi);
}

export default defineCalculator({
  slug: 'sms-segments',
  title: 'SMS Segment Calculator',
  category: 'text',
  description: 'Work out how many SMS segments a text message needs from its length and encoding (GSM-7 or Unicode), and what a send will cost.',
  metaDescription: 'Find how many SMS segments your text needs: 160 characters in one GSM-7 message, 70 in Unicode, 153 or 67 per part when split. Estimate send cost too.',
  updated: '2026-11-26',
  keywords: ['sms segments', 'sms character limit', 'sms length calculator', 'gsm-7 vs unicode', '160 character sms', 'sms cost calculator', 'concatenated sms'],
  layout: 'default',
  inputs: [
    { id: 'chars', label: 'Message length', type: 'number', suffix: 'characters', default: 200, min: 0, step: 1, info: 'Number of characters in your message, spaces and line breaks included. Paste the text into the character counter if you do not know it.' },
    {
      id: 'encoding', label: 'Encoding', type: 'select', segmented: true, default: 'gsm',
      options: [{ value: 'gsm', label: 'GSM-7 (plain)' }, { value: 'ucs2', label: 'Unicode' }],
      info: 'GSM-7 covers basic Latin letters, digits and common punctuation. One emoji or a character outside that set (most non-Latin scripts, curly quotes) switches the whole message to Unicode.',
    },
    { id: 'ext', label: 'Extended GSM characters', type: 'number', default: 0, min: 0, step: 1, optional: true, showWhen: { input: 'encoding', is: 'gsm' }, info: 'How many of these characters you use: ^ { } \\ [ ] ~ | and €. Each takes two slots in GSM-7. They are already included in the message length above.' },
    { id: 'recipients', label: 'Recipients', type: 'number', default: 1, min: 1, step: 1, optional: true, info: 'How many people receive the message. Used for the total segment count and cost.' },
    { id: 'price', label: 'Price per segment', type: 'number', prefix: '$', optional: true, min: 0, step: 0.0001, info: 'What your SMS provider charges per segment. Leave blank to skip the cost. Providers bill per segment, not per message.' },
  ],
  outputs: [
    { id: 'segments', label: 'Segments per message', format: 'integer', primary: true, info: 'How many SMS segments one copy of this message uses.' },
    { id: 'units', label: 'Length used for the limit', format: 'integer', info: 'Message length counted in encoding slots: extended GSM characters count twice.' },
    { id: 'perSegment', label: 'Characters per segment', format: 'integer', info: 'Capacity of each segment: 160 (GSM-7) or 70 (Unicode) for a single message; 153 or 67 each when the message is split.' },
    { id: 'left', label: 'Left in last segment', format: 'integer', info: 'Free slots in the final segment before another one is needed.' },
    { id: 'total', label: 'Total segments sent', format: 'integer', info: 'Segments per message times recipients.' },
    { id: 'cost', label: 'Estimated cost', format: 'currency', info: 'Total segments times your price per segment. Taxes and carrier fees are not included.' },
  ],
  compute: (v) => {
    const chars = num(v.chars);
    if (chars === null || chars < 0) return { segments: null };
    const enc = v.encoding === 'ucs2' ? 'ucs2' : 'gsm';
    const ext = enc === 'gsm' ? Math.max(0, num(v.ext) ?? 0) : 0;
    const units = Math.floor(chars) + Math.floor(ext);
    const { single, multi, name } = LIMITS[enc];
    const segments = segmentsFor(units, enc);
    const perSegment = units <= single ? single : multi;
    const capacity = segments === 0 ? single : segments === 1 ? single : segments * multi;
    const left = capacity - units;
    const recipients = Math.max(1, Math.floor(num(v.recipients) ?? 1));
    const total = segments * recipients;
    const price = num(v.price);
    const cost = price === null ? null : total * price;
    return {
      segments,
      units,
      perSegment,
      left,
      total,
      cost,
      tone: segments <= 1 ? 'good' : segments <= 3 ? 'ok' : 'warn',
      badge: segments === 0 ? 'Empty' : segments === 1 ? 'Fits in one SMS' : `${segments} segments`,
      note: `${name}: ${units} of ${capacity} slots used.`,
      steps: [
        `Slots used: ${units} (${name})`,
        units <= single ? `${units} is at most ${single}, so it is one segment.` : `Over ${single}, so the message is split into ${multi}-slot parts: ceil(${units} / ${multi}) = ${segments}.`,
      ],
      chart: bar('Segments if sent as GSM-7 or Unicode', ['GSM-7', 'Unicode'], [segmentsFor(Math.floor(chars), 'gsm'), segmentsFor(Math.floor(chars), 'ucs2')], { name: 'Segments', highlight: enc === 'gsm' ? 0 : 1 }),
    };
  },
  content: {
    formula: ['one segment if length ≤ 160 (GSM-7) or ≤ 70 (Unicode)', 'otherwise segments = ceil(length / 153) for GSM-7, or ceil(length / 67) for Unicode'],
    body: [
      'An SMS is not unlimited text. A single message holds 160 characters in the 7-bit GSM alphabet, or 70 characters when it is encoded as Unicode (UCS-2). Go over and the phone network splits the text into linked parts.',
      'Linked parts each carry a small header so the receiving phone can put them back together. That header costs space, so each part holds 153 GSM-7 characters or 67 Unicode characters. A 161-character GSM message therefore becomes two segments, and most providers bill you for both.',
      'Encoding matters more than length. A single emoji or a curly quote switches the whole message to Unicode, so the same 100 characters go from one segment to two. The characters ^ { } \\ [ ] ~ | and € stay in GSM-7 but take two slots each.',
      'This calculator only does arithmetic on the numbers you enter. Nothing is sent anywhere. Carriers and providers can differ in details, so check your provider\'s own counter before a large send.',
    ],
    faq: [
      { q: 'How many characters fit in one SMS?', a: '160 characters if the message uses only GSM-7 characters, or 70 if it uses Unicode (for example an emoji).' },
      { q: 'Why is a long text split into 153 characters, not 160?', a: 'Each part of a split message carries a header that links the parts together, which uses 7 of the 160 slots. So GSM-7 parts hold 153 and Unicode parts hold 67.' },
      { q: 'How many segments is a 200-character GSM-7 message?', a: 'Two. 200 is over 160, so it is split into 153-character parts: ceil(200 / 153) = 2, and the second segment has 106 slots left.' },
      { q: 'Does one emoji really double my cost?', a: 'It can. One emoji makes the whole message Unicode, so 100 characters that fit in one GSM-7 segment need ceil(100 / 70) = 2 Unicode segments.' },
    ],
    sources: [
      { label: '3GPP TS 23.040, Technical realization of the Short Message Service (SMS), including concatenated short messages and the GSM 7-bit default alphabet.', url: 'https://www.3gpp.org/ftp/Specs/archive/23_series/23.040/' },
    ],
  },
  related: ['character-counter', 'word-counter'],
  examples: [
    { values: { chars: 160, encoding: 'gsm', ext: 0, recipients: 1, price: null }, expect: { segments: 1, perSegment: 160, left: 0, total: 1 } },
    // 161 > 160 so split: ceil(161/153) = 2, capacity 2*153 = 306, left 306-161 = 145
    { values: { chars: 161, encoding: 'gsm', ext: 0, recipients: 1, price: null }, expect: { segments: 2, perSegment: 153, left: 145 } },
    // 306 = 2*153 exactly; 307 needs a third segment
    { values: { chars: 306, encoding: 'gsm', ext: 0 }, expect: { segments: 2, left: 0 } },
    { values: { chars: 307, encoding: 'gsm', ext: 0 }, expect: { segments: 3 } },
    // Unicode: 71 > 70 so ceil(71/67) = 2, capacity 134, left 63
    { values: { chars: 71, encoding: 'ucs2' }, expect: { segments: 2, perSegment: 67, left: 63 } },
    // 158 chars of which 4 are extended: 158 + 4 = 162 slots > 160 -> 2 segments
    { values: { chars: 158, encoding: 'gsm', ext: 4 }, expect: { units: 162, segments: 2 } },
    // 200 chars -> 2 segments; 2 x 1000 recipients = 2000 segments x $0.01 = $20
    { values: { chars: 200, encoding: 'gsm', ext: 0, recipients: 1000, price: 0.01 }, expect: { segments: 2, total: 2000, cost: 20 }, tolerance: 1e-9 },
  ],
});
