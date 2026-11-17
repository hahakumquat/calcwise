import { defineCalculator } from '../../lib/types';
import { sum } from '../../lib/math';
import { fmt, nums } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'weighted-mean',
  title: 'Weighted Mean Calculator',
  category: 'statistics',
  description: 'Find the weighted mean (weighted average) of a list of values and their weights, and compare it with the ordinary mean. Shows the working.',
  keywords: ['weighted mean calculator', 'weighted average calculator', 'how to calculate weighted average', 'weighted average formula', 'average with weights'],
  inputs: [
    { id: 'values', label: 'Values', type: 'list', default: '90, 80, 70', placeholder: 'Numbers separated by commas, spaces or new lines', info: 'The numbers you want to average, in order, such as scores or prices.' },
    { id: 'weights', label: 'Weights', type: 'list', default: '50, 30, 20', placeholder: 'One weight per value', help: 'Same number of weights as values, in the same order.', info: 'How much each value counts. Weights can be percentages, counts or any positive numbers; they do not need to add to 100.' },
  ],
  outputs: [
    { id: 'wmean', label: 'Weighted mean', format: 'number', precision: 4, primary: true, info: 'Sum of (value × weight) divided by the sum of the weights.' },
    { id: 'plain', label: 'Ordinary mean', format: 'number', precision: 4, info: 'The plain average with every value counting equally, for comparison.' },
    { id: 'wsum', label: 'Sum of weights', format: 'number', precision: 4, info: 'All the weights added up.' },
    { id: 'count', label: 'Number of values', format: 'integer', info: 'How many value and weight pairs were used.' },
  ],
  compute: (v) => {
    const xs = nums(v.values);
    const ws = nums(v.weights);
    if (!xs.length || !ws.length) return { wmean: null };
    if (xs.length !== ws.length) return { wmean: null, error: `You entered ${xs.length} values but ${ws.length} weights. They need to match.` };
    if (ws.some((w) => w < 0)) return { wmean: null, error: 'Weights cannot be negative.' };
    const wsum = sum(ws);
    if (wsum <= 0) return { wmean: null, error: 'The weights must add up to more than 0.' };
    const weighted = sum(xs.map((x, i) => x * ws[i]));
    const wmean = weighted / wsum;
    const plain = sum(xs) / xs.length;
    const shown = xs.slice(0, 12);
    return {
      wmean,
      plain,
      wsum,
      count: xs.length,
      chart: {
        type: 'bar',
        title: 'Weighted mean vs ordinary mean',
        categories: ['Weighted mean', 'Ordinary mean'],
        series: [{ name: 'Average', values: [wmean, plain] }],
        format: { format: 'number', precision: 2 },
        highlight: 0,
      },
      steps: [
        `Sum of value × weight = ${shown.map((x, i) => `${fmt(x)}×${fmt(ws[i])}`).join(' + ')}${xs.length > 12 ? ' + …' : ''} = ${fmt(weighted)}`,
        `Sum of weights = ${fmt(wsum)}`,
        `Weighted mean = ${fmt(weighted)} ÷ ${fmt(wsum)} = ${fmt(wmean)}`,
      ],
    };
  },
  content: {
    formula: ['Weighted mean = Σ(value × weight) ÷ Σ(weight)'],
    body: [
      'A weighted mean is an average where some numbers count more than others. A course grade is the usual example: an exam worth 50% matters more than homework worth 20%.',
      'Say you score 90, 80 and 70 on parts weighted 50, 30 and 20. Multiply each score by its weight: 4,500 + 2,400 + 1,400 = 8,300. Divide by the total weight, 100, to get 83. The ordinary mean of 90, 80 and 70 is 80, so the weights pull the result up because the highest score counts the most.',
      'The weights do not have to add up to 100. The calculator divides by their sum, so counts, hours or percentages all work. Each value needs exactly one weight, and weights cannot be negative.',
    ],
    faq: [
      { q: 'How do you calculate a weighted average?', a: 'Multiply each value by its weight, add the results, then divide by the sum of the weights. For 90, 80, 70 with weights 50, 30, 20 the answer is 8,300 ÷ 100 = 83.' },
      { q: 'Do the weights have to add up to 100?', a: 'No. The calculator divides by the total of the weights, so any positive numbers work.' },
      { q: 'What if all the weights are equal?', a: 'Then the weighted mean is the same as the ordinary mean.' },
    ],
  },
  related: ['mean-median-mode', 'weighted-grade', 'standard-deviation'],
  examples: [
    { values: { values: [90, 80, 70], weights: [50, 30, 20] }, expect: { wmean: 83, plain: 80, wsum: 100, count: 3 }, tolerance: 1e-9 },
    { values: { values: [2, 4, 6], weights: [1, 1, 1] }, expect: { wmean: 4, plain: 4 }, tolerance: 1e-9 },
  ],
});
