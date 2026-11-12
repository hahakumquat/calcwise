import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { gradeBands } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'final-grade',
  title: 'Final Grade Calculator',
  category: 'other',
  description: 'Find the score you need on your final exam to reach a target grade in the class.',
  keywords: ['final exam calculator', 'what do i need on my final', 'grade needed', 'exam score needed', 'final exam grade'],
  popular: true,
  inputs: [
    { id: 'current', label: 'Current grade', type: 'number', suffix: '%', default: 88, min: 0, info: 'Your grade in the class right now, before the final — usually shown in the online gradebook.' },
    { id: 'weight', label: 'Final exam weight', type: 'number', suffix: '%', default: 25, min: 0, max: 100, help: 'Share of the course grade the final counts for.', info: 'How much of the overall course grade the final exam is worth, from the syllabus. 20–30% is common.' },
    { id: 'target', label: 'Grade you want', type: 'number', suffix: '%', default: 90, min: 0, info: 'The overall course grade you are aiming for, e.g. 90 for an A− or 80 for a B−.' },
  ],
  outputs: [
    { id: 'needed', label: 'Score needed on the final', format: 'percent', precision: 2, primary: true, info: 'The minimum final-exam score that brings your course grade to the target. Over 100% means it is out of reach.' },
    { id: 'ifPerfect', label: 'Course grade with 100% on the final', format: 'percent', precision: 2, info: 'The best course grade still possible if you ace the final.' },
    { id: 'ifZero', label: 'Course grade if you skip the final', format: 'percent', precision: 2, info: 'Your course grade if you score zero on the final — the floor you have already locked in.' },
  ],
  compute: (v) => {
    const c = num(v.current);
    const w = num(v.weight);
    const t = num(v.target);
    if (c === null || w === null || t === null || c < 0 || t < 0) return { needed: null };
    if (w <= 0 || w > 100) return { needed: null, error: 'The final’s weight must be between 0 and 100%.' };
    const wf = w / 100;
    const needed = (t - c * (1 - wf)) / wf; // in percent points
    const ifPerfect = c * (1 - wf) + 100 * wf;
    const ifZero = c * (1 - wf);
    let note: string;
    if (needed > 100) note = `Not reachable without extra credit — even 100% on the final gives ${ifPerfect.toFixed(1)}%.`;
    else if (needed <= 0) note = `Already locked in — you keep ${t}% even with a zero on the final.`;
    else note = `Score at least ${needed.toFixed(1)}% on the final to finish with ${t}%.`;
    const max = Math.max(1, Math.ceil((needed / 100) * 10 + 0.5) / 10);
    return {
      needed: needed / 100,
      ifPerfect: ifPerfect / 100,
      ifZero: ifZero / 100,
      chart: [
        {
          type: 'scale',
          title: 'Score needed on the final',
          min: 0,
          max,
          value: Math.max(0, needed / 100),
          valueLabel: `Need ${needed.toFixed(1)}%`,
          format: { format: 'percent' },
          bands: gradeBands(max),
        },
        {
          type: 'bar',
          title: 'Course grade by final-exam score',
          categories: ['Final = 0%', 'Final = 50%', 'Final = 75%', 'Final = 100%'],
          series: [{ name: 'Course grade', values: [0, 0.5, 0.75, 1].map((f) => (c * (1 - wf) + 100 * f * wf) / 100) }],
          format: { format: 'percent' },
        },
      ],
      note,
      steps: [`Current work counts for ${100 - w}%: ${c} × ${(1 - wf).toFixed(2)} = ${(c * (1 - wf)).toFixed(2)}`, `Needed = (${t} − ${(c * (1 - wf)).toFixed(2)}) ÷ ${wf} = ${needed.toFixed(2)}%`],
    };
  },
  content: {
    formula: ['Needed = (target − current × (1 − w)) ÷ w', 'w = final exam weight as a decimal (25% → 0.25)'],
    body: [
      'Your course grade is a weighted average of the work done so far and the final exam. If the final is worth 25%, everything else counts for the remaining 75%. Subtract that 75% share of your current grade from the target and divide by 0.25 to see what the final has to contribute.',
      'The result can be above 100% — meaning the target is out of reach without extra credit — or below zero, meaning you have already secured it. The two extra outputs show the best and worst case so you know your range.',
      'This assumes your current grade is a percentage of the work already graded and that nothing else is left besides the final. If there are still assignments to come, use the weighted grade calculator to project them first.',
    ],
    faq: [
      { q: 'What if my class uses points instead of percentages?', a: 'Convert to percentages: current grade = points earned ÷ points possible so far, and the final’s weight = final points ÷ total course points.' },
      { q: 'Why do I need more than my target on the final?', a: 'When your current grade is below the target, the final has to pull the average up, so it must be higher than the target itself. The lower the final’s weight, the bigger the jump needed.' },
    ],
  },
  related: ['weighted-grade', 'test-grade', 'gpa'],
  examples: [
    { values: { current: 88, weight: 25, target: 90 }, expect: { needed: 0.96, ifPerfect: 0.91, ifZero: 0.66 } },
    { values: { current: 72, weight: 20, target: 80 }, expect: { needed: 1.12 } },
  ],
});
