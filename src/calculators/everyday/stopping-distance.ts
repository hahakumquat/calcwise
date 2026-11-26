import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const n1 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });
const n2 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

const G = 9.81; // m/s^2
const MPH_MS = 0.44704; // 1 mph in m/s (exact)
const KMH_MS = 1 / 3.6;
const M_TO_FT = 3.280839895;

export default defineCalculator({
  slug: 'stopping-distance',
  title: 'Stopping Distance Calculator',
  category: 'everyday',
  description: 'Estimate your total stopping distance on dry, wet and icy roads from your speed and reaction time. See how far you travel before the car stops.',
  keywords: ['stopping distance calculator', 'braking distance calculator', 'stopping distance on ice', 'stopping distance wet road', 'reaction distance', 'how far to stop at 50 km/h', 'stopping distance mph'],
  updated: '2026-11-26',
  inputs: [
    { id: 'speed', label: 'Speed', type: 'number', default: 50, min: 1, max: 300, step: 1, info: 'How fast you are travelling when you start to react.' },
    {
      id: 'unit', label: 'Speed unit', type: 'select', default: 'kmh',
      options: [{ value: 'kmh', label: 'km/h' }, { value: 'mph', label: 'mph' }],
      info: 'Distances are shown in metres and feet either way.',
    },
    { id: 'reaction', label: 'Reaction time', type: 'number', default: 1.5, min: 0, max: 5, step: 0.1, suffix: 's', info: 'Time from seeing the hazard to starting to brake. 1.5 s is a common planning figure; tired or distracted drivers take longer.' },
    { id: 'muDry', label: 'Dry road friction', type: 'number', default: 0.7, min: 0.05, max: 1.2, step: 0.05, info: 'Typical tyre-to-road friction coefficient on dry asphalt. Editable.' },
    { id: 'muWet', label: 'Wet road friction', type: 'number', default: 0.4, min: 0.05, max: 1.2, step: 0.05, info: 'Typical value on wet asphalt. Editable.' },
    { id: 'muIce', label: 'Ice friction', type: 'number', default: 0.15, min: 0.02, max: 1.2, step: 0.01, info: 'Typical value on ice or packed snow. Editable.' },
  ],
  outputs: [
    { id: 'dry', label: 'Stopping distance, dry road', format: 'number', precision: 1, suffix: ' m', primary: true, info: 'Reaction distance plus braking distance.' },
    { id: 'wet', label: 'Stopping distance, wet road', format: 'number', precision: 1, suffix: ' m', info: 'Reaction distance plus braking distance on wet asphalt.' },
    { id: 'ice', label: 'Stopping distance, ice', format: 'number', precision: 1, suffix: ' m', info: 'Reaction distance plus braking distance on ice.' },
    { id: 'reactionDist', label: 'Reaction distance (before braking)', format: 'number', precision: 1, suffix: ' m', info: 'Speed × reaction time. The same on every surface.' },
    { id: 'dryFt', label: 'Dry road, in feet', format: 'number', precision: 0, suffix: ' ft', info: 'The same distance converted to feet.' },
    { id: 'wetFt', label: 'Wet road, in feet', format: 'number', precision: 0, suffix: ' ft', info: 'The same distance converted to feet.' },
    { id: 'iceFt', label: 'Ice, in feet', format: 'number', precision: 0, suffix: ' ft', info: 'The same distance converted to feet.' },
  ],
  compute: (v) => {
    const speed = num(v.speed), t = num(v.reaction);
    const muDry = num(v.muDry), muWet = num(v.muWet), muIce = num(v.muIce);
    const unit = v.unit === 'mph' ? 'mph' : 'kmh';
    if (speed === null || t === null || muDry === null || muWet === null || muIce === null) {
      return { dry: null, note: 'Enter a speed, a reaction time and the three friction values.' };
    }
    if (speed <= 0) return { dry: null, error: 'Use a speed above 0.' };
    if (t < 0) return { dry: null, error: 'Reaction time cannot be negative.' };
    if (muDry <= 0 || muWet <= 0 || muIce <= 0) return { dry: null, error: 'Friction values must be above 0.' };

    const ms = speed * (unit === 'mph' ? MPH_MS : KMH_MS);
    const react = ms * t;
    const brake = (mu: number) => (ms * ms) / (2 * mu * G);
    const dry = react + brake(muDry);
    const wet = react + brake(muWet);
    const ice = react + brake(muIce);
    const extraIce = ice - dry;

    return {
      dry,
      wet,
      ice,
      reactionDist: react,
      dryFt: dry * M_TO_FT,
      wetFt: wet * M_TO_FT,
      iceFt: ice * M_TO_FT,
      tone: ice > 3 * dry ? 'warn' : 'ok',
      badge: `Ice needs ${n1(ice / dry)}× the dry distance`,
      chart: {
        type: 'bar',
        title: 'Total stopping distance (m)',
        categories: ['Dry', 'Wet', 'Ice'],
        series: [
          { name: 'Reaction', values: [react, react, react] },
          { name: 'Braking', values: [brake(muDry), brake(muWet), brake(muIce)] },
        ],
        stacked: true,
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Speed = ${n2(speed)} ${unit === 'mph' ? 'mph' : 'km/h'} = ${n2(ms)} m/s`,
        `Reaction distance = ${n2(ms)} × ${n2(t)} s = ${n2(react)} m`,
        `Braking distance = v² ÷ (2 × μ × 9.81): dry ${n2(brake(muDry))} m, wet ${n2(brake(muWet))} m, ice ${n2(brake(muIce))} m`,
        `Total = reaction + braking: dry ${n2(dry)} m, wet ${n2(wet)} m, ice ${n2(ice)} m (ice adds ${n2(extraIce)} m over dry)`,
      ],
    };
  },
  content: {
    formula: [
      'Reaction distance = speed (m/s) × reaction time (s)',
      'Braking distance = speed² ÷ (2 × μ × 9.81), where μ is the tyre-to-road friction coefficient',
      'Stopping distance = reaction distance + braking distance',
    ],
    body: [
      'Stopping a car takes two stages. First you cover ground while you notice the hazard and move your foot to the brake. Then the car decelerates, and how quickly depends on how much grip the tyres have.',
      'This calculator uses typical friction coefficients: 0.7 for dry asphalt, 0.4 for wet asphalt and 0.15 for ice. They are labelled typical and you can change them. Braking distance grows with the square of speed, so doubling your speed roughly quadruples the braking part.',
      'Treat the result as an estimate, not safety advice. Real stopping distances depend on your tyres and their tread, brake condition, load, road slope and surface, and how hard and how well you brake. Leave more room than the number suggests, especially in winter. If you are weighing winter tyres, see the winter tyre cost calculator.',
    ],
    faq: [
      { q: 'How far does a car take to stop from 50 km/h?', a: 'With a 1.5 s reaction time, about 34.9 m on a dry road (20.8 m reacting plus 14.1 m braking), 45.4 m on a wet road and 86.4 m on ice, using friction of 0.7, 0.4 and 0.15.' },
      { q: 'What reaction time should I use?', a: 'The default is 1.5 s, a common planning figure for an alert driver. Fatigue, distraction, alcohol and poor visibility all make it longer. Each extra second adds one second of travel at your current speed.' },
      { q: 'Why is stopping on ice so much longer?', a: 'Braking distance is inversely proportional to the friction coefficient. Ice at 0.15 gives about 4.7 times the braking distance of dry asphalt at 0.7, while the reaction distance stays the same.' },
      { q: 'What friction values does this use?', a: 'Dry 0.7, wet 0.4, ice 0.15. These are typical textbook-style figures, not measurements of your tyres or road. You can edit all three.' },
      { q: 'Is this accurate enough to rely on?', a: 'No. It is a simple physics estimate that ignores slope, tyre condition, brake systems such as ABS, and driver technique. Use it to build intuition and keep a larger gap than you think you need.' },
    ],
    sources: [
      { label: 'Engineering Toolbox: Friction coefficients', url: 'https://www.engineeringtoolbox.com/friction-coefficients-d_778.html' },
      { label: 'NHTSA: Speeding and stopping distance', url: 'https://www.nhtsa.gov/risky-driving/speeding' },
    ],
  },
  related: ['winter-tire-cost', 'speed-converter', 'wind-chill', 'tire-pressure-cold'],
  examples: [
    // 50 km/h = 13.889 m/s; reaction 13.889 x 1.5 = 20.83 m
    // v^2 = 192.90; dry 192.90 / (2 x 0.7 x 9.81 = 13.734) = 14.05 -> 34.88 m
    // wet 192.90 / 7.848 = 24.58 -> 45.41 m; ice 192.90 / 2.943 = 65.55 -> 86.38 m
    { values: { speed: 50, unit: 'kmh', reaction: 1.5, muDry: 0.7, muWet: 0.4, muIce: 0.15 }, expect: { reactionDist: 20.83, dry: 34.88, wet: 45.41, ice: 86.38 }, tolerance: 0.001 },
    // 0 s reaction: braking only, same as above minus 20.83 m
    { values: { speed: 50, unit: 'kmh', reaction: 0, muDry: 0.7, muWet: 0.4, muIce: 0.15 }, expect: { reactionDist: 0, dry: 14.05, wet: 24.58, ice: 65.55 }, tolerance: 0.001 },
  ],
});
