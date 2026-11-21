import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const n1 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });

const human = (dogYears: number) => 16 * Math.log(dogYears) + 31;

export default defineCalculator({
  slug: 'dog-age-human',
  title: 'Dog Age in Human Years Calculator',
  category: 'everyday',
  description: 'Find your dog\'s age in human years using the 2020 DNA-methylation formula, and compare it with the old multiply-by-seven rule.',
  keywords: ['dog age in human years', 'dog age calculator', 'how old is my dog in human years', 'dog years calculator', 'dog age formula', 'dog years to human years'],
  updated: '2026-11-21',
  inputs: [
    { id: 'age', label: 'Your dog\'s age', type: 'number', default: 3, min: 0.5, max: 20, step: 0.5, suffix: 'years', info: 'Age in years. Use decimals for part years, for example 2.5.' },
  ],
  outputs: [
    { id: 'humanAge', label: 'Equivalent human age', format: 'number', precision: 1, primary: true, info: '16 × ln(dog age) + 31, from the 2020 study of Labrador retrievers.' },
    { id: 'sevenRule', label: 'Old "× 7" rule for comparison', format: 'number', precision: 1, info: 'Dog age times 7, the popular but less accurate rule.' },
    { id: 'gap', label: 'Difference between the two', format: 'number', precision: 1, info: 'Old rule minus the formula. Positive means the old rule overstates the age.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    if (age === null) return { humanAge: null, note: 'Enter your dog\'s age in years.' };
    if (age < 0.5 || age > 20) return { humanAge: null, error: 'Use an age between 0.5 and 20 years. The formula is not meant for very young puppies.' };
    const h = human(age);
    const seven = age * 7;
    const xs: number[] = [];
    for (let a = 1; a <= 20; a++) xs.push(a);
    return {
      humanAge: h,
      sevenRule: seven,
      gap: seven - h,
      tone: 'ok',
      badge: `About ${Math.round(h)} in human years`,
      chart: {
        type: 'line',
        title: 'Dog age vs human age (years)',
        x: xs,
        xLabel: 'Dog age',
        yLabel: 'Human age',
        yFormat: { format: 'integer' },
        series: [
          { name: 'Formula', values: xs.map(human) },
          { name: '× 7 rule', values: xs.map((a) => a * 7) },
        ],
      },
      steps: [
        `ln(${n1(age)}) = ${Math.log(age).toFixed(4)}`,
        `16 × ${Math.log(age).toFixed(4)} + 31 = ${h.toFixed(2)} human years`,
        `Old rule: ${n1(age)} × 7 = ${n1(seven)}`,
      ],
    };
  },
  content: {
    formula: ['Human age = 16 × ln(dog age) + 31', 'Old rule: human age = dog age × 7'],
    body: [
      'The old rule says one dog year equals seven human years. In 2020, researchers at the University of California San Diego compared DNA methylation, a chemical change that tracks ageing, in dogs and humans. Their formula, 16 × ln(dog age) + 31, fits that pattern much better: dogs age fast early in life, then more slowly.',
      'By the formula a one-year-old dog is about 31 in human terms, and a seven-year-old is about 62, not 49. The old rule undercounts young dogs and overcounts older ones.',
      'The study looked mostly at Labrador retrievers, so treat the answer as a fun estimate. Breed and size change how fast a dog ages, and this is not a health tool. Ask your vet about age-appropriate care.',
    ],
    faq: [
      { q: 'How old is a 3-year-old dog in human years?', a: 'About 48.6 human years by the formula, compared with 21 from the old × 7 rule.' },
      { q: 'Why is the × 7 rule wrong?', a: 'It assumes dogs age at a constant speed. Dogs mature very quickly in their first years and then age more gradually, which a logarithmic curve captures better.' },
      { q: 'Does the formula work for every breed?', a: 'It was built mainly from Labrador retrievers. Large breeds tend to age faster and small breeds slower, so use it as a rough guide.' },
      { q: 'Why can\'t I enter an age under 6 months?', a: 'The formula is fitted to dogs from about half a year up, and puppies change too fast for one curve to describe them well. The calculator starts at 0.5 years.' },
    ],
    sources: [
      { label: 'NHGRI: Researchers reframe dog-to-human aging comparisons', url: 'https://www.genome.gov/news/news-release/nhgri-researchers-reframe-dog-to-human-aging-comparisons' },
      { label: 'Wang et al., Cell Systems (2020): Quantitative translation of dog-to-human aging by conserved remodeling of the DNA methylome', url: 'https://doi.org/10.1016/j.cels.2020.06.006' },
    ],
  },
  related: ['age', 'days-until-holiday', 'time-with-loved-ones'],
  examples: [
    { values: { age: 1 }, expect: { humanAge: 31, sevenRule: 7, gap: -24 } },
    { values: { age: 3 }, expect: { humanAge: 48.57779, sevenRule: 21 } },
    { values: { age: 7 }, expect: { humanAge: 62.1346, sevenRule: 49 } },
    { values: { age: 12 }, expect: { humanAge: 70.7585, sevenRule: 84 } },
  ],
});
