import { defineCalculator, type ChartSpec } from '../../lib/types';
import { parseClock } from '../../lib/helpers/everyday';

const ZONES: [string, string][] = [
  ['Pacific/Honolulu', 'Honolulu (Hawaii)'],
  ['America/Anchorage', 'Anchorage (Alaska)'],
  ['America/Los_Angeles', 'Los Angeles (US Pacific)'],
  ['America/Vancouver', 'Vancouver (Canada Pacific)'],
  ['America/Denver', 'Denver (US Mountain)'],
  ['America/Phoenix', 'Phoenix (Arizona)'],
  ['America/Chicago', 'Chicago (US Central)'],
  ['America/Mexico_City', 'Mexico City'],
  ['America/New_York', 'New York (US Eastern)'],
  ['America/Toronto', 'Toronto (Canada Eastern)'],
  ['America/Bogota', 'Bogota (Colombia)'],
  ['America/Sao_Paulo', 'Sao Paulo (Brazil)'],
  ['America/Argentina/Buenos_Aires', 'Buenos Aires (Argentina)'],
  ['UTC', 'UTC (Coordinated Universal Time)'],
  ['Europe/London', 'London (UK)'],
  ['Europe/Dublin', 'Dublin (Ireland)'],
  ['Europe/Lisbon', 'Lisbon (Portugal)'],
  ['Europe/Paris', 'Paris (France)'],
  ['Europe/Berlin', 'Berlin (Germany)'],
  ['Europe/Madrid', 'Madrid (Spain)'],
  ['Europe/Athens', 'Athens (Greece)'],
  ['Europe/Istanbul', 'Istanbul (Turkey)'],
  ['Europe/Moscow', 'Moscow (Russia)'],
  ['Africa/Cairo', 'Cairo (Egypt)'],
  ['Africa/Lagos', 'Lagos (Nigeria)'],
  ['Africa/Johannesburg', 'Johannesburg (South Africa)'],
  ['Asia/Dubai', 'Dubai (UAE)'],
  ['Asia/Karachi', 'Karachi (Pakistan)'],
  ['Asia/Kolkata', 'Mumbai / Delhi (India)'],
  ['Asia/Dhaka', 'Dhaka (Bangladesh)'],
  ['Asia/Bangkok', 'Bangkok (Thailand)'],
  ['Asia/Singapore', 'Singapore'],
  ['Asia/Shanghai', 'Shanghai / Beijing (China)'],
  ['Asia/Hong_Kong', 'Hong Kong'],
  ['Asia/Tokyo', 'Tokyo (Japan)'],
  ['Asia/Seoul', 'Seoul (South Korea)'],
  ['Australia/Perth', 'Perth (Western Australia)'],
  ['Australia/Sydney', 'Sydney (Australia East)'],
  ['Pacific/Auckland', 'Auckland (New Zealand)'],
];

const label = (z: string) => ZONES.find((x) => x[0] === z)?.[1] ?? z;
const MIN = 60000;

/** UTC offset of `zone` in minutes at the instant `ms` (formatToParts, so it is locale independent). */
function offsetMin(zone: string, ms: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
  }).formatToParts(new Date(ms));
  const p: Record<string, number> = {};
  for (const x of parts) if (x.type !== 'literal') p[x.type] = Number(x.value);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / MIN);
}

function fmtOffset(m: number): string {
  const s = m < 0 ? '-' : '+';
  const a = Math.abs(m);
  const h = Math.floor(a / 60);
  const mm = a % 60;
  return `UTC${s}${h}${mm ? ':' + String(mm).padStart(2, '0') : ''}`;
}

/** Standard (non-DST) offset for the year of `ms`: the smaller of the January and July offsets. */
function standardOffset(zone: string, year: number): number {
  return Math.min(offsetMin(zone, Date.UTC(year, 0, 1)), offsetMin(zone, Date.UTC(year, 6, 1)));
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

export default defineCalculator({
  slug: 'time-zone-converter',
  title: 'Time Zone Converter',
  category: 'everyday',
  description: 'Convert a time between world time zones for any date, with the day shift, UTC offsets and daylight saving changes.',
  keywords: ['time zone converter', 'time difference', 'convert time between cities', 'EST to GMT', 'meeting planner', 'UTC offset', 'daylight saving time'],
  inputs: [
    { id: 'date', label: 'Date', type: 'date', default: 'today', info: 'The calendar date in the "from" zone. The date matters because daylight saving time changes the offset during the year.' },
    { id: 'time', label: 'Time', type: 'text', default: '12:00', placeholder: 'HH:MM or 9:00 am', info: 'The local clock time in the "from" zone, in 24-hour (14:30) or 12-hour (2:30 pm) format.' },
    { id: 'from', label: 'From zone', type: 'select', default: 'America/New_York', options: ZONES.map(([value, l]) => ({ value, label: l })), info: 'The time zone the time above is in.' },
    { id: 'to', label: 'To zone', type: 'select', default: 'Europe/London', options: ZONES.map(([value, l]) => ({ value, label: l })), info: 'The time zone to convert into.' },
  ],
  outputs: [
    { id: 'outTime', label: 'Converted time', format: 'text', primary: true, info: 'The clock time in the "to" zone, in 24-hour format.' },
    { id: 'outDate', label: 'Converted date', format: 'text', info: 'The calendar date in the "to" zone.' },
    { id: 'shift', label: 'Day shift', format: 'text', info: 'Whether the converted time falls on the previous day, the same day or the next day compared with the original.' },
    { id: 'fromOffset', label: 'From zone offset', format: 'text', info: 'The UTC offset of the "from" zone on that date, including daylight saving time if it applies.' },
    { id: 'toOffset', label: 'To zone offset', format: 'text', info: 'The UTC offset of the "to" zone on that date, including daylight saving time if it applies.' },
  ],
  compute: (v) => {
    const date = typeof v.date === 'string' ? v.date : null;
    const dm = date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const mins = parseClock(v.time);
    const from = String(v.from ?? '');
    const to = String(v.to ?? '');
    if (!dm || mins === null) return { outTime: null, error: 'Enter a date and a time such as 14:30 or 2:30 pm.' };
    if (!ZONES.some((z) => z[0] === from) || !ZONES.some((z) => z[0] === to)) return { outTime: null, error: 'Choose both time zones.' };
    const [y, mo, d] = [Number(dm[1]), Number(dm[2]), Number(dm[3])];
    const wall = Date.UTC(y, mo - 1, d, 0, mins); // wall clock read as if it were UTC
    if (new Date(wall).getUTCMonth() !== mo - 1 && mins < 1440) return { outTime: null, error: 'That date does not exist.' };

    // Find the instant(s) whose from-zone wall clock equals `wall`.
    const offs = [...new Set([offsetMin(from, wall - 86400000), offsetMin(from, wall + 86400000)])];
    const valid = offs.filter((o) => offsetMin(from, wall - o * MIN) === o);
    const notes: string[] = [];
    let fromOff: number;
    if (valid.length === 0) {
      fromOff = offs[0]; // pre-transition offset pushes the time forward past the gap
      notes.push(`${label(from)} skips this time on that date because clocks jump forward, so it is treated as one hour later.`);
    } else {
      fromOff = Math.max(...valid); // ambiguous: take the first (earlier) occurrence
      if (valid.length > 1) notes.push(`${label(from)} shows this time twice on that date because clocks go back. The first (daylight saving) occurrence is used.`);
    }
    const instant = wall - fromOff * MIN;
    const toOff = offsetMin(to, instant);
    const shiftedFromOff = offsetMin(from, instant); // actual offset at the instant (differs from fromOff inside a gap)

    const out = new Date(instant + toOff * MIN); // read with UTC getters = to-zone wall clock
    const outDay = Math.floor((instant + toOff * MIN) / 86400000);
    const inWallInstant = instant + shiftedFromOff * MIN;
    const inDay = Math.floor(inWallInstant / 86400000);
    const dayDiff = outDay - inDay;
    const shift = dayDiff === 0 ? 'Same day' : dayDiff > 0 ? 'Next day' : 'Previous day';
    const timeStr = `${pad(out.getUTCHours())}:${pad(out.getUTCMinutes())}`;
    const dateStr = `${DAY_NAMES[out.getUTCDay()]}, ${out.getUTCDate()} ${MONTH_NAMES[out.getUTCMonth()]} ${out.getUTCFullYear()}`;
    const isoOut = `${out.getUTCFullYear()}-${pad(out.getUTCMonth() + 1)}-${pad(out.getUTCDate())}`;

    for (const [z, o] of [[from, shiftedFromOff], [to, toOff]] as [string, number][]) {
      if (o > standardOffset(z, y)) notes.push(`${label(z)} is on daylight saving time on this date (${fmtOffset(o)}).`);
    }
    const diffH = (toOff - shiftedFromOff) / 60;
    const inClock = (inWallInstant % 86400000 + 86400000) % 86400000 / 3600000;
    const outClock = out.getUTCHours() + out.getUTCMinutes() / 60;
    const chart: ChartSpec[] = [{
      type: 'bar',
      title: 'Clock time in each zone (hour of day)',
      categories: [label(from), label(to)],
      series: [{ name: 'Hour', values: [Math.round(inClock * 100) / 100, Math.round(outClock * 100) / 100] }],
      format: { suffix: 'h' },
    }];
    const sign = diffH >= 0 ? '+' : '';
    return {
      outTime: timeStr,
      outDate: dateStr,
      shift,
      fromOffset: fmtOffset(shiftedFromOff),
      toOffset: fmtOffset(toOff),
      chart,
      tone: 'ok',
      badge: dayDiff === 0 ? `${sign}${diffH} h, same day` : `${sign}${diffH} h, ${shift.toLowerCase()}`,
      note: notes.length ? notes.join(' ') : undefined,
      steps: [
        `${date} ${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)} in ${from} is UTC${shiftedFromOff >= 0 ? '+' : '-'}${Math.abs(shiftedFromOff) / 60} h`,
        `Time in ${to} = UTC time + ${fmtOffset(toOff)} = ${isoOut} ${timeStr}`,
        `Difference between the zones = ${sign}${diffH} h`,
      ],
    };
  },
  content: {
    formula: ['UTC time = local time − UTC offset of the from zone', 'Converted time = UTC time + UTC offset of the to zone'],
    body: [
      'Pick the date and time in one city, then the zone you want to convert to. The calculator works out the exact moment in UTC using the offset that zone has on that date, then shows what the clocks read in the other zone.',
      'The date matters because many places change their clocks for daylight saving time. New York is 5 hours behind London in winter but only 4 hours behind for a few weeks in spring and autumn when the US and the UK switch on different days.',
      'Everything runs in your browser using the time zone rules built into it, which come from the IANA time zone database. Nothing you enter is sent anywhere.',
    ],
    sections: [
      {
        heading: 'Daylight saving time and odd local times',
        paragraphs: [
          'When clocks jump forward, one hour of local time never happens, for example 02:30 on the spring-forward date in New York. The calculator treats such a time as one hour later and tells you. When clocks go back, one hour happens twice, and the calculator uses the first occurrence and says so.',
          'A note appears whenever a zone is on daylight saving time on your chosen date, meaning its offset is larger than its winter or standard offset. Zones such as Phoenix, Tokyo, Dubai and Singapore do not change their clocks at all.',
        ],
      },
    ],
    faq: [
      { q: 'What is 12:00 in New York in London?', a: 'On 24 December 2026, noon in New York (UTC-5) is 17:00 in London (UTC+0), the same day. In summer both places are on daylight saving time, but because the switch dates differ, the gap can briefly be 4 hours.' },
      { q: 'How do I convert a time that crosses midnight?', a: 'The result shows a day shift. 20:00 on 24 December 2026 in New York (UTC-5) is 10:00 on 25 December in Tokyo (UTC+9), a 14 hour difference, so it lands on the next day.' },
      { q: 'Does the calculator account for daylight saving time?', a: 'Yes. The offset is looked up for the exact date you choose. For example 09:00 in Los Angeles on 1 July 2026 (UTC-7) is 17:00 in London (UTC+1), an 8 hour gap. Because the US and the UK start and end daylight saving time on different dates, the gap between them can differ by an hour for a few weeks a year.' },
      { q: 'Why is the time zone list limited?', a: 'The list covers about 40 widely used zones. Many countries share one of them, for example Berlin and Paris, or Mumbai and Delhi, which both use Asia/Kolkata.' },
    ],
    sources: [
      { label: 'IANA Time Zone Database', url: 'https://www.iana.org/time-zones' },
      { label: 'Unicode CLDR: Time zone names and formats', url: 'https://cldr.unicode.org/' },
      { label: 'MDN: Intl.DateTimeFormat', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat' },
    ],
  },
  related: ['hours-worked', 'date-difference', 'time-duration'],
  examples: [
    // New York Dec = UTC-5, London Dec = UTC+0: 12:00 + 5 h = 17:00 same day.
    { values: { date: '2026-12-24', time: '12:00', from: 'America/New_York', to: 'Europe/London' }, expect: { outTime: '17:00', outDate: 'Thu, 24 Dec 2026', shift: 'Same day', fromOffset: 'UTC-5', toOffset: 'UTC+0' } },
    // LA July = UTC-7 (PDT), London July = UTC+1 (BST): 09:00 + 8 h = 17:00 same day.
    { values: { date: '2026-07-01', time: '09:00', from: 'America/Los_Angeles', to: 'Europe/London' }, expect: { outTime: '17:00', shift: 'Same day', fromOffset: 'UTC-7', toOffset: 'UTC+1' } },
    // NY Dec = UTC-5, Tokyo = UTC+9: 20:00 + 14 h = 10:00 next day (25 Dec).
    { values: { date: '2026-12-24', time: '20:00', from: 'America/New_York', to: 'Asia/Tokyo' }, expect: { outTime: '10:00', outDate: 'Fri, 25 Dec 2026', shift: 'Next day', fromOffset: 'UTC-5', toOffset: 'UTC+9' } },
    // Kolkata is UTC+5:30; NY Dec UTC-5; 08:00 NY = 13:00 UTC = 18:30 Kolkata.
    { values: { date: '2026-12-24', time: '8:00 am', from: 'America/New_York', to: 'Asia/Kolkata' }, expect: { outTime: '18:30', toOffset: 'UTC+5:30' } },
    // US spring forward 2026-03-08: 02:30 does not exist in New York; treated as 03:30 EDT (UTC-4) = 07:30 UTC = 07:30 London (GMT).
    { values: { date: '2026-03-08', time: '02:30', from: 'America/New_York', to: 'Europe/London' }, expect: { outTime: '07:30', fromOffset: 'UTC-4' } },
  ],
});
