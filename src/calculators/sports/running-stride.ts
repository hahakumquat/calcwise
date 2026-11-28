import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmtDuration } from '../../lib/helpers/health';

const MILE_KM = 1.609344;

export default defineCalculator({
  slug: 'running-stride',
  title: 'Running Stride Length and Cadence Calculator',
  category: 'sports',
  description: 'Work out your running stride length from pace and cadence, or the cadence you need for a given stride length, plus steps per kilometre.',
  keywords: ['running stride length calculator', 'running cadence calculator', 'steps per minute running', 'stride length from pace', '180 cadence', 'steps per km'],
  updated: '2026-11-28',
  inputs: [
    { id: 'minutes', label: 'Pace: minutes', type: 'number', suffix: 'min', default: 5, min: 0, step: 1, info: 'Minutes part of your pace, e.g. 5 for 5:00 per km.' },
    { id: 'seconds', label: 'Pace: seconds', type: 'number', suffix: 's', default: 0, min: 0, step: 1, info: 'Seconds part of your pace, e.g. 30 for 5:30.' },
    {
      id: 'per',
      label: 'Pace is per',
      type: 'select',
      segmented: true,
      default: 'km',
      options: [
        { value: 'km', label: 'km' },
        { value: 'mi', label: 'mile' },
      ],
      info: 'Whether the pace above is per kilometre or per mile.',
    },
    {
      id: 'mode',
      label: 'I know my',
      type: 'select',
      segmented: true,
      default: 'cadence',
      options: [
        { value: 'cadence', label: 'Cadence' },
        { value: 'stride', label: 'Stride length' },
      ],
      info: 'Choose cadence to find stride length, or stride length to find cadence.',
    },
    { id: 'cadence', label: 'Cadence', type: 'number', suffix: 'steps/min', default: 180, min: 1, step: 1, showWhen: { input: 'mode', is: 'cadence' }, info: 'Steps per minute, counting every foot strike (left and right). Many watches show it.' },
    { id: 'stride', label: 'Stride length', type: 'number', suffix: 'm', default: 1.25, min: 0.01, step: 0.01, showWhen: { input: 'mode', is: 'stride' }, info: 'The distance covered by one step, in metres.' },
  ],
  outputs: [
    { id: 'strideOut', label: 'Stride length', primary: true, precision: 3, suffix: 'm', info: 'Distance per step in metres: speed in metres per minute divided by cadence.' },
    { id: 'cadenceOut', label: 'Cadence', precision: 1, suffix: 'steps/min', info: 'Steps per minute: speed in metres per minute divided by stride length.' },
    { id: 'stepsPerKm', label: 'Steps per kilometre', format: 'integer', info: '1000 metres divided by stride length.' },
    { id: 'speed', label: 'Speed', precision: 1, suffix: 'm/min', info: 'Metres covered per minute at your pace.' },
    { id: 'paceKm', label: 'Pace per kilometre', format: 'text', info: 'Your pace converted to minutes and seconds per kilometre.' },
  ],
  compute: (v) => {
    const m = num(v.minutes) ?? 0;
    const s = num(v.seconds) ?? 0;
    const secs = m * 60 + s;
    const perMile = v.per === 'mi';
    if (m < 0 || s < 0 || secs <= 0) return { strideOut: null };
    const secPerKm = perMile ? secs / MILE_KM : secs;
    const speed = 1000 / (secPerKm / 60);
    let stride: number;
    let cadence: number;
    if (v.mode === 'stride') {
      const st = num(v.stride);
      if (st === null || st <= 0) return { strideOut: null };
      stride = st;
      cadence = speed / stride;
    } else {
      const c = num(v.cadence);
      if (c === null || c <= 0) return { strideOut: null };
      cadence = c;
      stride = speed / cadence;
    }
    const stepsPerKm = 1000 / stride;
    const cads = [160, 170, 180, 190, 200];
    return {
      strideOut: stride,
      cadenceOut: cadence,
      stepsPerKm,
      speed,
      paceKm: `${fmtDuration(secPerKm)} /km`,
      tone: 'ok',
      badge: `${Math.round(cadence)} steps/min`,
      note: 'Cadence here counts every step (each foot strike). 180 is a popular rule of thumb, not a target for everyone.',
      chart: {
        type: 'bar',
        title: 'Stride length at this pace for different cadences (m)',
        categories: cads.map(String),
        series: [{ name: 'Stride length (m)', values: cads.map((c) => Math.round((speed / c) * 1000) / 1000) }],
        format: { precision: 2, suffix: 'm' },
      },
      steps: [
        `Speed = 1000 ÷ (${secPerKm.toFixed(1)} s ÷ 60) = ${speed.toFixed(2)} m/min`,
        v.mode === 'stride'
          ? `Cadence = ${speed.toFixed(2)} ÷ ${stride} = ${cadence.toFixed(1)} steps/min`
          : `Stride = ${speed.toFixed(2)} ÷ ${cadence} = ${stride.toFixed(3)} m`,
        `Steps per km = 1000 ÷ ${stride.toFixed(3)} = ${Math.round(stepsPerKm)}`,
      ],
    };
  },
  content: {
    formula: ['Speed (m/min) = 1000 ÷ (pace in seconds per km ÷ 60)', 'Stride length = speed ÷ cadence', 'Cadence = speed ÷ stride length', 'Steps per km = 1000 ÷ stride length'],
    body: [
      'Your running speed is the product of two things: how long each step is (stride length) and how many steps you take per minute (cadence). Enter your pace and either of the two and this calculator finds the other.',
      'Cadence here is steps per minute, where one step is one foot strike, so left and right both count. A cadence near 180 is a popular rule of thumb, but it is not a target for everyone: taller runners and slower paces usually have lower cadences, and the right number depends on you.',
      'To change pace, you can lengthen your stride, quicken your cadence, or both. Small cadence changes of a few percent are often easier to work on than stretching your stride. This tool does arithmetic only and gives no medical or injury advice.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A pace of 5:00 per km is 300 seconds per km, so speed = 1000 ÷ 5 = 200 metres per minute. At 180 steps per minute the stride is 200 ÷ 180 = 1.111 m, which is 1000 ÷ 1.111 = 900 steps per km. Going the other way, a 1.25 m stride at the same pace needs a cadence of 200 ÷ 1.25 = 160 steps per minute.',
        ],
      },
    ],
    faq: [
      { q: 'What stride length is 5:00 per km at 180 steps per minute?', a: 'Speed is 200 m per minute, so the stride is 200 ÷ 180 = 1.111 m, and you take 900 steps per km.' },
      { q: 'What cadence does a 1.25 m stride need at 5:00 per km?', a: '200 ÷ 1.25 = 160 steps per minute.' },
      { q: 'Is 180 steps per minute the ideal cadence?', a: 'No. It is a popular rule of thumb, not a target for everyone. Your best cadence depends on your height, pace and comfort.' },
      { q: 'Does cadence count one foot or both?', a: 'Both. One step is one foot strike, so cadence is left plus right steps per minute.' },
    ],
    sources: [
      { label: 'Heiderscheit, B. C. et al. (2011). Effects of step rate manipulation on joint mechanics during running. Medicine and Science in Sports and Exercise, 43(2), 296-302' },
    ],
  },
  related: ['pace', 'steps-to-distance', 'race-time-predictor'],
  examples: [
    // 5:00/km = 300 s/km; speed = 1000/5 = 200 m/min. Stride = 200/180 = 1.1111 m; steps/km = 900.
    { values: { minutes: 5, seconds: 0, per: 'km', mode: 'cadence', cadence: 180 }, expect: { strideOut: 200 / 180, stepsPerKm: 900, speed: 200, paceKm: '5:00 /km' }, tolerance: 1e-6 },
    // Stride 1.25 m at 200 m/min: cadence = 160; steps/km = 800.
    { values: { minutes: 5, seconds: 0, per: 'km', mode: 'stride', stride: 1.25 }, expect: { cadenceOut: 160, stepsPerKm: 800 }, tolerance: 1e-6 },
    // 8:00 per mile: 480 s / 1.609344 = 298.258 s/km; speed = 1000/(298.258/60) = 201.168 m/min; /170 = 1.18334 m.
    { values: { minutes: 8, seconds: 0, per: 'mi', mode: 'cadence', cadence: 170 }, expect: { speed: 201.168, strideOut: 201.168 / 170 }, tolerance: 1e-4 },
  ],
});
