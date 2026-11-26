import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmtDuration, hmsToSeconds } from '../../lib/helpers/health';

export default defineCalculator({
  slug: 'pace-splits',
  title: 'Race Pace Splits: Even, Negative or Positive',
  category: 'sports',
  description: 'Turn a goal finish time into first-half and second-half paces for an even, negative or positive split, and see how much faster or slower each half runs.',
  keywords: ['negative split calculator', 'marathon pace plan', 'race split calculator', 'positive split pace', 'half marathon pacing'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'distance', label: 'Race distance', type: 'number', default: 26.2, min: 0, step: 0.1, info: 'Use miles or kilometres, then read the paces per that same unit. A marathon is 26.2 mi or 42.195 km.' },
    { id: 'hours', label: 'Goal time: hours', type: 'number', suffix: 'h', default: 4, min: 0, step: 1, info: 'Whole hours of your goal finish time.' },
    { id: 'minutes', label: 'Goal time: minutes', type: 'number', suffix: 'min', default: 0, min: 0, step: 1, info: 'Minutes of your goal finish time.' },
    { id: 'seconds', label: 'Goal time: seconds', type: 'number', suffix: 's', default: 0, min: 0, step: 1, info: 'Seconds of your goal finish time.' },
    { id: 'split', label: 'Second half faster by', type: 'number', suffix: '%', default: 3, min: -20, max: 20, step: 0.5, info: 'Positive means a negative split (second half faster). Negative means a positive split (second half slower). 0 is even pace.' },
  ],
  outputs: [
    { id: 'first', label: 'First-half pace', format: 'text', primary: true, info: 'Pace per distance unit for the first half.' },
    { id: 'second', label: 'Second-half pace', format: 'text', info: 'Pace per distance unit for the second half.' },
    { id: 'even', label: 'Even pace', format: 'text', info: 'Goal time ÷ distance, for comparison.' },
    { id: 'firstTime', label: 'First-half time', format: 'text', info: 'Time you reach the halfway point.' },
    { id: 'secondTime', label: 'Second-half time', format: 'text', info: 'Time for the second half.' },
  ],
  compute: (v) => {
    const d = num(v.distance);
    const t = hmsToSeconds(v.hours, v.minutes, v.seconds);
    const s = num(v.split);
    if (d === null || t === null || s === null || d <= 0 || t <= 0 || s <= -100 || s >= 100) return { first: null };
    const f = s / 100;
    // Half distance H = d/2. p1*H + p2*H = t and p2 = p1*(1-f), so p1 = 2t / (d*(2-f)).
    const p1 = (2 * t) / (d * (2 - f));
    const p2 = p1 * (1 - f);
    const even = t / d;
    const t1 = (p1 * d) / 2;
    const t2 = (p2 * d) / 2;
    const kind = s > 0 ? 'Negative split' : s < 0 ? 'Positive split' : 'Even pace';
    return {
      first: fmtDuration(p1),
      second: fmtDuration(p2),
      even: fmtDuration(even),
      firstTime: fmtDuration(t1),
      secondTime: fmtDuration(t2),
      tone: 'ok',
      badge: `${kind}: ${fmtDuration(p1)} then ${fmtDuration(p2)}`,
      note: `Halfway at ${fmtDuration(t1)}, finish at ${fmtDuration(t)}. Paces are per distance unit you entered.`,
      chart: { type: 'bar' as const, title: 'Pace per half (minutes)', categories: ['First half', 'Even', 'Second half'], series: [{ name: 'Pace', values: [p1 / 60, even / 60, p2 / 60] }], format: { format: 'number' as const } },
      steps: [
        `Even pace = ${t} s ÷ ${d} = ${fmtDuration(even)}`,
        `First-half pace = 2 × ${t} ÷ (${d} × (2 − ${f.toFixed(4)})) = ${fmtDuration(p1)}`,
        `Second-half pace = first-half pace × (1 − ${f.toFixed(4)}) = ${fmtDuration(p2)}`,
        `Check: ${fmtDuration(t1)} + ${fmtDuration(t2)} = ${fmtDuration(t)}`,
      ],
    };
  },
  content: {
    formula: [
      'Let f = split percent ÷ 100 (positive = second half faster)',
      'First-half pace = 2 × goal time ÷ (distance × (2 − f))',
      'Second-half pace = first-half pace × (1 − f)',
      'Both halves cover distance ÷ 2, so their times add to the goal time',
    ],
    body: [
      'A split plan says how fast to run each half so the two add up to your goal time. A negative split runs the second half faster, a positive split runs it slower, and an even split uses the same pace throughout.',
      'Example: a 4:00:00 marathon (26.2) with the second half 3% faster means 9:18 per mile for the first half and 9:01 for the second, against an even 9:10. Halfway is 2:01:50. Another: a 1:45:00 half marathon (13.1) with a 2% positive split is 7:56 then 8:06, versus an even 8:01.',
      'This is a pacing arithmetic tool, not coaching advice. Hills, heat and fuelling change real splits. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Is a negative split better?', a: 'This page does not claim that. It only shows the paces each split choice needs to hit your goal time.' },
      { q: 'What does the split percent mean?', a: 'It is how much faster the second-half pace is than the first-half pace. At 3%, the second-half pace is the first-half pace times 0.97.' },
      { q: 'Does it work in kilometres?', a: 'Yes. Enter the distance in kilometres and read the paces per kilometre.' },
      { q: 'Why is the even pace between the two halves?', a: 'The faster and slower halves average out to the goal time, so the even pace falls between them.' },
    ],
    sources: [],
  },
  related: ['pace', 'race-time-predictor', 'mileage-build-plan'],
  examples: [
    // p1 = 28800/(26.2*1.97)=557.988 -> 9:18; p2=541.248 -> 9:01; even 549.618 -> 9:10; t1 7309.64 -> 2:01:50; t2 7090.36 -> 1:58:10
    { values: { distance: 26.2, hours: 4, minutes: 0, seconds: 0, split: 3 }, expect: { first: '9:18', second: '9:01', even: '9:10', firstTime: '2:01:50', secondTime: '1:58:10' } },
    // p1 = 12600/(13.1*2.02)=476.14 -> 7:56; p2 = 485.66 -> 8:06; even 480.92 -> 8:01
    { values: { distance: 13.1, hours: 1, minutes: 45, seconds: 0, split: -2 }, expect: { first: '7:56', second: '8:06', even: '8:01' } },
  ],
});
