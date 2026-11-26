import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const DAY = 86400;

/** Seconds -> short human string, e.g. 86.4 s, 43 min 12 s, 8 h 45 min 36 s, 3 d 15 h 36 min. */
function fmt(totalSec: number): string {
  const s = Math.round(totalSec * 10) / 10;
  if (s < 100) return `${s} s`;
  if (s < 3600) {
    const m = Math.floor(s / 60);
    const r = Math.round((s - m * 60) * 10) / 10;
    return r ? `${m} min ${r} s` : `${m} min`;
  }
  const whole = Math.round(s);
  const d = Math.floor(whole / DAY);
  const h = Math.floor((whole % DAY) / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const r = whole % 60;
  return [d ? `${d} d` : '', h ? `${h} h` : '', m ? `${m} min` : '', r && !d ? `${r} s` : ''].filter(Boolean).join(' ');
}

export default defineCalculator({
  slug: 'uptime-downtime',
  title: 'Uptime and Downtime Calculator (SLA Nines)',
  category: 'developer',
  description: 'Turn an availability target like 99.9% into the downtime it allows per day, week, month and year, or work out the availability from minutes of downtime.',
  metaDescription: 'Uptime calculator: see how much downtime 99.9%, 99.99% or any SLA percentage allows per day, week, month and year, or convert downtime into availability.',
  updated: '2026-11-26',
  keywords: ['uptime calculator', 'downtime calculator', 'sla calculator', 'availability calculator', 'nines of availability', '99.9 uptime downtime per year', 'five nines'],
  inputs: [
    {
      id: 'mode', label: 'I want to', type: 'select', default: 'forward', segmented: true,
      options: [
        { value: 'forward', label: 'Find downtime' },
        { value: 'reverse', label: 'Find availability' },
      ],
      info: 'Find downtime turns an availability target into allowed downtime. Find availability turns downtime you had into an availability percentage.',
    },
    { id: 'pct', label: 'Availability target', type: 'number', default: 99.9, min: 0, max: 100, step: 0.001, suffix: '%', showWhen: { input: 'mode', is: 'forward' }, info: 'The uptime promise, for example 99.9 for "three nines" or 99.99 for "four nines".' },
    { id: 'customDays', label: 'Custom period (optional)', type: 'number', optional: true, min: 0.0001, step: 1, suffix: 'days', placeholder: 'e.g. 90', showWhen: { input: 'mode', is: 'forward' }, info: 'Add your own period, such as a 90-day quarter, to get one more row of allowed downtime. Leave blank to skip.' },
    { id: 'downMin', label: 'Downtime', type: 'number', default: 43.2, min: 0, step: 0.1, suffix: 'minutes', showWhen: { input: 'mode', is: 'reverse' }, info: 'Total minutes the service was unavailable during the period.' },
    { id: 'periodDays', label: 'Period length', type: 'number', default: 30, min: 0.0001, step: 1, suffix: 'days', showWhen: { input: 'mode', is: 'reverse' }, info: 'The length of the measurement window in days. Use 30 for a month or 365 for a year.' },
  ],
  outputs: [
    { id: 'perYear', label: 'Allowed per year (365 days)', format: 'text', primary: true, showWhen: { input: 'mode', is: 'forward' }, info: 'Downtime allowed in 365 days: (1 - availability) × 525,600 minutes.' },
    { id: 'perMonth', label: 'Allowed per month (30 days)', format: 'text', showWhen: { input: 'mode', is: 'forward' }, info: 'Downtime allowed in a 30-day month.' },
    { id: 'perWeek', label: 'Allowed per week', format: 'text', showWhen: { input: 'mode', is: 'forward' }, info: 'Downtime allowed in 7 days.' },
    { id: 'perDay', label: 'Allowed per day', format: 'text', showWhen: { input: 'mode', is: 'forward' }, info: 'Downtime allowed in 24 hours.' },
    { id: 'perCustom', label: 'Allowed in custom period', format: 'text', showWhen: { input: 'mode', is: 'forward' }, info: 'Downtime allowed in the custom period you entered. Blank when no custom period is set.' },
    { id: 'availability', label: 'Availability', format: 'percent', precision: 4, primary: true, showWhen: { input: 'mode', is: 'reverse' }, info: 'Uptime as a share of the period: 1 - downtime ÷ period.' },
    { id: 'budget', label: 'Downtime in seconds', format: 'number', precision: 1, suffix: 's', showWhen: { input: 'mode', is: 'reverse' }, info: 'The downtime you entered, converted to seconds.' },
  ],
  compute: (v) => {
    if (v.mode === 'reverse') {
      const d = num(v.downMin);
      const p = num(v.periodDays);
      if (d === null || p === null || d < 0 || p <= 0) {
        return { availability: null, error: 'Enter downtime of zero or more minutes and a period longer than zero days.' };
      }
      const periodMin = p * 1440;
      if (d > periodMin) return { availability: null, error: 'Downtime cannot be longer than the period itself.' };
      const a = 1 - d / periodMin;
      return {
        availability: a,
        budget: d * 60,
        tone: a >= 0.999 ? 'good' : a >= 0.99 ? 'ok' : 'warn',
        badge: `${+(a * 100).toFixed(4)}%`,
        steps: [
          `Period = ${p} days × 1,440 minutes = ${+periodMin.toFixed(2)} minutes`,
          `Availability = 1 - ${d} ÷ ${+periodMin.toFixed(2)} = ${+(a * 100).toFixed(4)}%`,
        ],
      };
    }
    const pct = num(v.pct);
    if (pct === null || pct < 0 || pct > 100) {
      return { perYear: null, error: 'Enter an availability between 0 and 100 percent.' };
    }
    const frac = 1 - pct / 100;
    const cd = num(v.customDays);
    const custom = cd !== null && cd > 0 ? fmt(frac * cd * DAY) : null;
    return {
      perYear: fmt(frac * 365 * DAY),
      perMonth: fmt(frac * 30 * DAY),
      perWeek: fmt(frac * 7 * DAY),
      perDay: fmt(frac * DAY),
      perCustom: custom,
      tone: pct >= 99.9 ? 'good' : pct >= 99 ? 'ok' : 'warn',
      badge: `${pct}% uptime`,
      steps: [
        `Allowed fraction of downtime = 1 - ${pct} ÷ 100 = ${+frac.toPrecision(6)}`,
        `Per year: ${+frac.toPrecision(6)} × 525,600 minutes = ${+(frac * 525600).toFixed(2)} minutes`,
        `Per day: ${+frac.toPrecision(6)} × 86,400 seconds = ${+(frac * DAY).toFixed(2)} seconds`,
      ],
    };
  },
  content: {
    formula: ['allowed downtime = (1 - availability ÷ 100) × period', 'availability = (1 - downtime ÷ period) × 100'],
    body: [
      'Availability, or uptime, is the share of a period during which a service works. A 99.9% target ("three nines") means the service may be down 0.1% of the time. Multiply that fraction by the period to get the downtime budget.',
      'Over a 365-day year there are 525,600 minutes. At 99.9% the budget is 525,600 × 0.001 = 525.6 minutes, or 8 hours 45 minutes 36 seconds. Per 30-day month it is 43 minutes 12 seconds, per week 10 minutes 4.8 seconds and per day 86.4 seconds.',
      'Each extra nine cuts the budget by a factor of ten. 99% allows about 3 days 15 hours 36 minutes a year, 99.99% allows 52.56 minutes (52 min 33.6 s), and 99.999% ("five nines") allows about 5 minutes 15 seconds.',
      'Assumptions: a year is 365 days (no leap years), a month is 30 days and a week is 7 days. Real contracts may measure per calendar month, exclude planned maintenance or count partial outages, so check how your SLA defines downtime.',
      'This calculator runs entirely in your browser; nothing is uploaded.',
    ],
    faq: [
      { q: 'How much downtime is 99.9% uptime?', a: '86.4 seconds per day, 10 minutes 4.8 seconds per week, 43 minutes 12 seconds per 30-day month and 8 hours 45 minutes 36 seconds per 365-day year.' },
      { q: 'How much downtime is 99.99% uptime?', a: 'About 52.56 minutes (52 min 33.6 s) per 365-day year, 4 min 19.2 s per 30-day month and 8.6 seconds per day.' },
      { q: 'How much downtime is 99% uptime?', a: 'About 3 days 15 hours 36 minutes per 365-day year (87.6 hours), 7 hours 12 minutes per 30-day month and 14 minutes 24 seconds per day.' },
      { q: 'How do I convert downtime into availability?', a: 'Choose Find availability, enter the minutes of downtime and the period length. For example, 43.2 minutes of downtime in 30 days (43,200 minutes) gives 1 - 43.2 ÷ 43,200 = 99.9%.' },
    ],
    sources: [
      { label: 'Google SRE Book: Embracing Risk (availability and downtime)', url: 'https://sre.google/sre-book/embracing-risk/' },
      { label: 'Wikipedia: High availability', url: 'https://en.wikipedia.org/wiki/High_availability' },
    ],
  },
  related: ['download-time', 'cron-explainer', 'unix-timestamp'],
  examples: [
    // 99.9%: year 525600 min x 0.001 = 525.6 min = 8 h 45 min 36 s; 30 d = 43200 min x 0.001 = 43.2 min = 43 min 12 s; day 86.4 s; week 10080 x .001 = 10.08 min = 10 min 4.8 s
    { values: { mode: 'forward', pct: 99.9 }, expect: { perYear: '8 h 45 min 36 s', perMonth: '43 min 12 s', perWeek: '10 min 4.8 s', perDay: '86.4 s' } },
    // 99.99%: 525600 x 0.0001 = 52.56 min = 52 min 33.6 s; 90-day custom: 129600 min x 0.0001 = 12.96 min = 12 min 57.6 s
    { values: { mode: 'forward', pct: 99.99, customDays: 90 }, expect: { perYear: '52 min 33.6 s', perCustom: '12 min 57.6 s' } },
    // 99%: 525600 x 0.01 = 5256 min = 87.6 h = 3 d 15 h 36 min
    { values: { mode: 'forward', pct: 99 }, expect: { perYear: '3 d 15 h 36 min', perDay: '14 min 24 s' } },
    // reverse: 1 - 43.2/43200 = 0.999
    { values: { mode: 'reverse', downMin: 43.2, periodDays: 30 }, expect: { availability: 0.999, budget: 2592 } },
  ],
});
