import { defineCalculator } from '../../lib/types';
import { DAY_MS, parseDate } from '../../lib/math';
import { str } from '../../lib/helpers/text';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *', '@monthly': '0 0 1 * *', '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@hourly': '0 * * * *',
};

type Token = { kind: 'value'; v: number } | { kind: 'range'; a: number; b: number; step: number } | { kind: 'step'; start: number; step: number };
type Field = { any: boolean; values: Set<number>; tokens: Token[] };
type Spec = { name: string; min: number; max: number; names?: string[]; unit: string };

const SPECS: Spec[] = [
  { name: 'minute', min: 0, max: 59, unit: 'minute' },
  { name: 'hour', min: 0, max: 23, unit: 'hour' },
  { name: 'day of month', min: 1, max: 31, unit: 'day' },
  { name: 'month', min: 1, max: 12, names: MONTHS, unit: 'month' },
  { name: 'day of week', min: 0, max: 7, names: DAYS, unit: 'day' },
];

function parseField(text: string, spec: Spec): Field | string {
  const values = new Set<number>();
  const tokens: Token[] = [];
  const num = (s: string): number | null => {
    if (/^\d+$/.test(s)) return Number(s);
    if (spec.names) {
      const i = spec.names.findIndex((n) => n.slice(0, 3).toLowerCase() === s.toLowerCase());
      if (i >= 0) return spec.name === 'month' ? i + 1 : i;
    }
    return null;
  };
  const bad = (msg: string) => `${spec.name[0].toUpperCase() + spec.name.slice(1)} field "${text}": ${msg}`;
  if (text === '*' || text === '?') {
    for (let i = spec.min; i <= spec.max; i++) values.add(i);
    return { any: true, values: norm(values, spec), tokens: [] };
  }
  for (const part of text.split(',')) {
    const m = part.match(/^([^/-]+|\*)(?:-([^/]+))?(?:\/(\d+))?$/);
    if (!m) return bad(/[LW#]/i.test(part) ? 'L, W and # are not supported in standard 5-field cron.' : `cannot read "${part}".`);
    const step = m[3] !== undefined ? Number(m[3]) : 1;
    if (step < 1) return bad('step must be at least 1.');
    let a: number;
    let b: number;
    if (m[1] === '*') {
      if (m[2] !== undefined) return bad(`cannot read "${part}".`);
      [a, b] = [spec.min, spec.max === 7 ? 6 : spec.max];
      tokens.push(m[3] ? { kind: 'step', start: a, step } : { kind: 'range', a, b, step: 1 });
    } else {
      const x = num(m[1]);
      if (x === null) return bad(`"${m[1]}" is not a valid value.`);
      a = x;
      if (m[2] !== undefined) {
        const y = num(m[2]);
        if (y === null) return bad(`"${m[2]}" is not a valid value.`);
        b = y;
        tokens.push({ kind: 'range', a, b, step });
      } else if (m[3] !== undefined) {
        b = spec.max === 7 ? 6 : spec.max;
        tokens.push({ kind: 'step', start: a, step });
      } else {
        b = a;
        tokens.push({ kind: 'value', v: a });
      }
    }
    if (a < spec.min || b > spec.max || a > spec.max) return bad(`values must be between ${spec.min} and ${spec.max}.`);
    if (a > b) return bad(`range ${a}-${b} goes backwards.`);
    for (let i = a; i <= b; i += step) values.add(i);
  }
  return { any: false, values: norm(values, spec), tokens };
}

/** Day-of-week 7 means Sunday. */
function norm(values: Set<number>, spec: Spec): Set<number> {
  if (spec.max === 7 && values.has(7)) {
    values.delete(7);
    values.add(0);
  }
  return values;
}

const pad = (n: number) => String(n).padStart(2, '0');
const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const joinAnd = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

function listPhrase(f: Field, spec: Spec): string {
  const name = (v: number) => (spec.name === 'month' ? MONTHS[v - 1] : spec.name === 'day of week' ? DAYS[v % 7] : String(v));
  return joinAnd(
    f.tokens.map((t) => {
      if (t.kind === 'value') return name(t.v);
      if (t.kind === 'step') return `every ${t.step === 2 ? 'other' : ordinal(t.step)} ${spec.unit}${t.start !== spec.min ? ` starting at ${name(t.start)}` : ''}`;
      const r = `${name(t.a)} through ${name(t.b)}`;
      return t.step > 1 ? `every ${t.step === 2 ? 'other' : ordinal(t.step)} ${spec.unit} from ${r}` : r;
    }),
  );
}

function describe(f: Field[]): string {
  const [mi, ho, dom, mon, dow] = f;
  const onlyStep = (x: Field) => (x.tokens.length === 1 && x.tokens[0].kind === 'step' && x.tokens[0].start === 0 ? x.tokens[0].step : null);
  const explicit = (x: Field) => !x.any && x.tokens.every((t) => t.kind === 'value');
  let time: string;
  if (explicit(mi) && explicit(ho) && mi.values.size * ho.values.size <= 6) {
    const times: string[] = [];
    for (const h of [...ho.values].sort((a, b) => a - b)) for (const m of [...mi.values].sort((a, b) => a - b)) times.push(`${pad(h)}:${pad(m)}`);
    time = `At ${joinAnd(times)}`;
  } else {
    const ms = onlyStep(mi);
    if (mi.any) time = 'Every minute';
    else if (ms) time = `Every ${ms} minutes`;
    else if (ho.any && mi.values.size === 1) time = mi.values.has(0) ? 'At the start of every hour' : `At ${[...mi.values][0]} minutes past every hour`;
    else time = `At minute ${listPhrase(mi, SPECS[0])}`;
    if (!ho.any) {
      const t = ho.tokens;
      const hs = onlyStep(ho);
      if (t.length === 1 && t[0].kind === 'range' && t[0].step === 1) time += `, between ${pad(t[0].a)}:00 and ${pad(t[0].b)}:59`;
      else if (hs) time += `, every ${hs === 2 ? 'other' : ordinal(hs)} hour`;
      else time += `, during hour ${listPhrase(ho, SPECS[1])}`;
    } else if (!mi.any && !ms && !(mi.values.size === 1)) time += ' past every hour';
  }
  const parts = [time];
  const domText = dom.any ? '' : explicit(dom) ? `on day ${joinAnd([...dom.values].sort((a, b) => a - b).map(String))} of the month` : `on ${listPhrase(dom, SPECS[2])} of the month`;
  const dowText = dow.any ? '' : `on ${listPhrase(dow, SPECS[4])}`;
  if (domText && dowText) parts.push(`${domText} or ${dowText}`);
  else if (domText || dowText) parts.push(domText || dowText);
  if (!mon.any) parts.push(`in ${listPhrase(mon, SPECS[3])}`);
  return parts.join(', ');
}

function nextRuns(f: Field[], from: number, count: number): number[] {
  const [mi, ho, dom, mon, dow] = f;
  const mins = [...mi.values].sort((a, b) => a - b);
  const hours = [...ho.values].sort((a, b) => a - b);
  const out: number[] = [];
  // Scan day by day for up to 28 years (covers Feb 29 on a specific weekday).
  for (let day = Math.floor(from / DAY_MS) * DAY_MS, n = 0; n < 366 * 28 && out.length < count; n++, day += DAY_MS) {
    const d = new Date(day);
    if (!mon.values.has(d.getUTCMonth() + 1)) continue;
    const domOk = dom.values.has(d.getUTCDate());
    const dowOk = dow.values.has(d.getUTCDay());
    // Vixie cron: if both day fields are restricted, either may match.
    const dayOk = !dom.any && !dow.any ? domOk || dowOk : domOk && dowOk;
    if (!dayOk) continue;
    for (const h of hours)
      for (const m of mins) {
        const t = day + h * 3600000 + m * 60000;
        if (t >= from && out.length < count) out.push(t);
      }
  }
  return out;
}

function fmt(t: number): string {
  const d = new Date(t);
  return `${DAYS[d.getUTCDay()].slice(0, 3)} ${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)} UTC`;
}

export default defineCalculator({
  slug: 'cron-explainer',
  title: 'Cron Expression Explainer',
  category: 'developer',
  description: 'Translate a 5-field cron expression into plain English and list its next scheduled run times.',
  keywords: ['cron', 'crontab', 'cron expression', 'cron schedule', 'crontab guru', 'cron parser', 'cron next run'],
  layout: 'wide',
  inputs: [
    { id: 'expr', info: 'Five space-separated fields: minute, hour, day of month, month, day of week. Macros like @daily and @hourly also work.', label: 'Cron expression', type: 'text', default: '*/15 9-17 * * 1-5', placeholder: 'minute hour day-of-month month day-of-week', help: 'Five fields, or a macro like @daily.' },
    { id: 'from', info: 'The date to start listing upcoming runs from. Runs are calculated in UTC starting at midnight of this date.', label: 'Show runs starting from', type: 'date', default: 'today', help: 'Times are calculated in UTC from midnight of this date.' },
  ],
  outputs: [
    { id: 'description', info: 'What the schedule means in everyday words.', label: 'In plain English', format: 'text', primary: true },
    { id: 'next', info: 'The next five times the job would fire, in UTC. Shift them if your server runs in another time zone.', label: 'Next 5 runs (UTC)', format: 'code' },
    { id: 'fields', info: 'Each of the five fields with its name and meaning, so you can check how cron reads every part.', label: 'Field breakdown', format: 'code' },
  ],
  compute: (v) => {
    let expr = str(v.expr).trim().replace(/\s+/g, ' ');
    if (!expr) return { description: null, error: 'Enter a cron expression.' };
    const macro = MACROS[expr.toLowerCase()];
    if (expr.toLowerCase() === '@reboot') return { description: 'Once, when the cron daemon starts (at system boot)', next: '—', fields: '@reboot' };
    if (macro) expr = macro;
    const raw = expr.split(' ');
    if (raw.length === 6) return { description: null, error: 'This has 6 fields. Standard cron uses 5 (minute hour day month weekday); remove the seconds or year field.' };
    if (raw.length !== 5) return { description: null, error: `A cron expression needs 5 fields separated by spaces; this has ${raw.length}.` };
    const fields: Field[] = [];
    for (let i = 0; i < 5; i++) {
      const f = parseField(raw[i], SPECS[i]);
      if (typeof f === 'string') return { description: null, error: f };
      fields.push(f);
    }
    const start = parseDate(v.from)?.getTime() ?? Math.floor(Date.now() / DAY_MS) * DAY_MS;
    const runs = nextRuns(fields, start, 5);
    // Runs per weekday over one week from the start date.
    const perDay = [0, 0, 0, 0, 0, 0, 0];
    const perDaySlots = fields[0].values.size * fields[1].values.size;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start + i * DAY_MS);
      const [, , dom, mon, dow] = fields;
      if (!mon.values.has(d.getUTCMonth() + 1)) continue;
      const domOk = dom.values.has(d.getUTCDate());
      const dowOk = dow.values.has(d.getUTCDay());
      if (!dom.any && !dow.any ? domOk || dowOk : domOk && dowOk) perDay[(d.getUTCDay() + 6) % 7] += perDaySlots;
    }
    const breakdown = SPECS.map((s, i) => `${raw[i].padEnd(10)} ${s.name.padEnd(13)} ${fields[i].any ? 'any' : listPhrase(fields[i], s)}`).join('\n');
    return {
      description: describe(fields),
      next: runs.length ? runs.map(fmt).join('\n') : 'This schedule never runs (for example, 30 February).',
      fields: breakdown,
      chart: perDay.some((x) => x > 0)
        ? {
            type: 'bar',
            title: 'Runs per weekday (first 7 days)',
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            series: [{ name: 'Runs', values: perDay }],
            format: { format: 'integer' },
          }
        : undefined,
      note: macro ? `${str(v.expr).trim()} is shorthand for "${macro}"` : undefined,
    };
  },
  content: {
    formula: ['┌ minute (0–59)  ┌ hour (0–23)  ┌ day of month (1–31)  ┌ month (1–12)  ┌ day of week (0–6, Sunday = 0 or 7)', '*  *  *  *  *'],
    body: [
      'A cron expression is five fields separated by spaces: minute, hour, day of the month, month and day of the week. Each field can be * (every value), a single number, a list (1,15), a range (9-17), or a step (*/15 means every 15th value; 0-30/10 means 0, 10, 20, 30). Months and weekdays also accept three-letter names like JAN or MON.',
      'One rule trips up almost everyone: when both day-of-month and day-of-week are restricted, cron runs when either matches, not both. "0 9 1 * MON" runs on the 1st of each month and also every Monday. If you want "the first Monday", you need a script-side check.',
      'The upcoming run times are calculated in UTC from midnight of the date you choose. Real cron daemons use the server\'s time zone, so shift the results if your server is not on UTC — and remember that daylight-saving changes can skip or repeat jobs scheduled between 01:00 and 03:00 local time.',
    ],
    faq: [
      { q: 'How do I run a job every 5 minutes?', a: 'Use */5 * * * *. The step applies within the field, so it runs at :00, :05, :10 and so on — not five minutes after the previous run finished.' },
      { q: 'Why does my expression have 6 or 7 fields?', a: 'Some tools such as Quartz and Spring add a seconds field at the start and sometimes a year at the end. This explainer reads standard Unix/Linux crontab syntax with 5 fields, which is also what GitHub Actions, Kubernetes CronJobs and most cloud schedulers use.' },
      { q: 'Are L, W and # supported?', a: 'No. "Last day of month" (L), nearest weekday (W) and "nth weekday" (#) are Quartz extensions that standard cron does not understand.' },
    ],
  },
  related: ['unix-timestamp', 'regex-tester'],
  examples: [
    {
      values: { expr: '*/15 9-17 * * 1-5', from: '2026-01-03' },
      expect: {
        description: 'Every 15 minutes, between 09:00 and 17:59, on Monday through Friday',
        next: 'Mon 2026-01-05 09:00 UTC\nMon 2026-01-05 09:15 UTC\nMon 2026-01-05 09:30 UTC\nMon 2026-01-05 09:45 UTC\nMon 2026-01-05 10:00 UTC',
      },
    },
    {
      values: { expr: '@monthly', from: '2026-01-15' },
      expect: { description: 'At 00:00, on day 1 of the month', next: 'Sun 2026-02-01 00:00 UTC\nSun 2026-03-01 00:00 UTC\nWed 2026-04-01 00:00 UTC\nFri 2026-05-01 00:00 UTC\nMon 2026-06-01 00:00 UTC' },
    },
    { values: { expr: '30 8,20 * JAN-MAR SUN', from: '2026-01-01' }, expect: { description: 'At 08:30 and 20:30, on Sunday, in January through March' } },
    { values: { expr: '0 0 13 * 5', from: '2026-02-01' }, expect: { next: 'Fri 2026-02-06 00:00 UTC\nFri 2026-02-13 00:00 UTC\nFri 2026-02-20 00:00 UTC\nFri 2026-02-27 00:00 UTC\nFri 2026-03-06 00:00 UTC' } },
    { values: { expr: '0 * * * *', from: '2026-01-01' }, expect: { description: 'At the start of every hour' } },
    { values: { expr: '0 */2 * * *', from: '2026-01-01' }, expect: { description: 'At minute 0, every other hour' } },
    { values: { expr: '0 0 30 2 *', from: '2026-01-01' }, expect: { next: 'This schedule never runs (for example, 30 February).' } },
    { values: { expr: '61 * * * *', from: '2026-01-01' }, expect: { error: 'Minute field "61": values must be between 0 and 59.' } },
  ],
});
