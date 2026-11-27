import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const det2 = (a: number, b: number, c: number, d: number) => a * d - b * c;

export default defineCalculator({
  slug: 'matrix-calculator',
  title: 'Matrix Determinant and Inverse Calculator',
  category: 'math',
  description: 'Find the determinant and inverse of a 2 × 2 or 3 × 3 matrix. See the cofactor expansion step by step and a clear warning when the matrix is singular.',
  metaDescription: 'Matrix calculator for 2x2 and 3x3 matrices: determinant, inverse and singular check, with the cofactor expansion shown step by step.',
  updated: '2026-11-27',
  keywords: ['matrix determinant calculator', 'matrix inverse calculator', '3x3 matrix inverse', '2x2 matrix determinant', 'singular matrix checker', 'cofactor expansion calculator'],
  inputs: [
    { id: 'size', label: 'Matrix size', type: 'select', default: '3', options: [{ value: '2', label: '2 × 2' }, { value: '3', label: '3 × 3' }], info: 'Pick 2 × 2 or 3 × 3. The extra row and column are hidden for 2 × 2.' },
    { id: 'a', label: 'Row 1, column 1', type: 'number', default: 2, info: 'The entry in row 1, column 1 of the matrix.' },
    { id: 'b', label: 'Row 1, column 2', type: 'number', default: 0, info: 'The entry in row 1, column 2 of the matrix.' },
    { id: 'c', label: 'Row 1, column 3', type: 'number', default: 1, info: 'The entry in row 1, column 3 of the matrix.', showWhen: { input: 'size', is: '3' } },
    { id: 'd', label: 'Row 2, column 1', type: 'number', default: 1, info: 'The entry in row 2, column 1 of the matrix.' },
    { id: 'e', label: 'Row 2, column 2', type: 'number', default: 3, info: 'The entry in row 2, column 2 of the matrix.' },
    { id: 'f', label: 'Row 2, column 3', type: 'number', default: 2, info: 'The entry in row 2, column 3 of the matrix.', showWhen: { input: 'size', is: '3' } },
    { id: 'g', label: 'Row 3, column 1', type: 'number', default: 1, info: 'The entry in row 3, column 1 of the matrix.', showWhen: { input: 'size', is: '3' } },
    { id: 'h', label: 'Row 3, column 2', type: 'number', default: 1, info: 'The entry in row 3, column 2 of the matrix.', showWhen: { input: 'size', is: '3' } },
    { id: 'i', label: 'Row 3, column 3', type: 'number', default: 4, info: 'The entry in row 3, column 3 of the matrix.', showWhen: { input: 'size', is: '3' } },
  ],
  outputs: [
    { id: 'det', label: 'Determinant', primary: true, precision: 6, info: 'The determinant of the matrix. If it is 0 the matrix is singular and has no inverse.' },
    { id: 'inverse', label: 'Inverse matrix', format: 'code', info: 'The inverse, one row per line, in decimals (6 significant figures). Shown only when the determinant is not 0.' },
  ],
  compute: (v) => {
    const n = v.size === '2' ? 2 : 3;
    const keys = n === 2 ? ['a', 'b', 'd', 'e'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    const vals = keys.map((k) => num(v[k]));
    if (vals.some((x) => x === null)) return { det: null, note: 'Enter every entry of the matrix.' };
    const m = vals as number[];
    let det: number;
    let cof: number[][];
    let terms: number[];
    const steps: string[] = [];
    if (n === 2) {
      const [a, b, c, d] = m;
      det = det2(a, b, c, d);
      cof = [[d, -c], [-b, a]];
      terms = [a * d, -(b * c)];
      steps.push(`det = ${fmt(a)} × ${fmt(d)} − ${fmt(b)} × ${fmt(c)} = ${fmt(det)}`);
    } else {
      const [a, b, c, d, e, f, g, h, i] = m;
      const c11 = det2(e, f, h, i);
      const c12 = -det2(d, f, g, i);
      const c13 = det2(d, e, g, h);
      const c21 = -det2(b, c, h, i);
      const c22 = det2(a, c, g, i);
      const c23 = -det2(a, b, g, h);
      const c31 = det2(b, c, e, f);
      const c32 = -det2(a, c, d, f);
      const c33 = det2(a, b, d, e);
      cof = [[c11, c12, c13], [c21, c22, c23], [c31, c32, c33]];
      terms = [a * c11, b * c12, c * c13];
      det = terms[0] + terms[1] + terms[2];
      steps.push(`Expand along row 1: det = ${fmt(a)} × ${fmt(c11)} + ${fmt(b)} × ${fmt(c12)} + ${fmt(c)} × ${fmt(c13)} = ${fmt(det)}`);
    }
    const chart: ChartSpec = {
      type: 'bar',
      title: n === 2 ? 'Terms that make the determinant' : 'Row-1 expansion terms',
      categories: n === 2 ? ['a×d', '−b×c', 'Determinant'] : ['a × C11', 'b × C12', 'c × C13', 'Determinant'],
      series: [{ name: 'Value', values: [...terms, det] }],
      format: { format: 'number' },
    };
    if (Math.abs(det) < 1e-12) {
      steps.push('The determinant is 0, so the matrix is singular and has no inverse.');
      return { det: 0, inverse: null, tone: 'warn', badge: 'Singular', note: 'The determinant is 0, so this matrix has no inverse.', steps, chart };
    }
    // inverse = adjugate / det, and the adjugate is the transpose of the cofactor matrix
    const inv = cof[0].map((_, r) => cof.map((row) => row[r] / det));
    const inverse = inv.map((row) => row.map((x) => fmt(x === 0 ? 0 : x, 6)).join('   ')).join('\n');
    steps.push('Inverse = (1 ÷ determinant) × the transpose of the cofactor matrix.');
    return { det, inverse, steps, chart };
  },
  content: {
    formula: [
      '2 × 2: det = ad − bc',
      '3 × 3: det = a(ei − fh) − b(di − fg) + c(dh − eg)',
      'Inverse = (1 ÷ det) × adjugate (the transpose of the cofactor matrix)',
    ],
    body: [
      'The determinant is a single number that tells you whether a square matrix can be inverted. If it is zero the matrix is singular: its rows are dependent and no inverse exists. Otherwise the inverse is the adjugate divided by the determinant.',
      'For example, the 2 × 2 matrix [[4, 7], [2, 6]] has determinant 4×6 − 7×2 = 10, and its inverse is [[0.6, −0.7], [−0.2, 0.4]]. The 3 × 3 matrix [[2, 0, 1], [1, 3, 2], [1, 1, 4]] has determinant 2×10 − 0×2 + 1×(−2) = 18.',
      'Everything is calculated in your browser, and results are rounded to six significant figures. Use it to check homework, not to replace working it out.',
    ],
    faq: [
      { q: 'How do I find the determinant of a 2 × 2 matrix?', a: 'Multiply the main diagonal and subtract the product of the other diagonal: ad − bc. For [[4, 7], [2, 6]] that is 24 − 14 = 10.' },
      { q: 'When does a matrix have no inverse?', a: 'When its determinant is 0. Such a matrix is called singular. The calculator shows a warning instead of an inverse.' },
      { q: 'How is a 3 × 3 determinant calculated?', a: 'By cofactor expansion along the first row: a(ei − fh) − b(di − fg) + c(dh − eg). The chart shows each of the three terms.' },
      { q: 'Can it do bigger matrices?', a: 'Not yet. It handles 2 × 2 and 3 × 3. To solve two equations directly, see the system of equations calculator.' },
    ],
    sources: [],
  },
  related: ['system-of-equations', 'linear-equation'],
  examples: [
    // 4*6 - 7*2 = 10; inverse = 1/10 [[6,-7],[-2,4]]
    { values: { size: '2', a: 4, b: 7, d: 2, e: 6 }, expect: { det: 10, inverse: '0.6   -0.7\n-0.2   0.4' } },
    // 2(12-2) - 0 + 1(1-3) = 18
    { values: { size: '3', a: 2, b: 0, c: 1, d: 1, e: 3, f: 2, g: 1, h: 1, i: 4 }, expect: { det: 18, inverse: '0.555556   0.0555556   -0.166667\n-0.111111   0.388889   -0.166667\n-0.111111   -0.111111   0.333333' } },
    // rows 1 and 2 equal -> det 0
    { values: { size: '3', a: 1, b: 2, c: 3, d: 1, e: 2, f: 3, g: 4, h: 5, i: 6 }, expect: { det: 0 } },
    // singular 2x2: 2*6 - 3*4 = 0
    { values: { size: '2', a: 2, b: 3, d: 4, e: 6 }, expect: { det: 0 } },
  ],
});
