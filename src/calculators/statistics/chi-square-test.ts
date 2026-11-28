import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

/** Complementary error function, accurate in the far tail (continued fraction for x >= 3). */
function erfc(x: number): number {
  if (x < 3) {
    let term = x;
    let s = x;
    for (let n = 1; n < 100; n++) {
      term *= (-x * x) / n;
      const add = term / (2 * n + 1);
      s += add;
      if (Math.abs(add) < 1e-16) break;
    }
    return 1 - (2 * s) / Math.sqrt(Math.PI);
  }
  let f = 0;
  for (let n = 60; n >= 1; n--) f = n / 2 / (x + f);
  return Math.exp(-x * x) / Math.sqrt(Math.PI) / (x + f);
}

export default defineCalculator({
  slug: 'chi-square-test',
  title: 'Chi-Square Test for a 2×2 Table',
  category: 'statistics',
  description: 'Chi-square test of independence for a 2×2 table of counts: chi-square, p-value, expected counts and Cramér\'s V, with an optional Yates correction.',
  keywords: ['chi square calculator', 'chi-square test 2x2', 'chi square test of independence', 'contingency table calculator', 'cramers v calculator', 'yates correction'],
  updated: '2026-11-28',
  inputs: [
    { id: 'a', label: 'Row 1, column 1 (a)', type: 'number', default: 30, min: 0, step: 1, info: 'Count in the top-left cell of your 2×2 table.' },
    { id: 'b', label: 'Row 1, column 2 (b)', type: 'number', default: 20, min: 0, step: 1, info: 'Count in the top-right cell.' },
    { id: 'c', label: 'Row 2, column 1 (c)', type: 'number', default: 20, min: 0, step: 1, info: 'Count in the bottom-left cell.' },
    { id: 'd', label: 'Row 2, column 2 (d)', type: 'number', default: 30, min: 0, step: 1, info: 'Count in the bottom-right cell.' },
    { id: 'yates', label: 'Yates continuity correction', type: 'toggle', default: false, info: 'Off by default. On: subtracts half the total from |ad − bc| before squaring, which makes the test more conservative for small tables.' },
  ],
  outputs: [
    { id: 'chi2', label: 'Chi-square', format: 'number', precision: 4, primary: true, info: 'N(ad − bc)² ÷ ((a+b)(c+d)(a+c)(b+d)), with 1 degree of freedom. Larger means the counts depart more from independence.' },
    { id: 'p', label: 'p-value', format: 'number', precision: 4, info: 'Probability of a chi-square at least this large if the rows and columns were independent. Computed as erfc(√(chi-square ÷ 2)).' },
    { id: 'v', label: 'Cramér\'s V', format: 'number', precision: 3, info: 'Effect size, √(chi-square ÷ N), from 0 (no association) to 1 (perfect).' },
    { id: 'n', label: 'Total count (N)', format: 'integer', info: 'a + b + c + d.' },
    { id: 'minExp', label: 'Smallest expected count', format: 'number', precision: 2, info: 'Row total × column total ÷ N for the weakest cell. Below 5, the chi-square approximation is unreliable.' },
  ],
  compute: (v) => {
    const a = num(v.a), b = num(v.b), c = num(v.c), d = num(v.d);
    if (a === null || b === null || c === null || d === null) return { chi2: null };
    if (a < 0 || b < 0 || c < 0 || d < 0) return { chi2: null, error: 'Counts cannot be negative.' };
    if (![a, b, c, d].every(Number.isInteger)) return { chi2: null, error: 'Counts must be whole numbers.' };
    const r1 = a + b, r2 = c + d, c1 = a + c, c2 = b + d;
    const n = r1 + r2;
    if (r1 === 0 || r2 === 0 || c1 === 0 || c2 === 0) return { chi2: null, error: 'Every row and every column needs a total above zero, otherwise the test cannot be computed.' };
    const yates = v.yates === 'on';
    const diff = Math.abs(a * d - b * c);
    const adj = yates ? Math.max(0, diff - n / 2) : diff;
    const chi2 = (n * adj * adj) / (r1 * r2 * c1 * c2);
    const p = erfc(Math.sqrt(chi2 / 2));
    const cv = Math.sqrt(chi2 / n);
    const exp = [r1 * c1 / n, r1 * c2 / n, r2 * c1 / n, r2 * c2 / n];
    const minExp = Math.min(...exp);
    const warn: string[] = [];
    if (minExp < 5) warn.push('An expected count is below 5, so the chi-square p-value may be unreliable. Consider Fisher\'s exact test.');
    warn.push('A small p-value says the pattern is unlikely under independence. It does not say how big or important the effect is; Cramér\'s V gives a sense of size, and neither shows cause.');
    return {
      chi2, p, v: cv, n, minExp,
      tone: p < 0.05 ? 'good' : 'ok',
      badge: p < 0.05 ? `p = ${p.toFixed(4)}, below 0.05` : `p = ${p.toFixed(4)}, not below 0.05`,
      chart: {
        type: 'bar',
        title: 'Observed and expected counts',
        categories: ['Row 1, col 1', 'Row 1, col 2', 'Row 2, col 1', 'Row 2, col 2'],
        series: [
          { name: 'Observed', values: [a, b, c, d] },
          { name: 'Expected', values: exp },
        ],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `N = ${a} + ${b} + ${c} + ${d} = ${n}; row totals ${r1}, ${r2}; column totals ${c1}, ${c2}`,
        `|ad − bc| = |${a * d} − ${b * c}| = ${diff}${yates ? `; Yates: ${diff} − ${n / 2} = ${adj}` : ''}`,
        `Chi-square = ${n} × ${adj}² ÷ (${r1} × ${r2} × ${c1} × ${c2}) = ${chi2.toFixed(4)}`,
        `p = erfc(√(${chi2.toFixed(4)} ÷ 2)) = ${p.toFixed(4)}; Cramér's V = √(${chi2.toFixed(4)} ÷ ${n}) = ${cv.toFixed(3)}`,
        `Expected counts: ${exp.map((e) => e.toFixed(2)).join(', ')}`,
      ],
      note: warn.join(' '),
    };
  },
  content: {
    formula: [
      'N = a + b + c + d',
      'Chi-square = N (ad − bc)² ÷ ((a+b)(c+d)(a+c)(b+d)), df = 1',
      'Yates: N (|ad − bc| − N/2)² ÷ ((a+b)(c+d)(a+c)(b+d))',
      'p = erfc(√(chi-square ÷ 2)); Cramér\'s V = √(chi-square ÷ N)',
      'Expected cell = row total × column total ÷ N',
    ],
    body: [
      'The chi-square test of independence asks whether two yes/no variables are related, such as which page version a visitor saw and whether they signed up. Enter the four counts of the 2×2 table and the calculator returns the chi-square statistic, its p-value, the expected counts and Cramér\'s V.',
      'For a 2×2 table there is one degree of freedom, and the p-value follows directly from the chi-square: p = erfc(√(chi-square ÷ 2)). The test compares each observed count with the count expected if rows and columns were independent.',
      'The test works best when every expected count is at least 5. With small counts the approximation is poor, and an exact test is safer. The Yates correction is optional and makes the result more conservative.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'With a = 30, b = 20, c = 20, d = 30: N = 100 and chi-square = 100 × 500² ÷ 50⁴ = 4.00. The p-value is about 0.0455, Cramér\'s V is 0.20, and every expected count is 25.' },
      { q: 'What does the p-value mean?', a: 'It is the chance of seeing a chi-square at least this large if the two variables were truly independent. A small value is evidence of an association, but it does not measure the size of the effect.' },
      { q: 'When should I use the Yates correction?', a: 'It is sometimes used for small 2×2 tables. It reduces chi-square, so p-values rise. With the example counts and the correction on, chi-square falls from 4.00 to 3.24 and p to about 0.0719.' },
      { q: 'What if an expected count is below 5?', a: 'The chi-square approximation becomes unreliable. The calculator warns you; an exact test such as Fisher\'s is the usual alternative.' },
      { q: 'How is this different from the A/B test calculator?', a: 'The A/B test calculator compares two conversion rates with a z-test. For a 2×2 table without the Yates correction the two give the same p-value, since z² equals chi-square.' },
    ],
    sources: [],
  },
  related: ['ab-test', 'correlation', 'p-value', 'relative-risk'],
  examples: [
    // N=100; ad-bc=900-400=500; chi2=100*250000/(50^4=6,250,000)=4; p=erfc(sqrt2)=0.0455003; V=sqrt(.04)=0.2; expected all 25
    { values: { a: 30, b: 20, c: 20, d: 30, yates: 'off' }, expect: { chi2: 4, p: 0.0455003, v: 0.2, n: 100, minExp: 25 }, tolerance: 1e-4 },
    // Yates: (500-50)=450; chi2=100*202500/6,250,000=3.24; z=1.8, two-sided p=0.0718603; V=sqrt(.0324)=0.18
    { values: { a: 30, b: 20, c: 20, d: 30, yates: 'on' }, expect: { chi2: 3.24, p: 0.0718603, v: 0.18 }, tolerance: 1e-4 },
    // N=40; ad-bc=180-40=140; rows 20,20; cols 17,23; chi2=40*19600/156400=5.012788; min expected 20*17/40=8.5
    { values: { a: 12, b: 8, c: 5, d: 15, yates: 'off' }, expect: { chi2: 5.012788, n: 40, minExp: 8.5 }, tolerance: 1e-4 },
  ],
});
