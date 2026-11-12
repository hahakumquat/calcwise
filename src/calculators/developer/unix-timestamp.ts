import { defineCalculator } from '../../lib/types';
import { on, str } from '../../lib/helpers/text';

const MAX_MS = 8.64e15; // JavaScript Date range: ±100,000,000 days

function relative(ms: number, now: number): string {
  const sec = (ms - now) / 1000;
  const a = Math.abs(sec);
  if (a < 1) return 'now';
  const [n, u] =
    a < 90 ? [a, 'second'] : a < 5400 ? [a / 60, 'minute'] : a < 129600 ? [a / 3600, 'hour'] : a < 5184000 ? [a / 86400, 'day'] : a < 63072000 ? [a / 2629746, 'month'] : [a / 31556952, 'year'];
  const r = Math.round(n);
  const t = `${r} ${u}${r === 1 ? '' : 's'}`;
  return sec > 0 ? `in ${t}` : `${t} ago`;
}

/** Parses a timestamp or date string to epoch milliseconds. */
function parse(input: string, unit: string, local: boolean): { ms: number; how: string } | { error: string } {
  const s = input.trim();
  if (!s || /^now$/i.test(s)) return { ms: Date.now(), how: 'Current time' };
  if (/^[-+]?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    let u = unit;
    if (u === 'auto') {
      const a = Math.abs(n);
      u = a >= 1e17 ? 'ns' : a >= 1e14 ? 'us' : a >= 1e11 ? 'ms' : 's';
    }
    const factor = { s: 1000, ms: 1, us: 1e-3, ns: 1e-6 }[u] ?? 1000;
    const label = { s: 'seconds', ms: 'milliseconds', us: 'microseconds', ns: 'nanoseconds' }[u] ?? 'seconds';
    return { ms: n * factor, how: `Read as ${label}${unit === 'auto' ? ' (auto-detected from the number of digits)' : ''}` };
  }
  // ISO-like date without a zone: decide UTC vs local ourselves (engines disagree).
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?)?$/);
  if (m) {
    const [y, mo, d, h = 0, mi = 0, se = 0] = m.slice(1, 7).map((x) => Number(x ?? 0));
    const msPart = m[7] ? Number(m[7].padEnd(3, '0')) : 0;
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || se > 59) return { error: `"${s}" is not a valid date.` };
    const ms = local ? new Date(y, mo - 1, d, h, mi, se, msPart).getTime() : Date.UTC(y, mo - 1, d, h, mi, se, msPart);
    return { ms, how: `Date read as ${local ? 'your local time' : 'UTC'}` };
  }
  const ms = Date.parse(s);
  if (Number.isNaN(ms)) return { error: `Could not read "${s}". Enter a Unix timestamp (e.g. 1767225600) or a date like 2026-01-01 12:00 or 2026-01-01T12:00:00Z.` };
  return { ms, how: 'Date string parsed' };
}

export default defineCalculator({
  slug: 'unix-timestamp',
  title: 'Unix Timestamp Converter',
  category: 'developer',
  description: 'Convert Unix epoch timestamps in seconds or milliseconds to ISO 8601, UTC and local time — or turn a date back into a timestamp.',
  keywords: ['epoch converter', 'unix time', 'epoch time', 'timestamp to date', 'date to timestamp', 'posix time', 'milliseconds to date'],
  popular: true,
  layout: 'wide',
  inputs: [
    { id: 'value', info: 'A Unix timestamp in seconds, milliseconds or microseconds, a date such as 2026-01-01 12:00, or the word "now".', label: 'Timestamp or date', type: 'text', default: 'now', placeholder: '1767225600, 1767225600000 or 2026-01-01 12:00', help: 'Type "now" for the current time.' },
    {
      id: 'unit', info: 'The precision of a numeric timestamp. Auto guesses from the number of digits: 10 for seconds, 13 for milliseconds.',
      label: 'Timestamp unit',
      type: 'select',
      default: 'auto',
      segmented: true,
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 's', label: 'Seconds' },
        { value: 'ms', label: 'Milliseconds' },
        { value: 'us', label: 'Microseconds' },
      ],
    },
    { id: 'local', info: 'For dates typed without a time zone, use your device\'s time zone instead of UTC. Ignored for numeric timestamps.', label: 'Dates without a time zone are local time (otherwise UTC)', type: 'toggle', default: false },
  ],
  outputs: [
    { id: 'iso', info: 'The moment in ISO 8601 format, always in UTC (the trailing Z). The safest format for APIs and logs.', label: 'ISO 8601 (UTC)', format: 'text', primary: true },
    { id: 'seconds', info: 'The Unix timestamp in whole seconds — what most databases, shells and PHP use.', label: 'Unix seconds', format: 'text' },
    { id: 'millis', info: 'The Unix timestamp in milliseconds — what JavaScript Date.now() and Java return.', label: 'Unix milliseconds', format: 'text' },
    { id: 'utc', info: 'The same moment in the HTTP-date style used by email and web headers.', label: 'UTC', format: 'text' },
    { id: 'localTime', info: 'The moment in your device\'s time zone and locale.', label: 'Your local time', format: 'text' },
    { id: 'relative', info: 'How far that moment is from now, according to your device clock.', label: 'Relative to now', format: 'text' },
  ],
  compute: (v) => {
    const r = parse(str(v.value), str(v.unit) || 'auto', on(v.local));
    if ('error' in r) return { iso: null, error: r.error };
    const { ms, how } = r;
    if (!Number.isFinite(ms) || Math.abs(ms) > MAX_MS) return { iso: null, error: 'That timestamp is outside the range dates can represent (about ±275,000 years).' };
    const d = new Date(ms);
    const sec = Math.floor(ms / 1000);
    return {
      iso: d.toISOString(),
      seconds: String(sec),
      millis: String(Math.floor(ms)),
      utc: d.toUTCString(),
      localTime: d.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' }),
      relative: relative(ms, Date.now()),
      note: how,
    };
  },
  content: {
    formula: ['Unix time = seconds elapsed since 1970-01-01 00:00:00 UTC', 'milliseconds = seconds × 1000'],
    body: [
      'Unix time counts the seconds since the "epoch", midnight UTC on 1 January 1970, ignoring leap seconds. It is the same number everywhere on Earth at a given moment, which makes it the standard way to store and exchange times in databases, APIs and log files.',
      'Different systems use different precisions. Unix shells, PHP and most databases use seconds (10 digits for current dates); JavaScript\'s Date.now() and Java use milliseconds (13 digits); some tracing tools use microseconds (16 digits). Auto mode picks the unit from the number of digits, so you can paste whatever you have.',
      'To go the other way, type a date. A date without a time zone, such as 2026-03-15 09:30, is read as UTC unless you switch on local time; a full ISO string with Z or an offset like +02:00 is always unambiguous. Conversion uses your device\'s clock and time zone and runs entirely in the browser.',
    ],
    faq: [
      { q: 'What is the Year 2038 problem?', a: 'Systems that store Unix time as a signed 32-bit integer overflow at 03:14:07 UTC on 19 January 2038 (timestamp 2,147,483,647) and wrap to 1901. Modern systems use 64-bit integers, which last for billions of years.' },
      { q: 'Does Unix time include leap seconds?', a: 'No. Every Unix day is exactly 86,400 seconds. When a leap second occurs, clocks repeat or smear a second, so Unix time is not a precise count of physical seconds.' },
      { q: 'How do I get the current timestamp in code?', a: 'JavaScript: Math.floor(Date.now() / 1000). Python: int(time.time()). Shell: date +%s. SQL (PostgreSQL): extract(epoch from now()).' },
    ],
  },
  related: ['cron-explainer', 'jwt-decoder', 'date-difference'],
  examples: [
    { values: { value: '1767225600', unit: 'auto', local: 'off' }, expect: { iso: '2026-01-01T00:00:00.000Z', millis: '1767225600000', utc: 'Thu, 01 Jan 2026 00:00:00 GMT' } },
    { values: { value: '1700000000123', unit: 'auto', local: 'off' }, expect: { iso: '2023-11-14T22:13:20.123Z', seconds: '1700000000' } },
    { values: { value: '2038-01-19 03:14:07', unit: 'auto', local: 'off' }, expect: { seconds: '2147483647' } },
    { values: { value: '2026-07-04T12:00:00+02:00', unit: 'auto', local: 'off' }, expect: { iso: '2026-07-04T10:00:00.000Z' } },
    { values: { value: '0', unit: 's', local: 'off' }, expect: { iso: '1970-01-01T00:00:00.000Z' } },
    { values: { value: 'yesterday-ish', unit: 'auto', local: 'off' }, expect: { error: 'Could not read "yesterday-ish". Enter a Unix timestamp (e.g. 1767225600) or a date like 2026-01-01 12:00 or 2026-01-01T12:00:00Z.' } },
  ],
});
