import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

function clock(totalMin: number): string {
  const m = ((Math.round(totalMin) % 1440) + 1440) % 1440;
  const hh = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  return `${hh % 12 || 12}:${mm} ${hh < 12 ? 'am' : 'pm'}`;
}

function hm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`;
}

// Serve times every 15 minutes from 10:00 am to 10:00 pm; the value is minutes after midnight.
const SERVE_OPTIONS = Array.from({ length: 49 }, (_, i) => {
  const m = 600 + i * 15;
  return { value: String(m), label: clock(m) };
});

export default defineCalculator({
  slug: 'dinner-timeline',
  title: 'Holiday Dinner Timeline Calculator',
  category: 'food',
  description: 'Work backwards from serving time to see when to start every dish for Thanksgiving or Christmas dinner, sorted into one simple schedule.',
  keywords: ['holiday dinner timeline', 'thanksgiving dinner schedule', 'when to start cooking thanksgiving dinner', 'christmas dinner timeline', 'cooking schedule calculator', 'work backwards from serve time'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'serve', label: 'Serve dinner at', type: 'select', default: '1020', options: SERVE_OPTIONS, info: 'When food should be on the table. Every dish is timed to be ready at this moment.' },
    { id: 'dishes', label: 'Dishes (one per line: name, minutes)', type: 'textarea', rows: 6, default: 'Turkey, 285\nCasserole, 60\nRolls, 25', placeholder: 'Turkey, 285', info: 'Write the dish, a comma, then the total minutes from starting it to ready to serve: prep, cooking and any rest. For example "Turkey, 285" for 255 minutes of roasting plus a 30 minute rest.' },
    { id: 'buffer', label: 'Safety buffer', type: 'number', suffix: 'min', default: 0, min: 0, max: 180, step: 5, optional: true, info: 'Extra minutes added to every dish so nothing is rushed. 15 to 30 is common for big meals.' },
  ],
  outputs: [
    { id: 'first', label: 'Start the first dish at', format: 'text', primary: true, info: 'Serve time minus the longest dish time minus the buffer.' },
    { id: 'firstDish', label: 'First dish', format: 'text', info: 'The dish with the earliest start.' },
    { id: 'count', label: 'Dishes', format: 'integer', info: 'How many dishes were read from your list.' },
    { id: 'span', label: 'Kitchen time, first start to serving', format: 'text', info: 'From the first start to the serve time.' },
  ],
  compute: (v) => {
    const serve = Number(v.serve);
    const buffer = Math.max(0, num(v.buffer) ?? 0);
    if (!Number.isFinite(serve)) return { first: null };
    const rows: { name: string; min: number }[] = [];
    for (const raw of String(v.dishes ?? '').split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      const i = line.lastIndexOf(',');
      if (i < 1) return { first: null, error: `Write each dish as "name, minutes". Line "${line}" has no comma.` };
      const name = line.slice(0, i).trim();
      const min = Number(line.slice(i + 1).trim());
      if (!name || !Number.isFinite(min) || min <= 0) return { first: null, error: `Could not read the minutes on the line "${line}". Use a number above zero, like "Rolls, 25".` };
      rows.push({ name, min });
    }
    if (rows.length === 0) return { first: null, error: 'Add at least one dish, like "Turkey, 285".' };
    const plan = rows
      .map((r) => ({ ...r, start: serve - r.min - buffer }))
      .sort((a, b) => a.start - b.start);
    const earliest = plan[0];
    const dayNote = earliest.start < 0 ? ' (the day before)' : '';
    const span = serve - earliest.start;
    return {
      first: clock(earliest.start) + dayNote,
      firstDish: earliest.name,
      count: plan.length,
      span: hm(span),
      tone: 'ok',
      badge: `Start at ${clock(earliest.start)}`,
      note: `Serving at ${clock(serve)}: start ${earliest.name} first at ${clock(earliest.start)}${dayNote}. The calculator does not check whether dishes need the same oven at the same time.`,
      chart: {
        type: 'bar',
        title: 'Hours before serving that each dish starts',
        categories: plan.map((p) => p.name),
        series: [{ name: 'Hours before serving', values: plan.map((p) => +((p.min + buffer) / 60).toFixed(2)) }],
        horizontal: true,
        format: { suffix: ' h' },
      },
      steps: [
        ...plan.map((p) => `${clock(p.start)}${p.start < 0 ? ' (day before)' : ''}: start ${p.name} (${hm(p.min)}${buffer ? ` + ${buffer} min buffer` : ''})`),
        `${clock(serve)}: serve`,
      ],
    };
  },
  content: {
    formula: [
      'Start time = serve time − dish minutes − buffer',
      'Dish minutes = prep + cooking + resting',
      'The schedule is every dish sorted by start time, earliest first',
    ],
    body: [
      'Hosting a holiday dinner means a dozen things that all need to be ready at once. The easiest way to plan is to work backwards: pick the time you want to eat, take away how long each dish needs, and that is when to start it.',
      'Enter each dish with the total minutes from starting it to being ready to serve. For a turkey, that includes the roasting time and the rest before carving; the turkey cooking time calculator gives the roasting time for your bird. For a casserole, count the prep as well as the bake.',
      'The calculator lists every dish in the order you need to start it. It does not know how many ovens or burners you have, so look over the schedule for dishes that need the oven at the same time. A safety buffer adds spare minutes to every dish. Everything runs in your browser.',
    ],
    faq: [
      { q: 'How do I work out when to start each dish?', a: 'Subtract the dish time and any buffer from the serve time. With dinner at 5:00 pm, a turkey that needs 285 minutes starts at 12:15 pm, because 5:00 pm minus 4 h 45 min is 12:15 pm.' },
      { q: 'What counts as dish minutes?', a: 'Everything from starting the dish to having it ready to serve: prep, cooking and resting. A casserole with 60 minutes in total starts at 4:00 pm for a 5:00 pm dinner.' },
      { q: 'What does the buffer do?', a: 'It adds the same extra minutes to every dish so nothing is rushed. A 15 minute buffer moves the 12:15 pm turkey start to 12:00 pm.' },
      { q: 'Does it check oven space?', a: 'No. It only counts time. If two dishes need the oven at once, adjust the plan yourself, for example by cooking one earlier and reheating it.' },
      { q: 'What if a dish starts the day before?', a: 'If the start time falls before midnight of the serving day, the calculator marks it as the day before.' },
    ],
    sources: [{ label: 'USDA FSIS: Let\'s Talk Turkey', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/lets-talk-turkey' }],
  },
  related: ['turkey-cooking-time', 'party-food-quantity', 'brine-calculator', 'cooking-converter', 'recipe-scaler'],
  examples: [
    // Serve 17:00 = 1020 min. Turkey 285 → 735 = 12:15 pm; casserole 60 → 960 = 4:00 pm; rolls 25 → 995 = 4:35 pm. Span 285 min = 4 h 45 min.
    { values: { serve: '1020', dishes: 'Turkey, 285\nCasserole, 60\nRolls, 25', buffer: 0 }, expect: { first: '12:15 pm', firstDish: 'Turkey', count: 3, span: '4 h 45 min' } },
    // Buffer 15: turkey 1020 − 285 − 15 = 720 = 12:00 pm; span 5 h.
    { values: { serve: '1020', dishes: 'Turkey, 285\nCasserole, 60', buffer: 15 }, expect: { first: '12:00 pm', firstDish: 'Turkey', count: 2, span: '5 h' } },
    // Serve 10:00 am = 600; a 720 min brisket → −120 = 10:00 pm the day before.
    { values: { serve: '600', dishes: 'Ham, 720', buffer: 0 }, expect: { first: '10:00 pm (the day before)', firstDish: 'Ham', count: 1, span: '12 h' } },
  ],
});
