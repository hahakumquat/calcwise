import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'jet-lag-recovery',
  title: 'Jet Lag Recovery Calculator',
  category: 'health',
  description: 'Estimate how many days jet lag might last from the time zones you cross and your direction, using an editable rough rule of thumb. A guide, not medical advice.',
  keywords: ['jet lag calculator', 'how long does jet lag last', 'jet lag recovery time', 'time zones crossed', 'jet lag east vs west', 'jet lag days per time zone'],
  updated: '2026-11-27',
  inputs: [
    { id: 'zones', label: 'Time zones crossed', type: 'number', default: 6, min: 0, max: 12, step: 1, info: 'The difference in hours between your home clock and your destination clock. London to New York is 5; London to Tokyo is 9 (see the time zone converter).' },
    {
      id: 'direction', label: 'Direction of travel', type: 'select', default: 'east', segmented: true,
      options: [
        { value: 'west', label: 'West' },
        { value: 'east', label: 'East' },
      ],
      info: 'Flying east shortens your day and is usually reported as harder to adjust to than flying west.',
    },
    { id: 'west', label: 'Days per zone, westward', type: 'number', default: 1, min: 0.1, max: 3, step: 0.1, suffix: 'days', showWhen: { input: 'direction', is: 'west' }, info: 'A common rule of thumb is about 1 day per zone going west. It is not a measured constant, so change it to match your own experience.' },
    { id: 'east', label: 'Days per zone, eastward', type: 'number', default: 1.5, min: 0.1, max: 3, step: 0.1, suffix: 'days', showWhen: { input: 'direction', is: 'east' }, info: 'A common rule of thumb is about 1.5 days per zone going east. It is not a measured constant, so change it to match your own experience.' },
  ],
  outputs: [
    { id: 'days', label: 'Rough recovery time', format: 'number', suffix: ' days', primary: true, info: 'Time zones crossed multiplied by days per zone for your direction. A rough guide only.' },
    { id: 'perZone', label: 'Days per zone used', format: 'number', suffix: ' days', info: 'The factor for your direction of travel.' },
    { id: 'other', label: 'Same trip the other way', format: 'number', suffix: ' days', info: 'The same zones with the other direction\'s factor, for comparison.' },
  ],
  compute: (v) => {
    const zones = num(v.zones);
    const west = num(v.west) ?? 1;
    const east = num(v.east) ?? 1.5;
    const isEast = v.direction !== 'west';
    if (zones === null || zones < 0 || zones > 12) return { days: null };
    const f = isEast ? east : west;
    const o = isEast ? west : east;
    if (!(f > 0) || !(o > 0)) return { days: null };
    const days = zones * f;
    const other = zones * o;
    const dir = isEast ? 'east' : 'west';
    return {
      days,
      perZone: f,
      other,
      tone: days <= 2 ? 'good' : days <= 5 ? 'ok' : 'warn',
      badge: days === 0 ? 'No shift' : days <= 2 ? 'Mild' : days <= 5 ? 'Moderate' : 'Long',
      note: zones === 0
        ? 'No time zones crossed, so this rule of thumb gives no jet lag.'
        : `Crossing ${fmt(zones)} zone${zones === 1 ? '' : 's'} ${dir} at ${fmt(f)} day${f === 1 ? '' : 's'} per zone gives about ${fmt(days)} days. This is a rough rule of thumb, not a prediction or medical advice.`,
      chart: {
        type: 'bar',
        title: 'Rough recovery days for your zones',
        categories: ['West', 'East'],
        format: { format: 'number', suffix: ' days' },
        series: [{ name: 'Days', values: [isEast ? other : days, isEast ? days : other] }],
        highlight: isEast ? 1 : 0,
      },
      steps: [`Days = ${fmt(zones)} zones × ${fmt(f)} days per zone = ${fmt(days)} days`, `Other direction: ${fmt(zones)} × ${fmt(o)} = ${fmt(other)} days`],
    };
  },
  content: {
    formula: ['Recovery days = time zones crossed × days per zone', 'Default days per zone: 1 going west, 1.5 going east (editable)'],
    body: [
      'Jet lag is the mismatch between your body clock and the local time after a long flight. Many travel guides give a rule of thumb: roughly one day to adjust for each time zone crossed, a little more when flying east and a little less when flying west.',
      'This calculator multiplies the zones you cross by a days-per-zone figure. The defaults are 1 day per zone westward and 1.5 days per zone eastward. These are rough, commonly repeated numbers, not measured constants, so both are editable. Real recovery varies with age, sleep, light exposure and the trip itself.',
      'Treat the result as a planning guide, for example to decide how many days to leave before an important meeting. It is not medical advice. If you have a sleep disorder or take medicines that depend on timing, ask a doctor or pharmacist.',
    ],
    faq: [
      { q: 'How long does jet lag last after 6 zones?', a: 'With the defaults, 6 zones west is 6 × 1 = 6 days and 6 zones east is 6 × 1.5 = 9 days. It is a rough guide, and many people recover faster or slower.' },
      { q: 'Why is flying east harder?', a: 'Flying east asks you to sleep earlier than your body clock wants, which is usually reported as harder than staying up later going west. That is why the default eastward factor is higher, 1.5 against 1 day per zone.' },
      { q: 'What if I cross no time zones?', a: 'The calculator returns 0 days, because zones × days per zone is 0.' },
      { q: 'Can I change the days per zone?', a: 'Yes. The days-per-zone box for your direction is editable, from 0.1 to 3. For example, 3 zones east at 1.5 days per zone is 4.5 days; set it to 1 and it becomes 3 days.' },
      { q: 'Is this medical advice?', a: 'No. It is a rough rule of thumb, not a measured or personalised prediction.' },
    ],
    sources: [{ label: 'CDC Yellow Book: Jet lag', url: 'https://wwwnc.cdc.gov/travel/yellowbook/2024/environmental-hazards-risks/jet-lag' }],
  },
  related: ['time-zone-converter', 'sleep', 'sleep-debt', 'caffeine-half-life'],
  examples: [
    // 6 zones west x 1.0 = 6; other way 6 x 1.5 = 9
    { values: { zones: 6, direction: 'west', west: 1, east: 1.5 }, expect: { days: 6, perZone: 1, other: 9 }, tolerance: 1e-9 },
    // 6 zones east x 1.5 = 9; other way 6 x 1 = 6
    { values: { zones: 6, direction: 'east', west: 1, east: 1.5 }, expect: { days: 9, perZone: 1.5, other: 6 }, tolerance: 1e-9 },
    // 3 east x 1.5 = 4.5
    { values: { zones: 3, direction: 'east', west: 1, east: 1.5 }, expect: { days: 4.5 }, tolerance: 1e-9 },
    // 0 zones = 0 days
    { values: { zones: 0, direction: 'west', west: 1, east: 1.5 }, expect: { days: 0, other: 0 }, tolerance: 1e-9 },
  ],
});
