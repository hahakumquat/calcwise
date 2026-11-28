import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const DEG = 180 / Math.PI;

export default defineCalculator({
  slug: 'roof-pitch-converter',
  title: 'Roof Pitch Converter',
  seoTitle: 'Roof Pitch Converter: Rise, Degrees and Percent',
  metaDescription: 'Convert roof pitch between rise per 12 inches, angle in degrees and slope percent, and get the rafter length factor for any roof slope.',
  updated: '2026-11-28',
  category: 'construction',
  description: 'Convert a roof pitch between rise per 12 in, degrees and percent slope, with the rafter length factor.',
  keywords: ['roof pitch converter', 'roof pitch to degrees', 'roof slope calculator', '6/12 pitch in degrees', 'pitch to percent', 'rafter length factor', 'degrees to roof pitch'],
  popular: false,
  inputs: [
    {
      id: 'mode',
      label: 'I know the',
      type: 'select',
      segmented: true,
      default: 'rise',
      info: 'Pick the form your roof slope is given in. The other two are worked out for you.',
      options: [
        { value: 'rise', label: 'Pitch (x in 12)' },
        { value: 'angle', label: 'Angle' },
        { value: 'percent', label: 'Percent' },
      ],
    },
    { id: 'rise', label: 'Rise per 12 in of run', type: 'number', default: 6, min: 0, step: 0.5, suffix: 'in', info: 'The "6" in a 6/12 pitch: inches the roof rises for every 12 inches it runs horizontally.', showWhen: { input: 'mode', is: 'rise' } },
    { id: 'angle', label: 'Angle', type: 'number', default: 30, min: 0, max: 89.9, step: 0.5, suffix: '°', info: 'Roof angle from horizontal, in degrees. Must be between 0 and 90.', showWhen: { input: 'mode', is: 'angle' } },
    { id: 'percent', label: 'Slope', type: 'number', default: 50, min: 0, step: 1, suffix: '%', info: 'Rise divided by run, times 100. A 100% slope is 45 degrees and can be steeper than that.', showWhen: { input: 'mode', is: 'percent' } },
  ],
  outputs: [
    { id: 'riseOut', label: 'Pitch (rise per 12 in)', format: 'number', precision: 2, suffix: 'in 12', primary: true, info: 'Inches of rise per 12 inches of run, the way roofers quote pitch.' },
    { id: 'angleOut', label: 'Angle', format: 'number', precision: 2, suffix: '°', info: 'arctan(rise ÷ 12), in degrees.' },
    { id: 'percentOut', label: 'Slope percent', format: 'number', precision: 2, suffix: '%', info: 'Rise ÷ run × 100.' },
    { id: 'factor', label: 'Rafter length factor', format: 'number', precision: 4, info: 'Multiply the horizontal run by this to get the rafter length along the slope, before overhang.' },
  ],
  compute: (v) => {
    const mode = String(v.mode ?? 'rise');
    let rise: number;
    if (mode === 'angle') {
      const a = num(v.angle);
      if (a === null) return { riseOut: null };
      if (a <= 0 || a >= 90) return { riseOut: null, error: 'Enter an angle above 0 and below 90 degrees.' };
      rise = 12 * Math.tan(a / DEG);
    } else if (mode === 'percent') {
      const p = num(v.percent);
      if (p === null) return { riseOut: null };
      if (p <= 0) return { riseOut: null, error: 'Enter a slope percent above 0.' };
      rise = (12 * p) / 100;
    } else {
      const r = num(v.rise);
      if (r === null) return { riseOut: null };
      if (r <= 0) return { riseOut: null, error: 'Enter a rise above 0.' };
      rise = r;
    }
    const ratio = rise / 12;
    const angle = Math.atan(ratio) * DEG;
    const percent = ratio * 100;
    const factor = Math.sqrt(1 + ratio * ratio);
    const label = angle < 18.4 ? 'Low slope' : angle < 33.7 ? 'Medium slope' : 'Steep';
    return {
      riseOut: rise,
      angleOut: angle,
      percentOut: percent,
      factor,
      tone: 'ok',
      badge: `${Math.round(rise * 100) / 100}/12 pitch`,
      chart: {
        type: 'scatter',
        title: 'Roof profile over 12 in of run',
        points: [[0, 0], [12, rise]],
        line: { slope: ratio, intercept: 0, label: `${Math.round(rise * 100) / 100} in rise` },
        xLabel: 'Run (in)',
        yLabel: 'Rise (in)',
      },
      steps: [
        `Rise per 12 in = ${rise.toFixed(3)}`,
        `Angle = arctan(${rise.toFixed(3)} ÷ 12) = ${angle.toFixed(3)}°`,
        `Percent = ${rise.toFixed(3)} ÷ 12 × 100 = ${percent.toFixed(2)}%`,
        `Rafter factor = √(${rise.toFixed(3)}² + 12²) ÷ 12 = ${factor.toFixed(4)}`,
      ],
      note: `${label}. A 10 ft run needs about ${(10 * factor).toFixed(2)} ft of rafter before overhang.`,
    };
  },
  content: {
    formula: [
      'Angle = arctan(rise ÷ 12)',
      'Slope percent = rise ÷ 12 × 100',
      'Rise per 12 in = 12 × tan(angle) = 12 × percent ÷ 100',
      'Rafter length factor = √(rise² + 12²) ÷ 12',
    ],
    body: [
      'Roof pitch is usually quoted as inches of rise per 12 inches of horizontal run, such as 6/12. Plans, software and some materials use degrees or percent instead. This converter turns any one into the other two.',
      'A 6/12 roof rises 6 inches per foot of run. That is an angle of arctan(0.5) = 26.57 degrees, a slope of 50 percent, and a rafter length factor of 1.118. A 10 ft run therefore needs 11.18 ft of rafter before overhang.',
    ],
    sections: [
      {
        heading: 'Common pitches',
        paragraphs: [
          '4/12 is 18.43 degrees (33.33 percent). 6/12 is 26.57 degrees (50 percent). 8/12 is 33.69 degrees (66.67 percent). 12/12 is 45 degrees (100 percent) with a factor of 1.414.',
        ],
      },
      {
        heading: 'Pitch versus percent',
        paragraphs: [
          'Percent slope is rise over run, so it keeps climbing past 100 percent for roofs steeper than 45 degrees. Degrees stop at 90, a vertical wall.',
        ],
      },
    ],
    faq: [
      { q: 'What is 6/12 pitch in degrees?', a: 'arctan(6 ÷ 12) is 26.57 degrees. As a percent slope it is 50 percent.' },
      { q: 'What is a 12/12 pitch?', a: 'It rises 12 inches for every 12 inches of run: 45 degrees, 100 percent slope, and a rafter length factor of 1.414.' },
      { q: 'How do I convert 30 degrees to roof pitch?', a: '12 × tan(30°) is 6.93, so about a 6.93/12 pitch, or 57.74 percent.' },
      { q: 'What is the rafter length factor?', a: 'It is √(rise² + 144) ÷ 12. For 6/12 it is 1.118, so a 10 ft run needs about 11.18 ft of rafter, not counting overhang.' },
      { q: 'Does this include overhang or ridge adjustments?', a: 'No. It gives the slope length for the horizontal run you measure; add overhang and cut allowances separately.' },
    ],
    sources: [],
  },
  related: ['rafter-length', 'roofing'],
  examples: [
    // atan(0.5)=26.5651 deg; 50%; sqrt(1.25)=1.1180
    { values: { mode: 'rise', rise: 6 }, expect: { riseOut: 6, angleOut: 26.5651, percentOut: 50, factor: 1.118 }, tolerance: 0.001 },
    // 12/12: 45 deg, 100%, sqrt(2)=1.4142
    { values: { mode: 'rise', rise: 12 }, expect: { angleOut: 45, percentOut: 100, factor: 1.4142 }, tolerance: 0.001 },
    // 4/12: atan(1/3)=18.4349; 33.3333%; sqrt(10/9)=1.0541
    { values: { mode: 'rise', rise: 4 }, expect: { angleOut: 18.4349, percentOut: 33.3333, factor: 1.0541 }, tolerance: 0.001 },
    // 30 deg: 12*tan30 = 6.9282; 57.735%; 1/cos30 = 1.1547
    { values: { mode: 'angle', angle: 30 }, expect: { riseOut: 6.9282, percentOut: 57.735, factor: 1.1547 }, tolerance: 0.001 },
    // 50% -> 6 in 12
    { values: { mode: 'percent', percent: 50 }, expect: { riseOut: 6, angleOut: 26.5651 }, tolerance: 0.001 },
  ],
});
