import { defineCalculator, type ChartSpec } from '../../lib/types';
import { base64Decode, str, utf8Decode } from '../../lib/helpers/text';

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRGV2ZWxvcGVyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY3MjI1NjAwLCJleHAiOjE3OTg3NjE2MDB9.IDo-4ZAv56swMJNnvNfprxcngLIM4fpNooSaXu_ka30';

function decodePart(part: string): Record<string, unknown> | null {
  const bytes = base64Decode(part);
  const text = bytes && utf8Decode(bytes);
  if (!text) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

/** NumericDate (seconds since epoch) → "2026-01-01 00:00:00 UTC". */
function when(v: unknown): string {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  const d = new Date(v * 1000);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
}

function relative(sec: number): string {
  const a = Math.abs(sec);
  const [n, u] =
    a < 90 ? [a, 'second'] : a < 5400 ? [a / 60, 'minute'] : a < 129600 ? [a / 3600, 'hour'] : a < 5184000 ? [a / 86400, 'day'] : a < 63072000 ? [a / 2629746, 'month'] : [a / 31556952, 'year'];
  const r = Math.round(n);
  const t = `${r} ${u}${r === 1 ? '' : 's'}`;
  return sec >= 0 ? `in ${t}` : `${t} ago`;
}

export default defineCalculator({
  slug: 'jwt-decoder',
  title: 'JWT Decoder',
  category: 'developer',
  description: 'Decode a JSON Web Token to read its header and payload claims, with issue and expiry times in plain dates.',
  keywords: ['jwt', 'json web token', 'decode jwt', 'jwt parser', 'bearer token', 'jwt debugger', 'id token'],
  popular: true,
  layout: 'wide',
  inputs: [{ id: 'token', info: 'Paste the whole token (three Base64URL parts separated by dots). A leading "Bearer " is ignored. Decoding happens only in your browser.', label: 'JWT', type: 'textarea', mono: true, rows: 5, default: SAMPLE, placeholder: 'eyJhbGciOi…' }],
  outputs: [
    { id: 'payload', info: 'The claims inside the token — who it is for, what it allows and when it expires. Readable by anyone holding the token.', label: 'Payload (claims)', format: 'code', primary: true },
    { id: 'header', info: 'Metadata about the token: the signing algorithm (alg), token type (typ) and sometimes a key ID (kid).', label: 'Header', format: 'code' },
    { id: 'alg', info: 'The signing algorithm named in the header, such as HS256 (shared secret) or RS256 (public/private key).', label: 'Algorithm', format: 'text' },
    { id: 'iat', info: 'When the token was issued, converted from Unix seconds to UTC.', label: 'Issued at (iat)', format: 'text' },
    { id: 'exp', info: 'When the token stops being valid, in UTC. Servers should reject it after this time.', label: 'Expires (exp)', format: 'text' },
    { id: 'nbf', info: 'The earliest time the token may be used, if the issuer set one.', label: 'Not before (nbf)', format: 'text' },
    { id: 'status', info: 'Whether the token is expired right now, judged by your device clock.', label: 'Expiry status', format: 'text', help: 'Compared with your device clock.' },
    { id: 'signature', info: 'Whether a signature is present. This tool never verifies it — only your server, with the key, can do that.', label: 'Signature', format: 'text' },
  ],
  compute: (v) => {
    const token = str(v.token).trim().replace(/^Bearer\s+/i, '');
    if (!token) return { payload: null, error: 'Paste a JWT to decode.' };
    const parts = token.split('.');
    if (parts.length === 5) return { payload: null, error: 'This is an encrypted JWT (JWE, 5 parts). Its payload cannot be read without the decryption key.' };
    if (parts.length !== 3) return { payload: null, error: `A JWT has 3 parts separated by dots; this has ${parts.length}.` };
    const header = decodePart(parts[0]);
    if (!header) return { payload: null, error: 'The header (part 1) is not Base64URL-encoded JSON.' };
    const payload = decodePart(parts[1]);
    if (!payload) return { payload: null, error: 'The payload (part 2) is not Base64URL-encoded JSON.' };
    const alg = typeof header.alg === 'string' ? header.alg : '—';
    const now = Date.now() / 1000;
    let chart: ChartSpec | undefined;
    if (typeof payload.iat === 'number' && typeof payload.exp === 'number' && payload.exp > payload.iat) {
      const D = 86400;
      const span = (payload.exp - payload.iat) / D;
      const nowD = (now - payload.iat) / D;
      const lo = Math.min(0, nowD);
      const hi = Math.max(span, nowD);
      const pad = (hi - lo) * 0.08 || 1;
      const nbfD = typeof payload.nbf === 'number' ? Math.min(Math.max((payload.nbf - payload.iat) / D, 0), span) : 0;
      chart = {
        type: 'scale',
        title: 'Token lifetime (days since issued)',
        min: lo - pad,
        max: hi + pad,
        value: nowD,
        valueLabel: 'Now',
        format: { suffix: 'days' },
        bands: [
          { from: lo - pad, to: 0, label: 'Before issue', tone: 'neutral' },
          ...(nbfD > 0 ? [{ from: 0, to: nbfD, label: 'Not yet valid', tone: 'warn' as const }] : []),
          { from: nbfD, to: span, label: 'Valid', tone: 'good' },
          { from: span, to: hi + pad, label: 'Expired', tone: 'bad' },
        ],
      };
    }
    let status = 'No exp claim — this token does not expire by itself';
    if (typeof payload.exp === 'number') status = payload.exp < now ? `Expired ${relative(payload.exp - now)}` : `Valid — expires ${relative(payload.exp - now)}`;
    if (typeof payload.nbf === 'number' && payload.nbf > now) status = `Not valid yet — becomes valid ${relative(payload.nbf - now)}`;
    return {
      payload: JSON.stringify(payload, null, 2),
      header: JSON.stringify(header, null, 2),
      alg,
      iat: when(payload.iat),
      exp: when(payload.exp),
      nbf: when(payload.nbf),
      status,
      signature: alg === 'none' || !parts[2] ? 'None — unsigned token' : 'Present but NOT verified',
      chart,
      note: 'Decoded only — the signature has not been verified, so do not trust these claims until your server checks it.',
    };
  },
  content: {
    body: [
      'A JSON Web Token is three Base64URL-encoded pieces joined by dots: a header saying how the token was signed, a payload of claims about the user or session, and a signature. Decoding the first two needs no key at all, which is why you should never put secrets like passwords in a JWT payload.',
      'This tool decodes the header and payload and converts the standard time claims — iat (issued at), exp (expiry) and nbf (not before) — from Unix seconds into readable UTC dates, and tells you whether the token has expired according to your computer\'s clock.',
      'It does not verify the signature. Anyone can create a token with any claims; only a check against the signing secret or public key proves it was issued by who you think. Treat what you see here as unverified information for debugging.',
      'Decoding happens entirely in your browser. The token is never sent to a server, so it is safe to paste production tokens — though it is still good practice to revoke tokens you have exposed elsewhere.',
    ],
    faq: [
      { q: 'Why is the signature not verified?', a: 'Verification needs the secret (for HS256) or the issuer\'s public key (for RS256/ES256), which this page does not ask for. Verify signatures in your backend with a maintained JWT library.' },
      { q: 'What do sub, aud and iss mean?', a: 'sub is the subject — usually the user ID. iss is the issuer that created the token, and aud is the audience the token is meant for. Your API should reject tokens with an unexpected issuer or audience.' },
      { q: 'Can I edit a JWT here?', a: 'You could change the payload, but the signature would no longer match and any correctly configured server would reject it. That is the whole point of signing.' },
    ],
  },
  related: ['base64', 'unix-timestamp', 'json-formatter', 'hash-generator'],
  examples: [
    {
      values: { token: SAMPLE },
      expect: {
        alg: 'HS256',
        iat: '2026-01-01 00:00:00 UTC',
        exp: '2027-01-01 00:00:00 UTC',
        nbf: '—',
        header: '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
        payload: '{\n  "sub": "1234567890",\n  "name": "Jane Developer",\n  "role": "admin",\n  "iat": 1767225600,\n  "exp": 1798761600\n}',
        signature: 'Present but NOT verified',
      },
    },
    { values: { token: 'abc.def' }, expect: { error: 'A JWT has 3 parts separated by dots; this has 2.' } },
    { values: { token: 'Bearer eyJhbGciOiJub25lIn0.eyJleHAiOjEwMDAwMDAwMDB9.' }, expect: { alg: 'none', exp: '2001-09-09 01:46:40 UTC', signature: 'None — unsigned token' } },
  ],
});
