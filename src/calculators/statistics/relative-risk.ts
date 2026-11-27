import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const pc = (n: number) => (n * 100).toFixed(2) + '%';

export default defineCalculator({
  slug: 'relative-risk',
  title: 'Relative Risk, Odds Ratio and NNT Calculator',
  category: 'statistics',
  description: 'Compare two groups from a 2×2 table: risk in each group, relative risk, risk difference, odds ratio and number needed to treat. Arithmetic only.',
  keywords: ['relative risk calculator', 'odds ratio calculator', 'number needed to treat calculator', 'absolute risk reduction', '2x2 table calculator', 'risk difference'],
  updated: '2026-11-27',
  inputs: [
    { id: 'aEvents', label: 'Group A: people with the outcome', type: 'number', default: 10, min: 0, step: 1, info: 'In group A (for example treated or exposed), how many had the outcome.' },
    { id: 'aTotal', label: 'Group A: total people', type: 'number', default: 100, min: 1, step: 1, info: 'Everyone in group A, with or without the outcome.' },
    { id: 'bEvents', label: 'Group B: people with the outcome', type: 'number', default: 20, min: 0, step: 1, info: 'In group B (for example comparison or unexposed), how many had the outcome.' },
    { id: 'bTotal', label: 'Group B: total people', type: 'number', default: 100, min: 1, step: 1, info: 'Everyone in group B.' },
  ],
  outputs: [
    { id: 'rr', label: 'Relative risk (A vs B)', format: 'number', precision: 3, primary: true, info: 'Risk in A ÷ risk in B. Below 1 means A has the outcome less often.' },
    { id: 'riskA', label: 'Risk in group A', format: 'percent', precision: 2, info: 'Events ÷ total in A.' },
    { id: 'riskB', label: 'Risk in group B', format: 'percent', precision: 2, info: 'Events ÷ total in B.' },
    { id: 'diff', label: 'Risk difference (A − B)', format: 'percent', precision: 2, info: 'Risk in A − risk in B. Negative means A is lower.' },
    { id: 'or', label: 'Odds ratio', format: 'number', precision: 3, info: 'Odds in A ÷ odds in B, where odds = events ÷ non-events.' },
    { id: 'nnt', label: 'Number needed to treat or harm', format: 'number', precision: 1, info: '1 ÷ |risk difference|: people per one extra or one fewer outcome.' },
  ],
  compute: (v) => {
    const a = num(v.aEvents), at = num(v.aTotal), b = num(v.bEvents), bt = num(v.bTotal);
    if (a === null || at === null || b === null || bt === null) return { rr: null };
    if (a < 0 || b < 0 || at < 1 || bt < 1) return { rr: null, error: 'Counts cannot be negative and each group needs at least 1 person.' };
    if (a > at || b > bt) return { rr: null, error: 'People with the outcome cannot exceed the group total.' };
    const riskA = a / at;
    const riskB = b / bt;
    const diff = riskA - riskB;
    const rr = riskB === 0 ? null : riskA / riskB;
    const oddsDen = (at - a) * b;
    const or = oddsDen === 0 ? null : (a * (bt - b)) / oddsDen;
    const nnt = diff === 0 ? null : 1 / Math.abs(diff);
    if (rr === null) {
      return { rr: null, riskA, riskB, diff, or, nnt, error: 'Group B has no outcomes, so relative risk is undefined (division by zero). The risks and difference are still shown.' };
    }
    const lower = diff < 0;
    return {
      rr, riskA, riskB, diff, or, nnt,
      tone: 'good',
      badge: diff === 0 ? 'The two groups have the same risk' : `Risk in A is ${lower ? 'lower' : 'higher'} by ${pc(Math.abs(diff))} points`,
      chart: {
        type: 'bar',
        title: 'Risk in each group',
        categories: ['Group A', 'Group B'],
        series: [{ name: 'Risk', values: [riskA, riskB] }],
        format: { format: 'percent', precision: 1 },
      },
      steps: [
        `Risk A: ${a} ÷ ${at} = ${pc(riskA)}; risk B: ${b} ÷ ${bt} = ${pc(riskB)}`,
        `Relative risk: ${pc(riskA)} ÷ ${pc(riskB)} = ${rr.toFixed(3)}`,
        `Risk difference: ${pc(riskA)} − ${pc(riskB)} = ${pc(diff)}`,
        or === null ? 'Odds ratio is undefined: a zero cell makes a division by zero.' : `Odds ratio: (${a} × ${bt - b}) ÷ (${at - a} × ${b}) = ${or.toFixed(3)}`,
        nnt === null ? 'Number needed: undefined when the risks are equal.' : `Number needed: 1 ÷ ${pc(Math.abs(diff))} = ${nnt.toFixed(1)}`,
      ],
      note: 'This is arithmetic on the counts you enter, not medical advice. It gives no confidence interval or p-value, so it cannot say whether a difference is statistically meaningful, and it says nothing about cause. Small groups can produce big ratios by chance.',
    };
  },
  content: {
    formula: [
      'Risk = people with the outcome ÷ people in the group',
      'Relative risk = risk in A ÷ risk in B',
      'Risk difference = risk in A − risk in B',
      'Odds = events ÷ non-events; odds ratio = odds in A ÷ odds in B',
      'Number needed = 1 ÷ |risk difference|',
    ],
    body: [
      'Studies and news stories often compare two groups. This calculator turns the four counts of a 2×2 table into the usual summary numbers: the risk in each group, relative risk, risk difference, odds ratio and the number needed to treat.',
      'Relative risk and absolute difference tell different stories. Cutting a risk from 2% to 1% halves it (relative risk 0.5) but changes it by only 1 percentage point, so 100 people are needed for one fewer outcome.',
      'Odds ratios are close to relative risks when the outcome is rare, and drift apart when it is common. None of these numbers show whether a result is statistically reliable, which needs a confidence interval or test.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'Group A has 10 of 100 with the outcome (10%) and group B has 20 of 100 (20%). Relative risk is 0.10 ÷ 0.20 = 0.5, the risk difference is −10 percentage points, the odds ratio is (10 × 80) ÷ (90 × 20) = 0.444, and the number needed is 1 ÷ 0.10 = 10.' },
      { q: 'What is the difference between relative risk and odds ratio?', a: 'Relative risk compares probabilities: events ÷ total. The odds ratio compares odds: events ÷ non-events. They are similar for rare outcomes and differ for common ones.' },
      { q: 'What does number needed to treat mean?', a: 'It is 1 divided by the absolute risk difference: roughly how many people would need to be in group A instead of B for one more or one fewer outcome. Called number needed to harm when the risk is higher in A.' },
      { q: 'Why is relative risk undefined when group B has no outcomes?', a: 'It divides by the risk in group B. If that is 0 the division is impossible, so the risks and difference are shown instead.' },
      { q: 'Does it say if the result is significant?', a: 'No. It has no confidence interval or p-value. Treat it as arithmetic on the counts you entered.' },
    ],
    sources: [],
  },
  related: ['bayes-theorem', 'percent-difference', 'sample-size'],
  examples: [
    // 10/100=.1; 20/100=.2; rr .5; diff -.1; or (10*80)/(90*20)=.44444; nnt 10
    { values: { aEvents: 10, aTotal: 100, bEvents: 20, bTotal: 100 }, expect: { rr: 0.5, riskA: 0.1, riskB: 0.2, diff: -0.1, or: 0.444444, nnt: 10 }, tolerance: 0.001 },
    // 30/200=.15; 15/150=.1; rr 1.5; diff .05; or (30*135)/(170*15)=4050/2550=1.588235; nnt 20
    { values: { aEvents: 30, aTotal: 200, bEvents: 15, bTotal: 150 }, expect: { rr: 1.5, diff: 0.05, or: 1.588235, nnt: 20 }, tolerance: 0.001 },
  ],
});
