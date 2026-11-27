import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const int = (n: number) => Math.round(n).toLocaleString('en-US');

export default defineCalculator({
  slug: 'bayes-theorem',
  title: 'Bayes Theorem Calculator',
  category: 'statistics',
  description: 'Find the chance you really have a condition after a positive test, from the base rate, sensitivity and false positive rate, with counts per 10,000 people.',
  keywords: ['bayes theorem calculator', 'positive predictive value', 'false positive calculator', 'base rate fallacy', 'conditional probability', 'test accuracy'],
  updated: '2026-11-27',
  inputs: [
    { id: 'prior', label: 'Base rate (prior probability)', type: 'number', suffix: '%', default: 1, min: 0, max: 100, step: 0.1, info: 'How common the condition is before testing, as a percent of everyone tested. 1% means 1 in 100 people has it.' },
    { id: 'sens', label: 'Sensitivity (true positive rate)', type: 'number', suffix: '%', default: 90, min: 0, max: 100, step: 0.1, info: 'Of people who do have the condition, the percent the test correctly flags as positive.' },
    { id: 'fpr', label: 'False positive rate', type: 'number', suffix: '%', default: 9, min: 0, max: 100, step: 0.1, info: 'Of people who do not have the condition, the percent the test wrongly flags as positive (100% minus specificity).' },
  ],
  outputs: [
    { id: 'posterior', label: 'Chance you have it after a positive test', format: 'percent', precision: 2, primary: true, info: 'P(condition | positive) = s × p ÷ (s × p + f × (1 − p)).' },
    { id: 'negPosterior', label: 'Chance you have it after a negative test', format: 'percent', precision: 2, info: 'P(condition | negative) = (1 − s) × p ÷ ((1 − s) × p + (1 − f) × (1 − p)).' },
    { id: 'truePos', label: 'True positives per 10,000', format: 'number', precision: 0, info: 'People per 10,000 who have the condition and test positive.' },
    { id: 'falsePos', label: 'False positives per 10,000', format: 'number', precision: 0, info: 'People per 10,000 who do not have the condition but test positive.' },
  ],
  compute: (v) => {
    const p100 = num(v.prior), s100 = num(v.sens), f100 = num(v.fpr);
    if (p100 === null || s100 === null || f100 === null) return { posterior: null };
    if ([p100, s100, f100].some((x) => x < 0 || x > 100)) return { posterior: null, error: 'Enter every value as a percent between 0 and 100.' };
    const p = p100 / 100, s = s100 / 100, f = f100 / 100;
    const posDen = s * p + f * (1 - p);
    if (posDen === 0) return { posterior: null, error: 'Nobody can test positive with these inputs (sensitivity × base rate and false positive rate × (1 − base rate) are both 0), so the chance after a positive is undefined.' };
    const posterior = (s * p) / posDen;
    const negDen = (1 - s) * p + (1 - f) * (1 - p);
    const negPosterior = negDen === 0 ? null : ((1 - s) * p) / negDen;

    const N = 10000;
    const have = N * p, healthy = N - have;
    const tp = have * s, fn = have - tp;
    const fp = healthy * f, tn = healthy - fp;
    const pct = posterior * 100;

    const steps = [
      `Per ${int(N)} people: ${int(have)} have it and ${int(healthy)} do not.`,
      `Of the ${int(have)} who have it, ${int(tp)} test positive (${fmt(s100, 1)}%) and ${int(fn)} test negative.`,
      `Of the ${int(healthy)} who do not, ${int(fp)} test positive (${fmt(f100, 1)}%) and ${int(tn)} test negative.`,
      `Positives: ${int(tp)} + ${int(fp)} = ${int(tp + fp)}. Real ones: ${int(tp)} ÷ ${int(tp + fp)} = ${fmt(pct)}%.`,
    ];
    const tone = pct >= 90 ? 'bad' : pct >= 50 ? 'warn' : 'ok';
    return {
      posterior,
      ...(negPosterior !== null ? { negPosterior } : {}),
      truePos: tp,
      falsePos: fp,
      tone,
      badge: `${fmt(pct)}% after a positive`,
      note: `Out of ${int(tp + fp)} positive results per ${int(N)} people, ${int(tp)} are real and ${int(fp)} are false alarms. This is arithmetic on the numbers you entered, not medical advice.`,
      steps,
      chart: {
        type: 'bar' as const,
        title: 'Positive results per 10,000 people',
        categories: ['True positives', 'False positives'],
        series: [{ name: 'People', values: [+tp.toFixed(2), +fp.toFixed(2)] }],
        format: { format: 'number' as const },
        highlight: tp >= fp ? 0 : 1,
      },
    };
  },
  content: {
    formula: [
      'P(condition | positive) = s × p ÷ (s × p + f × (1 − p))',
      'P(condition | negative) = (1 − s) × p ÷ ((1 − s) × p + (1 − f) × (1 − p))',
      'p = base rate, s = sensitivity (true positive rate), f = false positive rate',
    ],
    body: [
      'A positive test is not the same as having the condition. How much it tells you depends on how common the condition is. Enter the base rate, the test sensitivity and its false positive rate, and this calculator applies Bayes theorem to give the chance that a positive result is real.',
      'When a condition is rare, even a good test produces more false alarms than true hits, because the large healthy group generates many false positives. That is the base rate fallacy. The natural frequency steps (counts per 10,000 people) make the same result easier to picture than percentages. For the basics of chance see the probability calculator; for comparing outcomes see expected value; for experiments see the A/B test calculator.',
      'This is arithmetic on the numbers you provide, not medical advice. Real tests vary by person and setting, and a clinician should interpret any result. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'What is the chance I have the condition after a positive test?', a: 'It is s × p ÷ (s × p + f × (1 − p)). With a 1% base rate, 90% sensitivity and 9% false positive rate, that is 0.009 ÷ 0.0981 = 9.17%.' },
      { q: 'Why is it so low when the test is 90% sensitive?', a: 'Because the condition is rare. Per 10,000 people, 100 have it and 90 of them test positive, but 9,900 do not and 891 of them also test positive. So 90 of 981 positives, or 9.17%, are real.' },
      { q: 'What if the test is negative?', a: 'Use (1 − s) × p ÷ ((1 − s) × p + (1 − f) × (1 − p)). With the same inputs that is 0.001 ÷ 0.9019 = 0.11%, so a negative result makes the condition very unlikely.' },
      { q: 'What is the base rate fallacy?', a: 'Ignoring how common the condition is and focusing only on test accuracy. A rare condition means most positives can be false alarms even with an accurate test.' },
    ],
    sources: [],
  },
  related: ['probability', 'expected-value', 'ab-test'],
  examples: [
    // p=.01,s=.9,f=.09: pos 0.009/(0.009+0.0891)=0.009/0.0981=0.0917431; neg 0.001/(0.001+0.9009)=0.001/0.9019=0.0011088; TP 90; FP 891
    { values: { prior: 1, sens: 90, fpr: 9 }, expect: { posterior: 0.0917431, negPosterior: 0.0011088, truePos: 90, falsePos: 891 }, tolerance: 0.0001 },
    // p=.10,s=.80,f=.05: pos 0.08/(0.08+0.045)=0.64; neg 0.02/(0.02+0.855)=0.0228571; TP 800; FP 450
    { values: { prior: 10, sens: 80, fpr: 5 }, expect: { posterior: 0.64, negPosterior: 0.0228571, truePos: 800, falsePos: 450 }, tolerance: 0.0001 },
  ],
});
