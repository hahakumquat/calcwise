import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { gradeBands, letterFromPercent } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'test-grade',
  title: 'Test Grade Calculator',
  category: 'other',
  description: 'Turn the number of questions and wrong answers into a percentage score and letter grade.',
  keywords: ['quiz grade', 'test score', 'grade calculator', 'teacher grader', 'easy grader', 'percent correct'],
  popular: true,
  inputs: [
    { id: 'total', label: 'Number of questions (or points)', type: 'number', default: 40, min: 1, info: 'How many questions the test has, or its total possible points if questions carry different weights.' },
    { id: 'wrong', label: 'Wrong answers (or points lost)', type: 'number', default: 6, min: 0, info: 'Questions answered incorrectly or left blank, or points deducted. Decimals allow partial credit.' },
  ],
  outputs: [
    { id: 'score', label: 'Score', format: 'percent', precision: 1, primary: true, info: 'Share of questions answered correctly, as a percentage.' },
    { id: 'letter', label: 'Letter grade', format: 'text', info: 'The letter grade on a common US scale (93+ A, 90 A−, 87 B+ …, below 60 F). Your teacher’s scale may differ.' },
    { id: 'correct', label: 'Correct', precision: 2, info: 'Questions (or points) earned: total minus wrong.' },
    { id: 'perQuestion', label: 'Each question is worth', format: 'percent', precision: 2, info: 'How many percentage points a single question is worth on this test.' },
  ],
  compute: (v) => {
    const total = num(v.total);
    const wrong = num(v.wrong);
    if (!total || wrong === null || total <= 0 || wrong < 0) return { score: null };
    if (wrong > total) return { score: null, error: 'Wrong answers cannot exceed the number of questions.' };
    const correct = total - wrong;
    const score = correct / total;
    const letter = letterFromPercent(score * 100);
    return {
      score,
      letter,
      correct,
      perQuestion: 1 / total,
      chart: { type: 'scale', title: 'Grade band', min: 0, max: 1, value: score, valueLabel: `${(score * 100).toFixed(1)}% · ${letter}`, format: { format: 'percent' }, bands: gradeBands() },
      steps: [`Correct = ${total} − ${wrong} = ${correct}`, `Score = ${correct} ÷ ${total} = ${(score * 100).toFixed(2)}%`],
    };
  },
  content: {
    formula: ['Score = (questions − wrong) ÷ questions × 100%'],
    body: [
      'Subtract the wrong answers from the total, divide by the total and multiply by 100. On a 40-question test, every question is worth 2.5%, so 6 wrong answers cost 15 points and leave 85%.',
      'The letter grade uses a widely used US scale: 93% and up is an A, 90–92.9 A−, 87–89.9 B+, 83–86.9 B, 80–82.9 B−, and so on in 3- and 4-point steps down to 60 (D−). Below 60 is an F. Many teachers use a simpler 90/80/70/60 scale, so check the syllabus.',
      'If questions carry different point values, enter total points and points lost instead — the arithmetic is identical.',
    ],
    faq: [
      { q: 'Does partial credit work?', a: 'Yes. Decimals are allowed, so 2.5 points lost on a 50-point quiz gives 95%.' },
      { q: 'What percentage is a B?', a: 'On the scale used here, 83–86.9% is a B, with B+ starting at 87% and B− at 80%.' },
    ],
  },
  related: ['final-grade', 'weighted-grade', 'gpa', 'percentage'],
  examples: [
    { values: { total: 40, wrong: 6 }, expect: { score: 0.85, letter: 'B', correct: 34, perQuestion: 0.025 } },
    { values: { total: 25, wrong: 1 }, expect: { score: 0.96, letter: 'A' } },
    { values: { total: 20, wrong: 9 }, expect: { score: 0.55, letter: 'F' } },
  ],
});
