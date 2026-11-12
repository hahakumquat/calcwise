import { defineCalculator } from '../../lib/types';
import { LETTER_POINTS, nonEmptyLines } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'gpa',
  title: 'GPA Calculator',
  category: 'other',
  description: 'Calculate your grade point average on the 4.0 scale from letter grades and credit hours.',
  keywords: ['grade point average', 'college gpa', 'semester gpa', 'cumulative gpa', 'credit hours', '4.0 scale'],
  popular: true,
  inputs: [
    {
      id: 'courses',
      label: 'Courses — one per line: grade then credits',
      type: 'textarea',
      rows: 6,
      default: 'A 3\nB+ 4\nA- 3\nC 2',
      placeholder: 'A- 3\nB+ 4\nBiology A 4',
      help: 'Each line ends with a letter grade (A+ to F) or grade points (e.g. 3.7) and the credit hours. A course name in front is optional.',
      info: 'List each course on its own line with its final letter grade and its credit hours from your transcript, e.g. “Chemistry B+ 4”.',
    },
    {
      id: 'aPlus',
      label: 'A+ is worth',
      type: 'select',
      segmented: true,
      default: '4.0',
      info: 'Most US colleges cap an A+ at 4.0; some award 4.3. Check your school’s grading policy.',
      options: [
        { value: '4.0', label: '4.0' },
        { value: '4.3', label: '4.3' },
      ],
    },
    { id: 'priorGpa', label: 'Previous cumulative GPA', type: 'number', min: 0, max: 4.3, step: 0.01, optional: true, placeholder: 'Optional', info: 'Your overall GPA before these courses, from your transcript. Leave blank to see only this term’s GPA.' },
    { id: 'priorCredits', label: 'Previous credits', type: 'number', min: 0, optional: true, placeholder: 'Optional', info: 'Graded credit hours already counted in your previous GPA (exclude pass/fail credits).' },
  ],
  outputs: [
    { id: 'gpa', label: 'GPA', precision: 2, primary: true, info: 'Credit-weighted average of the grade points for the courses listed, on a 4.0 scale.' },
    { id: 'credits', label: 'Credits', precision: 2, info: 'Total credit hours of the courses listed.' },
    { id: 'points', label: 'Quality points', precision: 2, info: 'Sum of grade points × credits. GPA is quality points ÷ credits.' },
    { id: 'cumulative', label: 'New cumulative GPA', precision: 2, info: 'Your overall GPA after adding these courses to your previous record. Shown only if both previous fields are filled in.' },
  ],
  compute: (v) => {
    const lines = nonEmptyLines(v.courses);
    if (!lines.length) return { gpa: null, error: 'Add at least one course, e.g. “A- 3”.' };
    let credits = 0;
    let points = 0;
    const steps: string[] = [];
    const cats: string[] = [];
    const vals: number[] = [];
    for (const { line, n } of lines) {
      const parts = line.split(/[\s,;\t]+/);
      if (parts.length < 2) return { gpa: null, error: `Line ${n}: expected a grade and credits, e.g. “B+ 3”.` };
      const cr = Number(parts[parts.length - 1]);
      const g = parts[parts.length - 2].toUpperCase();
      let gp: number | undefined = g === 'A+' && v.aPlus === '4.3' ? 4.3 : LETTER_POINTS[g];
      if (gp === undefined && /^\d+(\.\d+)?$/.test(g) && Number(g) <= 4.3) gp = Number(g);
      if (gp === undefined) return { gpa: null, error: `Line ${n}: “${parts[parts.length - 2]}” is not a letter grade (A+ … F) or grade points.` };
      if (!Number.isFinite(cr) || cr < 0) return { gpa: null, error: `Line ${n}: credits must be a positive number.` };
      credits += cr;
      points += gp * cr;
      const name = parts.slice(0, -2).join(' ');
      cats.push(`${name ? name + ' ' : `#${cats.length + 1} `}${g} (${cr} cr)`);
      vals.push(gp);
      steps.push(`${g}: ${gp.toFixed(1)} × ${cr} = ${(gp * cr).toFixed(1)}`);
    }
    if (credits === 0) return { gpa: null, error: 'Total credits must be more than zero.' };
    const gpa = points / credits;
    const pg = typeof v.priorGpa === 'number' ? v.priorGpa : null;
    const pc = typeof v.priorCredits === 'number' ? v.priorCredits : null;
    const cumulative = pg !== null && pc !== null && pc >= 0 ? (pg * pc + points) / (pc + credits) : null;
    steps.push(`GPA = ${points.toFixed(1)} ÷ ${credits} = ${gpa.toFixed(3)}`);
    const top = v.aPlus === '4.3' ? 4.3 : 4;
    return {
      gpa,
      credits,
      points,
      cumulative,
      chart: [
        {
          type: 'scale',
          title: 'Your GPA',
          min: 0,
          max: top,
          value: gpa,
          valueLabel: `GPA ${gpa.toFixed(2)}`,
          format: { format: 'number' },
          bands: [
            { from: 0, to: 2, label: 'Below 2.0', tone: 'bad' },
            { from: 2, to: 3, label: 'C–B range', tone: 'warn' },
            { from: 3, to: 3.5, label: 'Good', tone: 'ok' },
            { from: 3.5, to: top, label: 'Honors range', tone: 'good' },
          ],
        },
        {
          type: 'bar',
          title: 'Grade points by course',
          horizontal: true,
          categories: cats,
          series: [{ name: 'Grade points', values: vals }],
          format: { format: 'number' },
        },
      ],
      note: gpa >= 3.5 ? 'Dean’s-list territory at many colleges (often 3.5+).' : gpa < 2 ? 'Below 2.0 — many schools place students on academic probation under this.' : undefined,
      steps,
    };
  },
  content: {
    formula: ['Quality points = grade points × credit hours', 'GPA = Σ quality points ÷ Σ credit hours', 'Cumulative GPA = (old GPA × old credits + new points) ÷ (old credits + new credits)'],
    body: [
      'A GPA is a credit-weighted average. Each letter grade is turned into grade points — A = 4.0, B = 3.0, C = 2.0, D = 1.0, F = 0, with plus and minus grades 0.3 above or below — and multiplied by the course’s credit hours. Add those quality points up and divide by the total credits.',
      'Because of the weighting, a 4-credit course moves your GPA more than a 1-credit lab. Retaking a high-credit class is usually the fastest way to raise a low average, if your school replaces the old grade.',
      'Schools differ in the details: some count an A+ as 4.3, some do not use minus grades, and pass/fail or withdrawn courses are normally left out of the calculation. To project your overall GPA, enter your current cumulative GPA and credits along with this term’s courses.',
    ],
    faq: [
      { q: 'What is the difference between weighted and unweighted GPA?', a: 'Unweighted GPA uses the plain 4.0 scale shown here. Weighted high-school GPAs add extra points (often +0.5 or +1.0) for honors and AP classes, so they can exceed 4.0.' },
      { q: 'How do I convert a percentage to a letter grade?', a: 'A common US scale is 93+ = A, 90–92 = A−, 87–89 = B+, 83–86 = B, 80–82 = B−, and so on down to below 60 = F. Your syllabus is the authority.' },
      { q: 'Can I type grade points instead of letters?', a: 'Yes — a line like “3.7 3” is read as 3.7 grade points for a 3-credit course.' },
    ],
  },
  related: ['final-grade', 'weighted-grade', 'test-grade'],
  examples: [
    { values: { courses: 'A 3\nB+ 4\nA- 3\nC 2', aPlus: '4.0', priorGpa: null, priorCredits: null }, expect: { gpa: 3.3583333, credits: 12, points: 40.3 }, tolerance: 1e-6 },
    { values: { courses: 'Calculus A+ 4\nHistory 3.0 3', aPlus: '4.3', priorGpa: 3, priorCredits: 30 }, expect: { gpa: 3.7428571, points: 26.2, cumulative: 3.1405405 }, tolerance: 1e-6 },
  ],
});
