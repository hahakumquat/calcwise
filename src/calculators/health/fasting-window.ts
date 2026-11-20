import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmtClock, parseClock } from '../../lib/helpers/health';

const FIRST = { input: 'mode', is: 'first' };
const LAST = { input: 'mode', is: 'last' };

export default defineCalculator({
  slug: 'fasting-window',
  title: 'Intermittent Fasting Window Calculator',
  category: 'health',
  description: 'Work out your eating window and when your fast starts and ends for 12:12, 14:10, 16:8, 18:6 or 20:4 intermittent fasting from your first or last meal time.',
  keywords: ['intermittent fasting calculator', '16:8 fasting window', 'eating window calculator', 'fasting schedule', '18:6 fasting', 'when does my fast end'],
  updated: '2026-11-20',
  inputs: [
    {
      id: 'mode', label: 'I know my', type: 'select', default: 'first', segmented: true,
      options: [
        { value: 'first', label: 'First meal' },
        { value: 'last', label: 'Last meal' },
      ],
      info: 'Pick the meal you want to anchor the schedule on. The other end is worked out for you.',
    },
    { id: 'time', label: 'Meal time', type: 'text', default: '12:00', placeholder: 'HH:MM, e.g. 12:00 or 8:30 pm', help: '24-hour "HH:MM", or add am/pm.', info: 'The time of your first meal (to start the eating window) or last meal (to end it).' },
    {
      id: 'fast', label: 'Fasting hours', type: 'select', default: '16',
      options: [
        { value: '12', label: '12 h fast (12:12)' },
        { value: '14', label: '14 h fast (14:10)' },
        { value: '16', label: '16 h fast (16:8)' },
        { value: '18', label: '18 h fast (18:6)' },
        { value: '20', label: '20 h fast (20:4)' },
      ],
      info: 'Hours without food each day. The rest of the 24 hours is your eating window.',
    },
  ],
  outputs: [
    { id: 'lastMeal', label: 'Last meal by', primary: true, format: 'text', showWhen: FIRST, info: 'The time your eating window closes: first meal plus the eating window.' },
    { id: 'firstMeal', label: 'First meal at', primary: true, format: 'text', showWhen: LAST, info: 'The time your eating window opens: last meal minus the eating window.' },
    { id: 'eatHours', label: 'Eating window', format: 'integer', suffix: 'hours', info: '24 hours minus the fasting hours.' },
    { id: 'fastStart', label: 'Fast starts', format: 'text', info: 'The fast begins when the last meal ends.' },
    { id: 'fastEnd', label: 'Fast ends', format: 'text', info: 'The fast ends at the next first meal.' },
  ],
  compute: (v) => {
    const t = parseClock(v.time);
    const fast = Number(v.fast);
    const firstMode = v.mode !== 'last';
    const primaryId = firstMode ? 'lastMeal' : 'firstMeal';
    if (t === null) return { [primaryId]: null, error: 'Enter a time like 12:00, 20:30 or 8:30 pm.' };
    if (!Number.isFinite(fast) || fast <= 0 || fast >= 24) return { [primaryId]: null };
    const eat = 24 - fast;
    const first = firstMode ? t : t - eat * 60;
    const last = firstMode ? t + eat * 60 : t;
    const f = fmtClock(first);
    const l = fmtClock(last);
    return {
      [primaryId]: firstMode ? l : f,
      eatHours: eat,
      fastStart: l,
      fastEnd: f,
      chart: {
        type: 'donut',
        title: 'Your 24 hours',
        format: { format: 'integer', suffix: 'h' },
        slices: [
          { label: 'Eating window', value: eat },
          { label: 'Fasting', value: fast },
        ],
        centerValue: `${fast}:${eat}`,
        centerLabel: 'fast : eat',
      },
      steps: [
        `Eating window = 24 − ${fast} = ${eat} hours`,
        firstMode
          ? `Last meal = ${f} + ${eat} h = ${l}`
          : `First meal = ${l} − ${eat} h = ${f}`,
        `Fast runs from ${l} to ${f} the next day (${fast} hours)`,
      ],
      note: `Eat between ${f} and ${l}, then fast until ${f}. This is time arithmetic only, not medical advice.`,
    };
  },
  content: {
    formula: ['Eating window = 24 − fasting hours', 'Last meal = first meal + eating window', 'First meal = last meal − eating window'],
    body: [
      'Intermittent fasting splits the day into a fasting period and an eating window. The pattern is usually written as fasting hours : eating hours, so 16:8 means 16 hours without food and 8 hours in which you eat.',
      'Enter the time of your first meal and the calculator tells you when the eating window closes. Or enter your last meal, such as a late dinner, and it tells you when you can eat again. The times wrap past midnight, so a 20:00 last meal with a 16-hour fast ends at 12:00 the next day.',
      'This tool only does the clock arithmetic. It does not say whether fasting suits you, and it makes no health claims. People who are pregnant, have diabetes, take medication that must be taken with food, or have a history of disordered eating should talk to a doctor before fasting.',
    ],
    faq: [
      { q: 'What is a 16:8 fasting window?', a: 'You fast for 16 hours and eat within 8. With a first meal at 12:00 the window closes at 20:00, and the fast runs from 20:00 to 12:00 the next day.' },
      { q: 'What is the last meal for 18:6 if I start eating at 12:00?', a: '12:00 plus 6 hours is 18:00. The fast then lasts 18 hours, until 12:00 the next day.' },
      { q: 'I eat dinner at 9 pm. When can I eat again on 16:8?', a: 'Choose "Last meal", enter 9:00 pm and 16 fasting hours. The eating window is 8 hours, so your first meal is at 1:00 PM.' },
      { q: 'Is intermittent fasting safe for everyone?', a: 'No. Pregnant people, people with diabetes or a history of disordered eating, and anyone on medication tied to meals should check with a doctor first. This calculator is not medical advice.' },
    ],
    sources: [
      { label: 'Intermittent fasting: what is it (Johns Hopkins Medicine)', url: 'https://www.hopkinsmedicine.org/health/wellness-and-prevention/intermittent-fasting-what-is-it-and-how-does-it-work' },
    ],
  },
  related: ['tdee', 'weight-loss-goal', 'sleep', 'water-intake'],
  examples: [
    // 12:00 + 8 h = 20:00; fast 20:00 -> 12:00
    { values: { mode: 'first', time: '12:00', fast: '16' }, expect: { lastMeal: '8:00 PM', eatHours: 8, fastStart: '8:00 PM', fastEnd: '12:00 PM' } },
    // 12:00 + 6 h = 18:00
    { values: { mode: 'first', time: '12:00', fast: '18' }, expect: { lastMeal: '6:00 PM', eatHours: 6 } },
    // 21:00 - 8 h = 13:00
    { values: { mode: 'last', time: '9:00 pm', fast: '16' }, expect: { firstMeal: '1:00 PM', fastStart: '9:00 PM' } },
    // 20:00 + 12 h wraps past midnight = 8:00 AM
    { values: { mode: 'first', time: '20:00', fast: '12' }, expect: { lastMeal: '8:00 AM', eatHours: 12 } },
  ],
});
