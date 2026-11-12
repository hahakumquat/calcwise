import { defineCalculator } from '../../lib/types';
import { md5Bytes, sha1Bytes, sha256Bytes, sha512Bytes } from '../../lib/helpers/hash';
import { on, str, utf8Encode } from '../../lib/helpers/text';

export default defineCalculator({
  slug: 'hash-generator',
  title: 'Hash Generator (MD5, SHA-1, SHA-256, SHA-512)',
  category: 'developer',
  description: 'Compute MD5, SHA-1, SHA-256 and SHA-512 hashes of any text instantly, right in your browser.',
  keywords: ['sha256', 'md5 hash', 'sha1', 'sha512', 'checksum', 'hash calculator', 'sha-256 online', 'digest'],
  popular: true,
  layout: 'wide',
  inputs: [
    { id: 'text', info: 'The exact text to hash. It is converted to UTF-8 bytes first, as command-line tools do. Nothing is uploaded.', label: 'Text to hash', type: 'textarea', mono: true, rows: 6, default: 'The quick brown fox jumps over the lazy dog' },
    { id: 'upper', info: 'Show the hex digits A–F in capitals. The hash value is the same either way.', label: 'Uppercase hex', type: 'toggle', default: false },
    { id: 'trimEnd', info: 'Drop one line break at the very end before hashing, to match echo -n or text copied from a file.', label: 'Ignore trailing newline', type: 'toggle', default: false, help: 'Matches echo -n when your pasted text ends with a line break.' },
  ],
  outputs: [
    { id: 'sha256', info: 'The 256-bit SHA-2 digest as 64 hex characters — the standard choice for checksums and integrity checks today.', label: 'SHA-256', format: 'code', primary: true },
    { id: 'sha512', info: 'The 512-bit SHA-2 digest as 128 hex characters. Often faster than SHA-256 on 64-bit CPUs.', label: 'SHA-512', format: 'code' },
    { id: 'sha1', info: 'The 160-bit SHA-1 digest (40 hex characters). Still used by Git, but broken for security purposes.', label: 'SHA-1', format: 'code', help: 'Broken for collision resistance — do not use for signatures.' },
    { id: 'md5', info: 'The 128-bit MD5 digest (32 hex characters). Fine for spotting accidental corruption, never for security.', label: 'MD5', format: 'code', help: 'Broken — use only for non-security checksums.' },
    { id: 'bytes', info: 'How many UTF-8 bytes were hashed. Accented letters and emoji take more than one byte each.', label: 'Input size (UTF-8)', format: 'integer', suffix: 'bytes' },
  ],
  compute: (v) => {
    let text = str(v.text);
    if (on(v.trimEnd)) text = text.replace(/\r?\n$/, '');
    const bytes = utf8Encode(text);
    const c = (h: string) => (on(v.upper) ? h.toUpperCase() : h);
    return { sha256: c(sha256Bytes(bytes)), sha512: c(sha512Bytes(bytes)), sha1: c(sha1Bytes(bytes)), md5: c(md5Bytes(bytes)), bytes: bytes.length };
  },
  content: {
    body: [
      'A cryptographic hash function turns any input into a fixed-length fingerprint. The same input always gives the same hash, the smallest change — one letter, one space — gives a completely different one, and there is no practical way to go backwards from the hash to the input. Hashes are used to verify downloads, deduplicate files, build cache keys and sign data.',
      'Text is converted to UTF-8 bytes before hashing, which is what nearly every programming language and command-line tool does, so the results match sha256sum, openssl dgst and Python\'s hashlib. A frequent source of mismatches is a trailing newline: echo adds one unless you use echo -n. The "ignore trailing newline" option helps when comparing.',
      'SHA-256 and SHA-512 (the SHA-2 family) are current standards. MD5 and SHA-1 are shown for compatibility with older systems, but attackers can create collisions for both, so never use them for passwords, signatures or certificates.',
      'All four algorithms are implemented in plain JavaScript and run in your browser; your text is not uploaded.',
    ],
    faq: [
      { q: 'Can I hash passwords with SHA-256?', a: 'Not on its own. Fast hashes let attackers test billions of guesses per second. Store passwords with a slow, salted algorithm designed for the job — Argon2id, scrypt or bcrypt.' },
      { q: 'Why does my hash differ from another tool?', a: 'Almost always the input differs: a trailing newline, Windows line endings (\\r\\n), a different text encoding, or invisible whitespace. Hex case does not matter — ABC and abc are the same value.' },
      { q: 'Can a hash be reversed or "decrypted"?', a: 'No. Hashing is one-way. Sites that claim to reverse MD5 simply look the hash up in huge tables of previously hashed common words, which is why short or common inputs are not protected by hashing.' },
    ],
  },
  related: ['base64', 'password-generator', 'uuid-generator', 'jwt-decoder'],
  examples: [
    {
      values: { text: 'abc', upper: 'off', trimEnd: 'off' },
      expect: {
        sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
        sha1: 'a9993e364706816aba3e25717850c26c9cd0d89d',
        md5: '900150983cd24fb0d6963f7d28e17f72',
        sha512: 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
        bytes: 3,
      },
    },
    { values: { text: '', upper: 'off', trimEnd: 'off' }, expect: { sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', md5: 'd41d8cd98f00b204e9800998ecf8427e' } },
    { values: { text: 'abc\n', upper: 'on', trimEnd: 'on' }, expect: { md5: '900150983CD24FB0D6963F7D28E17F72' } },
  ],
});
