import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (n: number) => '$' + fmt(n, 2);

export default defineCalculator({
  slug: 'scholarship-hourly-value',
  title: 'Scholarship Hourly Value Calculator',
  category: 'other',
  description: 'See what a scholarship application pays per hour of work, how many applications one expected win takes, and your chance of winning at least once.',
  keywords: ['scholarship hourly value', 'scholarship application worth it', 'scholarship odds calculator', 'scholarship pay per hour', 'chance of winning a scholarship', 'how many scholarships to apply for'],
  updated: '2026-11-25',
  inputs: [
    { id: 'award', label: 'Scholarship award', type: 'number', prefix: '$', default: 2000, min: 0, step: 100, info: 'The amount you would receive if you win. For a renewable award, use the amount for one year or the total you would count on.' },
    { id: 'chance', label: 'Chance of winning each one', type: 'number', suffix: '%', default: 5, min: 0.01, max: 100, step: 0.5, info: 'Your own guess, from 0.01 to 100. Large national awards often have low odds; small local ones can have better odds. It is a guess, not a published figure.' },
    { id: 'hours', label: 'Hours per application', type: 'number', suffix: 'h', default: 6, min: 0.1, step: 0.5, info: 'Time for essays, forms, requesting letters and proofreading for one application.' },
    { id: 'apps', label: 'Applications you will send', type: 'number', default: 10, min: 1, max: 200, step: 1, info: 'How many similar applications you plan to submit.' },
    { id: 'wage', label: 'Your hourly wage to compare', type: 'number', prefix: '$', suffix: '/h', min: 0, step: 0.5, optional: true, placeholder: '15', info: 'Optional. What you could earn in the same hours at a job. Leave blank to skip the comparison.' },
  ],
  outputs: [
    { id: 'perHour', label: 'Expected value per hour', format: 'currency', primary: true, info: 'Award × chance ÷ hours per application: the average pay for each hour of effort.' },
    { id: 'ev', label: 'Expected value per application', format: 'currency', info: 'Award × chance of winning. An average over many tries, not what any single application pays.' },
    { id: 'appsPerWin', label: 'Applications per expected win', format: 'number', precision: 1, info: '1 ÷ chance. The number of applications after which you would expect one win on average.' },
    { id: 'hoursPerWin', label: 'Hours per expected win', format: 'number', precision: 1, suffix: 'h', info: 'Hours per application ÷ chance.' },
    { id: 'atLeastOne', label: 'Chance of at least one win', format: 'percent', precision: 2, info: '1 − (1 − chance)^applications, assuming each application is an independent try.' },
  ],
  compute: (v) => {
    const award = num(v.award);
    const chance = num(v.chance);
    const hours = num(v.hours);
    const apps = num(v.apps);
    const wage = num(v.wage);
    if (award === null || chance === null || hours === null || apps === null) return { perHour: null };
    if (award < 0 || chance <= 0 || chance > 100 || hours <= 0 || apps < 1) return { perHour: null };
    const n = Math.round(apps);
    const p = chance / 100;
    const ev = award * p;
    const perHour = ev / hours;
    const appsPerWin = 1 / p;
    const hoursPerWin = hours / p;
    const atLeastOne = 1 - Math.pow(1 - p, n);
    const hasWage = wage !== null && wage > 0;
    const steps = [
      `Expected value = ${usd(award)} × ${fmt(chance, 2)}% = ${usd(ev)}`,
      `Per hour = ${usd(ev)} ÷ ${fmt(hours, 2)} h = ${usd(perHour)}`,
      `Applications per expected win = 1 ÷ ${fmt(p, 4)} = ${fmt(appsPerWin, 1)}`,
      `Hours per expected win = ${fmt(hours, 2)} ÷ ${fmt(p, 4)} = ${fmt(hoursPerWin, 1)} h`,
      `Chance of at least one win in ${fmt(n)} = 1 − (1 − ${fmt(p, 4)})^${fmt(n)} = ${fmt(atLeastOne * 100, 2)}%`,
    ];
    let note = `The odds are your guess and each application is treated as independent. Hours spent on a strong essay can often be reused for the next one.`;
    let tone: 'good' | 'ok' | 'warn' = 'ok';
    if (hasWage) {
      const diff = perHour - (wage as number);
      steps.push(`Versus a job: ${usd(perHour)} − ${usd(wage as number)} = ${usd(diff)} an hour`);
      tone = diff >= 0 ? 'good' : 'warn';
      note = `On average an hour of applications is worth ${usd(perHour)}, ${diff >= 0 ? 'above' : 'below'} the ${usd(wage as number)} you could earn. ` + note;
    }
    const cats: string[] = [];
    const vals: number[] = [];
    const maxN = Math.min(Math.max(n, 5), 40);
    for (let i = 1; i <= maxN; i++) { cats.push(String(i)); vals.push(1 - Math.pow(1 - p, i)); }
    return {
      perHour,
      ev,
      appsPerWin,
      hoursPerWin,
      atLeastOne,
      chart: {
        type: 'bar',
        title: 'Chance of at least one win, by number of applications',
        categories: cats,
        format: { format: 'percent', precision: 0 },
        series: [{ name: 'Chance of at least one win', values: vals }],
        highlight: Math.min(n, maxN) - 1,
      },
      steps,
      tone,
      badge: `${usd(perHour)} an hour`,
      note,
    };
  },
  content: {
    formula: [
      'Expected value = award × chance of winning',
      'Value per hour = expected value ÷ hours per application',
      'Applications per expected win = 1 ÷ chance',
      'Hours per expected win = hours per application ÷ chance',
      'Chance of at least one win = 1 − (1 − chance)^applications',
    ],
    body: [
      'A scholarship application can feel like a long shot, so it helps to put a price on the effort. Multiply the award by your chance of winning to get the average payout of one application, then divide by the hours it takes.',
      'The chance is your own guess, so try a few values. The calculator also shows how many applications one expected win takes, and the chance that at least one of your planned applications succeeds.',
      'This treats every application as independent and equally likely, which real selection committees do not guarantee. Add a wage to compare the hours with a job. Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'Reading the result',
        paragraphs: [
          'An expected value is an average over many tries. You will not receive $100 from a $2,000 award with a 5% chance: you win $2,000 or nothing. That is why the chance of at least one win matters as much as the hourly figure.',
          'Reusing an essay across applications lowers the hours for the later ones, which raises the value per hour. Enter the average hours across your batch for a fairer picture.',
        ],
      },
    ],
    faq: [
      { q: 'How is the value per hour worked out?', a: 'Multiply the award by your chance of winning, then divide by hours per application. A $2,000 award at 5% is $100.00 expected, and over 6 hours that is $16.67 an hour.' },
      { q: 'How many applications until one win?', a: 'On average, 1 ÷ chance. At 5% that is 20 applications, which at 6 hours each is 120 hours. At 2% it is 50 applications.' },
      { q: 'What is my chance of at least one win?', a: 'It is 1 − (1 − chance)^applications. With 10 applications at 5% each, that is 1 − 0.95^10 = 40.13%.' },
      { q: 'Are the odds reliable?', a: 'No. They are your guess, treated as independent for each application. Real odds depend on the number of applicants and how well you fit the criteria, so try a range.' },
    ],
    sources: [],
  },
  related: ['college-net-price', 'student-work-hours-gap', 'hours-of-work-cost', 'cost-per-class'],
  examples: [
    // EV 2000 x 0.05 = 100; per hour 100/6 = 16.6667; 1/0.05 = 20; hours 6/0.05 = 120; 1 - 0.95^10 = 0.401263
    { values: { award: 2000, chance: 5, hours: 6, apps: 10 }, expect: { ev: 100, perHour: 100 / 6, appsPerWin: 20, hoursPerWin: 120, atLeastOne: 0.4012630607616213 }, tolerance: 1e-9 },
    // EV 500 x 0.02 = 10; per hour 10/4 = 2.5; 50 apps; 4/0.02 = 200 h; 1 - 0.98^10 = 0.183046
    { values: { award: 500, chance: 2, hours: 4, apps: 10 }, expect: { ev: 10, perHour: 2.5, appsPerWin: 50, hoursPerWin: 200, atLeastOne: 0.1829271931124532 }, tolerance: 1e-9 },
  ],
});
