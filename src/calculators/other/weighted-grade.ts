import { defineCalculator } from '../../lib/types';
import { gradeBands, letterFromPercent, nonEmptyLines } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'weighted-grade',
  title: 'Weighted Grade Calculator',
  category: 'other',
  description: 'Combine assignment, quiz and exam scores with their weights into one overall course grade.',
  keywords: ['weighted average grade', 'course grade', 'class grade', 'grade weights', 'syllabus weights'],
  inputs: [
    {
      id: 'items',
      label: 'Scores — one per line: score % then weight %',
      type: 'textarea',
      rows: 6,
      default: '92 20\n85 30\n78 50',
      placeholder: 'Homework 95 15\nMidterm 82 35',
      help: 'Each line ends with the score (out of 100) and its weight. A label in front is optional. Weights need not add up to 100.',
      info: 'One graded category per line: its average score in percent, then its weight from the syllabus, e.g. “Quizzes 88 15”.',
    },
  ],
  outputs: [
    { id: 'grade', label: 'Weighted grade', format: 'percent', precision: 2, primary: true, info: 'Your overall grade: each score multiplied by its weight, summed, and divided by the total weight.' },
    { id: 'letter', label: 'Letter grade', format: 'text', info: 'The letter grade on a common US scale (93+ A, 90 A−, 87 B+ …). Your course may use different cut-offs.' },
    { id: 'totalWeight', label: 'Total weight entered', precision: 2, suffix: '%', info: 'The sum of the weights you entered. Under 100% means part of the course has not been graded yet.' },
  ],
  compute: (v) => {
    const lines = nonEmptyLines(v.items);
    if (!lines.length) return { grade: null, error: 'Add at least one line, e.g. “88 25”.' };
    let sw = 0;
    let swx = 0;
    const steps: string[] = [];
    const cats: string[] = [];
    const scores: number[] = [];
    for (const { line, n } of lines) {
      const parts = line.replace(/%/g, ' ').split(/[\s,;\t]+/).filter(Boolean);
      const score = Number(parts[parts.length - 2]);
      const weight = Number(parts[parts.length - 1]);
      if (parts.length < 2 || !Number.isFinite(score) || !Number.isFinite(weight))
        return { grade: null, error: `Line ${n}: expected a score and a weight, e.g. “88 25”.` };
      if (weight < 0 || score < 0) return { grade: null, error: `Line ${n}: scores and weights cannot be negative.` };
      sw += weight;
      swx += score * weight;
      const name = parts.slice(0, -2).join(' ');
      cats.push(`${name || `Item ${cats.length + 1}`} (${weight}%)`);
      scores.push(score / 100);
      steps.push(`${score} × ${weight} = ${(score * weight).toFixed(2)}`);
    }
    if (sw === 0) return { grade: null, error: 'The weights add up to zero.' };
    const pct = swx / sw;
    steps.push(`Grade = ${swx.toFixed(2)} ÷ ${sw} = ${pct.toFixed(2)}%`);
    const letter = letterFromPercent(pct);
    const max = Math.max(1, Math.ceil(Math.max(...scores, pct / 100) * 10) / 10);
    return {
      grade: pct / 100,
      letter,
      totalWeight: sw,
      chart: [
        { type: 'scale', title: 'Overall grade', min: 0, max, value: pct / 100, valueLabel: `${pct.toFixed(1)}% · ${letter}`, format: { format: 'percent' }, bands: gradeBands(max) },
        {
          type: 'bar',
          title: 'Score in each category',
          horizontal: true,
          categories: [...cats, 'Weighted grade'],
          series: [{ name: 'Score', values: [...scores, pct / 100] }],
          format: { format: 'percent' },
          highlight: cats.length,
        },
      ],
      note: Math.abs(sw - 100) > 1e-9 ? `Weights add up to ${sw}%, so the result is your average on the ${sw}% of the course graded so far.` : undefined,
      steps,
    };
  },
  content: {
    formula: ['Weighted grade = Σ (score × weight) ÷ Σ weight'],
    body: [
      'Most syllabi split the course grade into categories — homework, quizzes, a midterm, a final — each worth a fixed share. Multiply each score by its weight, add the products, and divide by the total weight.',
      'If the weights you enter add up to less than 100%, the result is your current standing on the work graded so far, which is usually what online gradebooks show. Once every category is filled in, the weights should total 100%.',
      'Enter category averages, not individual assignments, when a category holds many items. For example, if homework is worth 20% and you averaged 92% across all assignments, a single line “92 20” is enough.',
    ],
    faq: [
      { q: 'Can I use points instead of percentages?', a: 'Use the percentage for each category (points earned ÷ points possible × 100). Weights can be any numbers — 2 and 1 work the same as 66.7% and 33.3%.' },
      { q: 'Why is my weighted grade different from my simple average?', a: 'A simple average treats every score equally. In a weighted average, a low score in a heavily weighted category such as the final pulls the result down more.' },
    ],
  },
  related: ['final-grade', 'gpa', 'test-grade'],
  examples: [
    { values: { items: '92 20\n85 30\n78 50' }, expect: { grade: 0.829, letter: 'B-', totalWeight: 100 } },
    { values: { items: 'Homework 95% 15\nMidterm 80 35' }, expect: { grade: 0.845, totalWeight: 50 } },
  ],
});
