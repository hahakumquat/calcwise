import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { randomBytes, str } from '../../lib/helpers/text';

/** RFC 9562 version 4 UUID from 122 random bits. */
function uuidV4(): string {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10xx
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export default defineCalculator({
  slug: 'uuid-generator',
  title: 'UUID Generator',
  category: 'developer',
  description: 'Generate random version 4 UUIDs (GUIDs) in bulk, using your browser\'s cryptographically secure random generator.',
  keywords: ['guid generator', 'uuid v4', 'random uuid', 'unique id', 'generate guid', 'uuid online'],
  popular: true,
  layout: 'wide',
  random: true,
  inputs: [
    { id: 'count', info: 'How many UUIDs to generate at once, from 1 to 1,000.', label: 'How many', type: 'number', default: 5, min: 1, max: 1000, step: 1 },
    {
      id: 'format', info: 'How to write each UUID: standard lowercase, uppercase, without hyphens, in braces like Windows GUIDs, or quoted for code.',
      label: 'Format',
      type: 'select',
      default: 'lower',
      options: [
        { value: 'lower', label: 'Standard (lowercase)' },
        { value: 'upper', label: 'UPPERCASE' },
        { value: 'compact', label: 'No hyphens (32 hex digits)' },
        { value: 'braces', label: '{Braces} — Microsoft GUID style' },
        { value: 'quoted', label: '"Quoted", comma-separated' },
      ],
    },
  ],
  outputs: [
    { id: 'uuids', info: 'Your new random version 4 UUIDs, one per line. Press Regenerate for a fresh batch.', label: 'UUIDs', format: 'code', primary: true },
    { id: 'generated', info: 'How many UUIDs are in the list.', label: 'Generated', format: 'integer' },
    { id: 'length', info: 'Characters per UUID in the chosen format (36 in the standard form).', label: 'Characters each', format: 'integer' },
  ],
  compute: (v) => {
    const n = num(v.count);
    if (n === null || !Number.isInteger(n) || n < 1) return { uuids: null, error: 'Enter a whole number of at least 1.' };
    if (n > 1000) return { uuids: null, error: 'Generate at most 1,000 at a time.' };
    const fmt = str(v.format) || 'lower';
    const list = Array.from({ length: n }, () => {
      const u = uuidV4();
      switch (fmt) {
        case 'upper':
          return u.toUpperCase();
        case 'compact':
          return u.replace(/-/g, '');
        case 'braces':
          return `{${u.toUpperCase()}}`;
        case 'quoted':
          return `"${u}"`;
        default:
          return u;
      }
    });
    return { uuids: list.join(fmt === 'quoted' ? ',\n' : '\n'), generated: n, length: list[0].length };
  },
  content: {
    body: [
      'A UUID (universally unique identifier, called a GUID in the Microsoft world) is a 128-bit value written as 32 hexadecimal digits in five groups, like 3f2b8c1e-9d4a-4f6b-8e2a-7c1d5b9e0a43. Version 4 UUIDs are almost entirely random: 122 of the bits come from a random generator, and the remaining six mark the version (the 4 at the start of the third group) and the variant (8, 9, a or b at the start of the fourth).',
      'With 2^122 possibilities, collisions are not a practical concern: you would need to generate about a billion UUIDs per second for 85 years to reach a 50% chance of a single duplicate. That is why services can create IDs independently without asking a central database.',
      'This page uses crypto.getRandomValues, the same secure source browsers use for encryption keys, and falls back to Math.random only in environments that lack it. UUIDs are generated on your device and never sent anywhere. Press regenerate for a fresh batch.',
    ],
    faq: [
      { q: 'Are v4 UUIDs good database primary keys?', a: 'They work, but their randomness scatters inserts across a B-tree index, which can slow down very large tables. Time-ordered UUID version 7 avoids that while staying globally unique.' },
      { q: 'Is a UUID a secure secret?', a: 'A v4 UUID from a cryptographic generator is hard to guess, but it is not designed as a secret — it often ends up in URLs and logs. Use a dedicated random token for password resets or API keys.' },
      { q: 'Uppercase or lowercase?', a: 'Both are valid and compare equal. The standard recommends lowercase output; some Microsoft tools display uppercase in braces.' },
    ],
  },
  related: ['password-generator', 'hash-generator', 'random-number'],
  examples: [
    { values: { count: 3, format: 'lower' }, expect: { generated: 3, length: 36 } },
    { values: { count: 1, format: 'compact' }, expect: { length: 32 } },
    { values: { count: 2, format: 'braces' }, expect: { length: 38 } },
  ],
});
