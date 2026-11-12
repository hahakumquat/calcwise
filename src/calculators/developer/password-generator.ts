import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { on, randomInt } from '../../lib/helpers/text';

const SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/~',
};
const AMBIGUOUS = /[Il1O0o]/g;

function strength(bits: number): string {
  if (bits < 40) return 'Very weak — crackable in seconds to hours';
  if (bits < 60) return 'Weak — fine only for low-value accounts with rate limiting';
  if (bits < 80) return 'Strong — good for most online accounts';
  if (bits < 112) return 'Very strong';
  return 'Excellent — suitable for encryption keys and master passwords';
}

export default defineCalculator({
  slug: 'password-generator',
  title: 'Password Generator',
  category: 'developer',
  description: 'Create strong random passwords with your choice of length and character types, and see their entropy in bits.',
  keywords: ['random password', 'strong password', 'secure password generator', 'password entropy', 'passphrase'],
  popular: true,
  layout: 'wide',
  random: true,
  inputs: [
    { id: 'length', info: 'Number of characters. Each extra character multiplies the number of possible passwords by the pool size.', label: 'Length', type: 'number', default: 20, min: 4, max: 256, step: 1, suffix: 'characters' },
    { id: 'upper', info: 'Include capital letters A–Z.', label: 'Uppercase (A–Z)', type: 'toggle', default: true },
    { id: 'lower', info: 'Include lowercase letters a–z.', label: 'Lowercase (a–z)', type: 'toggle', default: true },
    { id: 'digits', info: 'Include the digits 0–9.', label: 'Digits (0–9)', type: 'toggle', default: true },
    { id: 'symbols', info: 'Include punctuation such as ! @ # $ % — turn off for sites that reject symbols, and add length instead.', label: 'Symbols (!@#$…)', type: 'toggle', default: true },
    { id: 'noAmbiguous', info: 'Leave out characters that are easy to confuse (I, l, 1, O, 0, o) — helpful if you will read or type the password by hand.', label: 'Exclude look-alikes (I l 1 O 0 o)', type: 'toggle', default: false },
  ],
  outputs: [
    { id: 'password', info: 'Your new random password. It is created on your device and never sent anywhere; press Regenerate for another.', label: 'Password', format: 'code', primary: true },
    { id: 'entropy', info: 'Length × log₂(pool size): how many bits of randomness the password has. Each bit doubles the guesses an attacker needs.', label: 'Entropy', format: 'number', precision: 1, suffix: 'bits' },
    { id: 'strength', info: 'A plain-language rating of the entropy. 80 bits or more is beyond brute force for any online attack.', label: 'Strength', format: 'text' },
    { id: 'pool', info: 'How many different characters each position can be, given the options you chose.', label: 'Character pool', format: 'integer', suffix: 'characters' },
  ],
  compute: (v) => {
    const len = num(v.length);
    if (len === null || !Number.isInteger(len) || len < 4 || len > 256) return { password: null, error: 'Choose a whole-number length from 4 to 256.' };
    const sets = (Object.keys(SETS) as (keyof typeof SETS)[])
      .filter((k) => on(v[k]))
      .map((k) => (on(v.noAmbiguous) ? SETS[k].replace(AMBIGUOUS, '') : SETS[k]));
    if (!sets.length) return { password: null, error: 'Turn on at least one character type.' };
    if (sets.length > len) return { password: null, error: `The length must be at least ${sets.length} to include every selected character type.` };
    const pool = sets.join('');
    // One character from each selected set, the rest from the whole pool, then a Fisher–Yates shuffle.
    const chars = sets.map((s) => s[randomInt(s.length)]);
    while (chars.length < len) chars.push(pool[randomInt(pool.length)]);
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    const entropy = len * Math.log2(pool.length);
    const top = Math.max(160, Math.ceil(entropy / 20) * 20);
    return {
      password: chars.join(''),
      entropy,
      strength: strength(entropy),
      pool: pool.length,
      chart: {
        type: 'scale',
        title: 'Password strength',
        min: 0,
        max: top,
        value: entropy,
        valueLabel: `${entropy.toFixed(0)} bits`,
        format: { suffix: 'bits' },
        bands: [
          { from: 0, to: 40, label: 'Weak', tone: 'bad' },
          { from: 40, to: 60, label: 'Fair', tone: 'warn' },
          { from: 60, to: 80, label: 'Strong', tone: 'ok' },
          { from: 80, to: top, label: 'Very strong', tone: 'good' },
        ],
      },
    };
  },
  content: {
    formula: ['Entropy (bits) = length × log₂(pool size)'],
    body: [
      'Entropy measures how many guesses an attacker would need: every extra bit doubles the work. A 20-character password drawn from all 87 characters here has about 129 bits — far beyond what any computer can brute-force. Length adds entropy faster than variety, so when a site restricts symbols, simply make the password longer.',
      'Each password includes at least one character from every type you selected, which satisfies most "must contain a digit and a symbol" rules, and is shuffled so the guaranteed characters are not in predictable positions. Excluding look-alike characters costs a few bits but helps when a password must be read aloud or typed from paper.',
      'Passwords are generated on your device with crypto.getRandomValues, the browser\'s cryptographically secure random source, using rejection sampling so every character is equally likely. Nothing is sent over the network or stored. Press regenerate for a new one, and keep it in a password manager rather than reusing it.',
    ],
    faq: [
      { q: 'How long should my password be?', a: 'For an account protected by a password manager, 16–20 random characters is plenty. For a master password you must remember, a passphrase of 5–6 random words (around 65–80 bits) is easier to type and still very strong.' },
      { q: 'Is the entropy figure accurate for any password?', a: 'Only for passwords generated randomly like these. A human-chosen password such as "Summer2025!" has far less real entropy than its length suggests, because attackers try common patterns first.' },
      { q: 'Is it safe to generate a password on a website?', a: 'This page creates the password locally in JavaScript and never transmits it — you can even load the page, go offline and keep generating. Still, only use generators you trust, and save the result straight into your password manager.' },
    ],
  },
  related: ['uuid-generator', 'hash-generator', 'base64'],
  examples: [
    { values: { length: 20, upper: 'on', lower: 'on', digits: 'on', symbols: 'on', noAmbiguous: 'off' }, expect: { pool: 87, entropy: 128.8 }, tolerance: 0.001 },
    { values: { length: 12, upper: 'off', lower: 'on', digits: 'on', symbols: 'off', noAmbiguous: 'on' }, expect: { pool: 32, entropy: 60 } },
    { values: { length: 8, upper: 'off', lower: 'off', digits: 'off', symbols: 'off', noAmbiguous: 'off' }, expect: { error: 'Turn on at least one character type.' } },
  ],
});
