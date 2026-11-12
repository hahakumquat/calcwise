import { defineCalculator, type ScaleChart } from '../../lib/types';
import { formatDate, num, parseDate } from '../../lib/math';
import { addDays, fmtShortDate } from '../../lib/helpers/health';

const LUTEAL = 14; // typical days from ovulation to next period

export default defineCalculator({
  slug: 'ovulation',
  title: 'Ovulation Calculator',
  category: 'health',
  description: 'Predict your ovulation day, fertile window and next period from your last period and cycle length.',
  keywords: ['fertile window', 'ovulation date', 'most fertile days', 'ovulation calendar', 'when do I ovulate', 'trying to conceive'],
  popular: true,
  inputs: [
    { id: 'lmp', label: 'First day of last period', type: 'date', default: 'today', info: 'The first day of full bleeding of your most recent period — day 1 of your cycle.' },
    { id: 'cycle', label: 'Average cycle length', type: 'number', suffix: 'days', default: 28, min: 21, max: 45, step: 1, info: 'Days from the first day of one period to the first day of the next. Average over the last few months; 28 is typical.' },
  ],
  outputs: [
    { id: 'ovulation', label: 'Estimated ovulation day', primary: true, format: 'text', info: 'The most likely day an egg is released: about 14 days before your next period is due.' },
    { id: 'fertile', label: 'Fertile window', format: 'text', info: 'The five days before ovulation, the day itself and one day after — when sex is most likely to lead to pregnancy.' },
    { id: 'nextPeriod', label: 'Next period expected', format: 'text', info: 'Your last period date plus your average cycle length.' },
    { id: 'dueIfConceived', label: 'Due date if you conceive this cycle', format: 'text', info: 'An estimated due date, 266 days after the predicted ovulation day.' },
    { id: 'upcoming', label: 'Next 6 cycles (fertile window → ovulation)', format: 'code', info: 'Predicted fertile windows and ovulation days for the following six cycles, assuming your cycle length stays the same.' },
  ],
  compute: (v) => {
    const lmp = parseDate(v.lmp);
    const c = num(v.cycle);
    if (!lmp || c === null) return { ovulation: null };
    if (c < 21 || c > 45) return { ovulation: null, error: 'Cycle length should be between 21 and 45 days.' };
    const cycle = Math.round(c);
    const ovDay = cycle - LUTEAL; // days after LMP
    const cycleInfo = (k: number) => {
      const start = addDays(lmp, k * cycle);
      const ov = addDays(start, ovDay);
      return { start, ov, from: addDays(ov, -5), to: addDays(ov, 1) };
    };
    const now = cycleInfo(0);
    const upcoming = [1, 2, 3, 4, 5, 6].map((k) => {
      const ci = cycleInfo(k);
      return `Cycle ${k}: ${fmtShortDate(ci.from)} – ${fmtShortDate(ci.to)} → ovulation ${fmtShortDate(ci.ov)}, ${ci.ov.getUTCFullYear()}`;
    });
    // Cycle-day scale (day 1 = first day of period).
    const ovCd = ovDay + 1;
    const fFrom = ovCd - 5;
    const fTo = ovCd + 2; // band end (exclusive): through ovulation + 1 day
    const bands: ScaleChart['bands'] = [{ from: 1, to: Math.min(6, fFrom), label: 'Period', tone: 'neutral' }];
    if (fFrom > 6) bands.push({ from: 6, to: fFrom, label: 'Follicular', tone: 'neutral' });
    bands.push({ from: fFrom, to: fTo, label: 'Fertile', tone: 'good' }, { from: fTo, to: cycle + 1, label: 'Luteal', tone: 'neutral' });
    return {
      ovulation: formatDate(now.ov),
      fertile: `${fmtShortDate(now.from)} – ${fmtShortDate(now.to)}, ${now.to.getUTCFullYear()}`,
      nextPeriod: formatDate(addDays(lmp, cycle)),
      dueIfConceived: formatDate(addDays(now.ov, 266)),
      upcoming: upcoming.join('\n'),
      chart: { type: 'scale', title: 'Your cycle (day 1 = first day of period)', min: 1, max: cycle + 1, value: ovCd, valueLabel: `Ovulation ≈ day ${ovCd}`, bands },
      steps: [`Ovulation ≈ last period + (${cycle} − 14) = ${ovDay} days after your period started`, 'Fertile window = 5 days before ovulation through 1 day after'],
      note: 'Calendar predictions are estimates and are not reliable as contraception. Ovulation tests or temperature tracking give a clearer signal.',
    };
  },
  content: {
    formula: ['Ovulation ≈ last period + (cycle length − 14) days', 'Fertile window = ovulation − 5 days … ovulation + 1 day', 'Next period = last period + cycle length'],
    body: [
      'Ovulation is the release of an egg from the ovary. The second half of the cycle — from ovulation to the next period, called the luteal phase — is fairly constant at about 14 days for most people, while the first half varies. So the best calendar estimate of ovulation is your cycle length minus 14 days, counted from the first day of your last period.',
      'Sperm can survive in the reproductive tract for up to five days, while the egg lives for only about a day. That makes the fertile window roughly six days long: the five days before ovulation and the day of ovulation itself (plus a day of margin here). The two or three days just before ovulation carry the highest chance of conception.',
      'Cycles vary from month to month, and illness, stress or travel can shift ovulation. If your cycles are irregular, ovulation predictor kits (which detect the LH surge), basal body temperature charts or cervical-mucus tracking are more reliable than any calendar. This calculator is for information only, is not medical advice and should not be used for birth control.',
    ],
    faq: [
      { q: 'What if my cycle length varies?', a: 'Use your average, but treat the dates as approximate. For a wider safety margin when trying to conceive, run the calculator with your shortest and longest cycles and combine the windows.' },
      { q: 'Can I get pregnant outside the fertile window?', a: 'It is unlikely but possible, because ovulation can come earlier or later than predicted. Calendar methods alone are not dependable contraception.' },
    ],
  },
  related: ['due-date', 'bmi', 'water-intake'],
  examples: [
    {
      values: { lmp: '2026-01-01', cycle: 28 },
      expect: { ovulation: 'Thu, January 15, 2026', fertile: 'Jan 10 – Jan 16, 2026', nextPeriod: 'Thu, January 29, 2026', dueIfConceived: 'Thu, October 8, 2026' },
    },
    { values: { lmp: '2026-03-01', cycle: 32 }, expect: { ovulation: 'Thu, March 19, 2026', nextPeriod: 'Thu, April 2, 2026' } },
  ],
});
