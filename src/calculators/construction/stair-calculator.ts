import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const IN = 0.0254;
// IRC R311.7.5: riser height at most 7 3/4 in, tread depth at least 10 in.
const MAX_RISER = 7.75 * IN;
const MIN_TREAD = 10 * IN;
const EPS = 1e-9;

export default defineCalculator({
  slug: 'stair-calculator',
  title: 'Stair Calculator',
  category: 'construction',
  description: 'Work out how many steps you need, the exact riser height, tread count and total run for a staircase from its total rise, with a code check.',
  keywords: ['stair calculator', 'stair rise and run', 'riser height', 'tread depth', 'how many steps', 'staircase calculator', 'stringer'],
  inputs: [
    { id: 'rise', label: 'Total rise', type: 'number', unit: 'length', units: ['in', 'cm', 'ft', 'm'], defaultUnit: 'in', default: 108, min: 0, info: 'The vertical distance from the finished lower floor to the finished upper floor.' },
    { id: 'target', label: 'Target riser height', type: 'number', unit: 'length', units: ['in', 'cm'], defaultUnit: 'in', default: 7.5, min: 0, info: 'The step height you are aiming for. 7 to 7.5 in is comfortable; most codes cap it near 7¾ in. The result is adjusted so every riser is identical.' },
    { id: 'tread', label: 'Tread depth', type: 'number', unit: 'length', units: ['in', 'cm'], defaultUnit: 'in', default: 10, min: 0, info: 'How deep each step is, front edge to riser, excluding any nosing. Most codes require at least 10 in.' },
  ],
  outputs: [
    { id: 'risers', label: 'Number of risers', format: 'integer', primary: true, info: 'The number of vertical step heights, counting the one up onto the top floor.' },
    { id: 'riser', label: 'Exact riser height', unit: 'length', units: ['in', 'cm'], defaultUnit: 'in', precision: 3, info: 'Total rise divided by the number of risers. Cut every riser to this height.' },
    { id: 'treads', label: 'Number of treads', format: 'integer', info: 'One fewer than the risers, because the top floor acts as the last tread.' },
    { id: 'run', label: 'Total run', unit: 'length', units: ['in', 'cm', 'ft', 'm'], defaultUnit: 'in', precision: 2, info: 'The horizontal distance the staircase covers: treads × tread depth.' },
    { id: 'angle', label: 'Stair angle', format: 'number', precision: 1, suffix: '°', info: 'The slope of the staircase. About 30° to 37° is typical for houses.' },
    { id: 'check', label: 'Code check', format: 'text', info: 'Compared with the US International Residential Code limits: riser at most 7¾ in, tread at least 10 in. Local codes can differ.' },
  ],
  compute: (v) => {
    const rise = num(v.rise);
    const target = num(v.target);
    const tread = num(v.tread);
    if (rise === null || target === null || tread === null || rise <= 0 || target <= 0 || tread <= 0) return { risers: null };
    const risers = Math.max(1, Math.round(rise / target));
    const riser = rise / risers;
    const treads = risers - 1;
    const run = treads * tread;
    const angle = (Math.atan(riser / tread) * 180) / Math.PI;
    const problems: string[] = [];
    if (riser > MAX_RISER + EPS) problems.push('riser is over 7¾ in');
    if (tread < MIN_TREAD - EPS) problems.push('tread is under 10 in');
    // Staircase profile: height climbed after each riser, against run covered.
    const x: number[] = [0];
    const y: number[] = [0];
    for (let i = 1; i <= risers; i++) {
      x.push((i - 1) * tread);
      y.push(i * riser);
      if (i < risers) {
        x.push(i * tread);
        y.push(i * riser);
      }
    }
    return {
      chart: {
        type: 'line',
        title: 'Side view of the staircase',
        x,
        xLabel: 'Run',
        xFormat: { unit: 'length' },
        yLabel: 'Rise',
        yFormat: { unit: 'length' },
        series: [{ name: 'Stair profile', values: y }],
      },
      risers,
      riser,
      treads,
      run,
      angle,
      check: problems.length ? `Outside IRC limits: ${problems.join(' and ')}` : 'Within IRC limits (riser ≤ 7¾ in, tread ≥ 10 in)',
      steps: [
        `Risers = round(${(rise / IN).toFixed(2)} in ÷ ${(target / IN).toFixed(2)} in) = ${risers}`,
        `Riser height = ${(rise / IN).toFixed(2)} in ÷ ${risers} = ${(riser / IN).toFixed(3)} in`,
        `Treads = ${risers} − 1 = ${treads}; run = ${treads} × ${(tread / IN).toFixed(2)} in = ${(run / IN).toFixed(2)} in`,
      ],
    };
  },
  content: {
    formula: ['Risers = round(total rise ÷ target riser)', 'Riser height = total rise ÷ risers', 'Treads = risers − 1', 'Total run = treads × tread depth'],
    body: [
      'Start with the total rise: the vertical distance between the finished floors. Divide it by the step height you would like and round to a whole number of risers, then divide the rise by that whole number to get the exact riser height. Every riser in a flight must be the same, so the exact height will usually differ slightly from your target.',
      'A flight always has one fewer tread than risers, because the upper floor is the last step. Multiply the treads by the tread depth to get the total run, the horizontal space the stairs need. Check the run fits your opening before you cut stringers.',
      'In the US, the International Residential Code (R311.7) limits risers to 7¾ in and requires treads of at least 10 in. Local rules differ and commercial stairs are stricter, so confirm with your building department. This calculator does not cover landings, headroom or nosing.',
    ],
    faq: [
      { q: 'How many steps do I need for a 108 inch rise?', a: 'With a 7.5 in target, 108 ÷ 7.5 = 14.4, which rounds to 14 risers of 7.714 in each, with 13 treads.' },
      { q: 'What is a good riser height and tread depth?', a: 'A riser of 7 to 7½ in with a tread of 10 to 11 in feels comfortable and meets the typical US residential limits.' },
      { q: 'Why is the number of treads one less than risers?', a: 'The top riser lands on the upper floor, which serves as the last tread, so only the steps below it need cutting.' },
    ],
    sources: [{ label: 'International Residential Code (ICC), section R311.7.5 stair treads and risers' }],
  },
  related: ['square-footage', 'concrete', 'flooring'],
  examples: [
    { values: { rise: 108 * IN, target: 7.5 * IN, tread: 10 * IN }, expect: { risers: 14, riser: (108 / 14) * IN, treads: 13, run: 130 * IN, check: 'Within IRC limits (riser ≤ 7¾ in, tread ≥ 10 in)' } },
    { values: { rise: 96 * IN, target: 7 * IN, tread: 10 * IN }, expect: { risers: 14, treads: 13 } },
    { values: { rise: 110 * IN, target: 8 * IN, tread: 9 * IN }, expect: { risers: 14, treads: 13, check: 'Outside IRC limits: riser is over 7¾ in and tread is under 10 in' } },
  ],
});
