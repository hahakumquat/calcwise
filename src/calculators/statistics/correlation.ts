import { defineCalculator } from '../../lib/types';
import { sum, mean, tCdf } from '../../lib/math';
import { fmt, nums } from '../../lib/helpers/math-extra';

function strength(r: number): string {
  const a = Math.abs(r);
  const s = a >= 0.9 ? 'Very strong' : a >= 0.7 ? 'Strong' : a >= 0.5 ? 'Moderate' : a >= 0.3 ? 'Weak' : 'Very weak or no';
  return `${s} ${r > 0 ? 'positive' : r < 0 ? 'negative' : ''} linear relationship`.replace(/\s+/g, ' ');
}

export default defineCalculator({
  slug: 'correlation',
  title: 'Correlation Coefficient Calculator',
  category: 'statistics',
  description: 'Paste paired X and Y data to get Pearson’s r, r², the least-squares regression line and a significance test.',
  keywords: ['pearson correlation', 'r value', 'r squared', 'linear regression', 'line of best fit', 'coefficient of determination', 'scatter plot'],
  inputs: [
    { id: 'x', info: 'The first variable for each pair, e.g. hours studied. Separate values with commas or spaces.', label: 'X values', type: 'list', default: '1, 2, 3, 4, 5, 6, 7, 8', placeholder: 'e.g. hours studied' },
    { id: 'y', info: 'The second variable for each pair, in the same order and with the same count as X.', label: 'Y values', type: 'list', default: '52, 55, 61, 64, 62, 70, 74, 79', placeholder: 'e.g. test score — same count as X' },
  ],
  outputs: [
    { id: 'r', info: 'Pearson’s r, from −1 to +1: how closely the points follow a straight line and in which direction.', label: 'Pearson correlation (r)', primary: true, precision: 6 },
    { id: 'r2', info: 'The share of the variation in Y explained by the straight-line relationship with X.', label: 'Coefficient of determination (r²)', precision: 6 },
    { id: 'equation', info: 'The least-squares line of best fit, used to predict Y from X.', label: 'Regression line', format: 'text' },
    { id: 'slope', info: 'How much Y changes on average for each 1-unit increase in X.', label: 'Slope (b)', precision: 6 },
    { id: 'intercept', info: 'The predicted value of Y when X is 0.', label: 'Intercept (a)', precision: 6 },
    { id: 'p', info: 'The chance of seeing a correlation this strong if there were really no linear relationship.', label: 'p-value (H₀: ρ = 0)', precision: 6 },
    { id: 'n', info: 'How many (X, Y) pairs were used.', label: 'Number of pairs', format: 'integer' },
  ],
  compute: (v) => {
    const xs = nums(v.x);
    const ys = nums(v.y);
    if (!xs.length || !ys.length) return { r: null };
    if (xs.length !== ys.length) return { r: null, error: `X has ${xs.length} values but Y has ${ys.length}. Each X needs a matching Y.` };
    const n = xs.length;
    if (n < 3) return { r: null, error: 'Enter at least three pairs.' };
    const mx = mean(xs);
    const my = mean(ys);
    const sxy = sum(xs.map((x, i) => (x - mx) * (ys[i] - my)));
    const sxx = sum(xs.map((x) => (x - mx) ** 2));
    const syy = sum(ys.map((y) => (y - my) ** 2));
    if (sxx === 0 || syy === 0) return { r: null, error: 'Correlation is undefined when all X values (or all Y values) are identical.' };
    const r = Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
    const b = sxy / sxx;
    const a = my - b * mx;
    const df = n - 2;
    let p: number;
    if (Math.abs(r) === 1) p = 0;
    else {
      const t = (r * Math.sqrt(df)) / Math.sqrt(1 - r * r);
      p = 2 * tCdf(-Math.abs(t), df);
    }
    const equation = `y = ${fmt(b, 6)}x ${a < 0 ? '−' : '+'} ${fmt(Math.abs(a), 6)}`;
    return {
      r,
      r2: r * r,
      equation,
      slope: b,
      intercept: a,
      p,
      n,
      chart: { type: 'scatter', title: 'Data with the least-squares line', points: xs.map((x, i): [number, number] => [x, ys[i]]), line: { slope: b, intercept: a, label: equation }, xLabel: 'X', yLabel: 'Y' },
      steps: [
        `n = ${n}, x̄ = ${fmt(mx)}, ȳ = ${fmt(my)}`,
        `Sxy = Σ(x − x̄)(y − ȳ) = ${fmt(sxy)}`,
        `Sxx = Σ(x − x̄)² = ${fmt(sxx)}, Syy = Σ(y − ȳ)² = ${fmt(syy)}`,
        `r = Sxy ÷ √(Sxx · Syy) = ${fmt(sxy)} ÷ √(${fmt(sxx)} × ${fmt(syy)}) = ${fmt(r, 6)}`,
        `Slope b = Sxy ÷ Sxx = ${fmt(b, 6)}; intercept a = ȳ − b·x̄ = ${fmt(a, 6)}`,
        `t = r√(n − 2) ÷ √(1 − r²) with df = ${df} → two-tailed p = ${fmt(p, 4)}`,
      ],
      note: `${strength(r)}; r² = ${fmt(r * r, 3)} means about ${fmt(r * r * 100, 3)}% of the variation in Y is explained by X.`,
    };
  },
  content: {
    formula: ['r = Σ(x − x̄)(y − ȳ) ÷ √(Σ(x − x̄)² · Σ(y − ȳ)²)', 'b = Sxy ÷ Sxx,  a = ȳ − b·x̄  →  ŷ = a + bx', 't = r√(n − 2) ÷ √(1 − r²),  df = n − 2'],
    body: [
      'Pearson’s correlation coefficient r measures how closely two variables follow a straight-line relationship. It ranges from −1 (a perfect downward line) through 0 (no linear relationship) to +1 (a perfect upward line). Roughly, |r| above 0.7 is considered strong and below 0.3 weak, though what counts as meaningful varies by field.',
      'Squaring r gives the coefficient of determination r², the share of the variation in Y that the straight line accounts for. An r of 0.8 means r² = 0.64, so 64% of the variation is explained and 36% is left over.',
      'The regression (least-squares) line is the straight line that makes the sum of squared vertical distances from the points as small as possible. Use it to predict Y from X within the range of your data; extrapolating far beyond it is risky.',
    ],
    faq: [
      { q: 'Does a strong correlation prove causation?', a: 'No. Two variables can move together because a third factor drives both, or by coincidence. Ice-cream sales and drowning deaths are correlated because both rise in hot weather.' },
      { q: 'Can r be near 0 even if the variables are related?', a: 'Yes. Pearson’s r only detects straight-line patterns. A U-shaped relationship can have r ≈ 0. Always look at a scatter plot.' },
      { q: 'What does the p-value tell me?', a: 'It tests whether the true population correlation could be zero. A small p-value (say below 0.05) suggests the correlation in your sample is unlikely to be due to chance alone.' },
    ],
  },
  related: ['slope', 'standard-deviation', 'mean-median-mode', 'p-value'],
  examples: [
    { values: { x: [1, 2, 3, 4, 5], y: [2, 4, 5, 4, 5] }, expect: { r: 0.7745967, r2: 0.6, slope: 0.6, intercept: 2.2, n: 5, equation: 'y = 0.6x + 2.2' }, tolerance: 1e-6 },
    { values: { x: [1, 2, 3], y: [6, 4, 2] }, expect: { r: -1, slope: -2, intercept: 8, p: 0 } },
  ],
});
