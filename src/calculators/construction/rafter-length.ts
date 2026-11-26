import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const FT = 0.3048;

export default defineCalculator({
  slug: 'rafter-length',
  title: 'Rafter Length Calculator',
  category: 'construction',
  description: 'Find rafter length, rise and roof angle from the horizontal run and pitch (rise per 12 in), with an optional eave overhang measured along the slope.',
  keywords: ['rafter length calculator', 'rafter length', 'roof rafter calculator', 'rafter run and rise', 'roof pitch rafter', 'common rafter'],
  inputs: [
    { id: 'run', label: 'Horizontal run', type: 'number', unit: 'length', units: ['ft', 'in', 'm', 'cm'], defaultUnit: 'ft', default: 12, min: 0, info: 'The horizontal distance from the outside of the wall (top plate) to the centre line of the ridge, measured level. For a symmetrical gable roof it is half the building span.' },
    { id: 'pitch', label: 'Roof pitch', type: 'number', suffix: 'in 12', default: 6, min: 0, max: 24, help: 'Inches of rise per 12 inches of run, e.g. 6 for a 6/12 roof.', info: 'Inches of vertical rise per 12 inches of horizontal run. 12/12 is a 45° roof.' },
    { id: 'overhang', label: 'Overhang (along the slope)', type: 'number', unit: 'length', units: ['ft', 'in', 'm', 'cm'], defaultUnit: 'ft', default: 0, min: 0, optional: true, info: 'Extra rafter length past the wall for the eave, measured along the sloped rafter. Leave blank or 0 for none.' },
  ],
  outputs: [
    { id: 'length', label: 'Total rafter length', unit: 'length', units: ['ft', 'in', 'm', 'cm'], defaultUnit: 'ft', precision: 3, primary: true, info: 'Length of the rafter along its slope: run × √(1 + (pitch ÷ 12)²), plus any overhang.' },
    { id: 'rise', label: 'Rise', unit: 'length', units: ['ft', 'in', 'm', 'cm'], defaultUnit: 'ft', precision: 3, info: 'The vertical height gained over the run: run × pitch ÷ 12. The overhang does not change it here.' },
    { id: 'angle', label: 'Roof angle', format: 'number', precision: 2, suffix: '°', info: 'The slope of the rafter from horizontal: arctan(pitch ÷ 12).' },
    { id: 'main', label: 'Length before overhang', unit: 'length', units: ['ft', 'in', 'm', 'cm'], defaultUnit: 'ft', precision: 3, info: 'The sloped length over the run alone, without the overhang.' },
  ],
  compute: (v) => {
    const run = num(v.run);
    const p = num(v.pitch);
    const over = num(v.overhang) ?? 0;
    if (run === null || p === null || run <= 0 || p < 0 || over < 0) return { length: null };
    const factor = Math.sqrt(1 + (p / 12) ** 2);
    const main = run * factor;
    const length = main + over;
    const rise = (run * p) / 12;
    const angle = (Math.atan(p / 12) * 180) / Math.PI;
    return {
      chart: {
        type: 'bar',
        title: 'Run, rise and rafter length',
        categories: ['Run', 'Rise', 'Rafter'],
        series: [{ name: 'Length', values: [run, rise, length] }],
        format: { unit: 'length' },
        highlight: 2,
      },
      length,
      rise,
      angle,
      main,
      steps: [
        `Slope factor = √(1 + (${p}/12)²) = ${factor.toFixed(4)}`,
        `Rafter over the run = ${(run / FT).toFixed(3)} ft × ${factor.toFixed(4)} = ${(main / FT).toFixed(3)} ft`,
        `Total = ${(main / FT).toFixed(3)} ft + ${(over / FT).toFixed(3)} ft overhang = ${(length / FT).toFixed(3)} ft`,
      ],
    };
  },
  content: {
    formula: ['Slope factor = √(1 + (pitch ÷ 12)²)', 'Rafter length = run × slope factor + overhang', 'Rise = run × pitch ÷ 12', 'Angle = arctan(pitch ÷ 12)'],
    body: [
      'A common rafter, its horizontal run and the rise form a right triangle, so the rafter is the hypotenuse. Pitch is quoted as inches of rise per 12 inches of run: a 6/12 roof rises 6 in for every 12 in it runs. Multiply the run by √(1 + (pitch ÷ 12)²) to get the length along the slope.',
      'Enter the overhang as extra length measured along the rafter, and it is simply added to the result. The rise and angle depend only on the run and pitch.',
      'This is a layout estimate. The length is theoretical, measured to the centre line of the ridge: it does not subtract half the ridge-board thickness and does not allow for birdsmouth cuts, plumb or tail cuts, or lumber lengths. It is not structural advice: rafter size, spacing and spans must come from span tables or an engineer, and your local building code.',
    ],
    faq: [
      { q: 'How long is a rafter for a 12 ft run at 6/12 pitch?', a: 'The slope factor is √(1 + 0.5²) = 1.1180, so the rafter is 12 × 1.1180 = 13.416 ft long, with a rise of 6 ft and a roof angle of 26.57°.' },
      { q: 'How do I add the overhang?', a: 'Enter the overhang measured along the slope. It is added to the length over the run, so a 1 ft overhang on that 12 ft, 6/12 roof gives 14.416 ft.' },
      { q: 'Does this include the ridge board or birdsmouth?', a: 'No. The length is measured to the ridge centre line and ignores ridge-board thickness and birdsmouth cuts, so trim for those when you mark the rafter.' },
      { q: 'What angle is a 12/12 roof?', a: 'A 12/12 pitch is 45°, and the slope factor is √2 ≈ 1.4142, so the rafter is about 1.414 times the run.' },
    ],
    sources: [{ label: 'Pythagorean theorem applied to roof framing (rafter = hypotenuse of run and rise)' }],
  },
  related: ['roofing', 'pythagorean-theorem', 'slope', 'stair-calculator'],
  examples: [
    // 12 ft run, 6/12: factor sqrt(1.25) = 1.118034; 12 * 1.118034 = 13.416408 ft; rise 6 ft; atan(0.5) = 26.565051 deg
    { values: { run: 12 * FT, pitch: 6, overhang: 0 }, expect: { length: 13.416408 * FT, rise: 6 * FT, angle: 26.565051, main: 13.416408 * FT } },
    // 10 ft run, 12/12, 2 ft overhang: 10*sqrt2 = 14.142136 + 2 = 16.142136 ft; rise 10 ft; 45 deg
    { values: { run: 10 * FT, pitch: 12, overhang: 2 * FT }, expect: { length: 16.142136 * FT, rise: 10 * FT, angle: 45 } },
    // 8 ft run, 9/12: factor sqrt(1.5625) = 1.25; 10 ft; rise 6 ft; atan(0.75) = 36.869898 deg
    { values: { run: 8 * FT, pitch: 9 }, expect: { length: 10 * FT, rise: 6 * FT, angle: 36.869898 } },
  ],
});
