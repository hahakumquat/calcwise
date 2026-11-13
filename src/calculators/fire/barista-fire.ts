import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';
import { fiPathChart, FIRE_UPDATED, fireNumber, growPath, IN, monthsToTarget, realReturn, SOURCES, yearsMonths } from '../../lib/helpers/fire';

export default defineCalculator({
  slug: 'barista-fire',
  title: 'Barista FIRE Calculator',
  seoTitle: 'Barista FIRE Calculator for Semi-Retirement',
  metaDescription: 'Barista FIRE calculator: how much you need invested if part-time work covers some of your spending, how soon you get there, and what job income you need today.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'Work out how much you need invested to semi-retire, with part-time income covering the rest of your spending.',
  keywords: ['barista FIRE', 'semi-retirement calculator', 'part-time retirement', 'semi retire', 'partial FIRE'],
  inputs: [
    IN.age(35),
    IN.portfolio(400000),
    IN.spending(60000, 'Annual spending'),
    { id: 'partTime', label: 'Part-time income (after tax)', type: 'number', prefix: '$', default: 24000, min: 0, step: 1000, info: 'What you expect to take home each year from part-time, freelance or lower-stress work once you semi-retire. Many people choose a job partly for its health insurance.' },
    IN.savings(30000),
    IN.returnRate(7),
    IN.inflation(3),
    IN.swr(4),
  ],
  outputs: [
    { id: 'baristaNumber', label: 'Barista FIRE number', primary: true, format: 'currency', precision: 0, info: 'The portfolio whose withdrawals cover the part of your spending that your part-time income does not: (spending − part-time income) ÷ withdrawal rate.' },
    { id: 'timeTo', label: 'Time to Barista FIRE', format: 'text', info: 'How long until your portfolio reaches the Barista FIRE number at your current savings.' },
    { id: 'baristaAge', label: 'Semi-retire at age', precision: 1, suffix: 'years old', info: 'Your age when you reach the Barista FIRE number and can switch to part-time work.' },
    { id: 'fullNumber', label: 'Full FIRE number', format: 'currency', precision: 0, info: 'What you would need with no part-time income at all, for comparison.' },
    { id: 'fullAge', label: 'Full FIRE at age', precision: 1, suffix: 'years old', info: 'When you would reach full financial independence if you kept saving at your current rate instead.' },
    { id: 'jobNeededNow', label: 'Part-time income needed to quit today', format: 'currency', precision: 0, info: 'The yearly job income that would let you semi-retire right now: spending minus what your current portfolio can safely provide.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const have = num(v.portfolio) ?? 0;
    const spending = num(v.spending);
    const partTime = num(v.partTime) ?? 0;
    const savings = num(v.savings) ?? 0;
    const R = num(v.returnRate);
    const I = num(v.inflation) ?? 0;
    const swr = num(v.swr);
    if (age === null || spending === null || R === null || swr === null || swr <= 0) return { baristaNumber: null };
    const real = realReturn(R, I);
    const gap = Math.max(0, spending - partTime);
    const barista = fireNumber(gap, swr);
    const full = fireNumber(spending, swr);
    const mB = monthsToTarget({ start: have, savings, real, target: barista });
    const mF = monthsToTarget({ start: have, savings, real, target: full });
    const fromPortfolioNow = (have * swr) / 100;
    const years = Math.ceil((mF ?? mB ?? 240) / 12) + 2;
    const path = growPath(have, savings, real, Math.min(70, years));
    const coverage = (portfolioPart: number) => [Math.min(spending, portfolioPart), Math.max(0, spending - portfolioPart)];
    const [fFull, jFull] = coverage(spending);
    const [fB, jB] = coverage(gap);
    const [fNow, jNow] = coverage(fromPortfolioNow);
    return {
      baristaNumber: barista,
      timeTo: mB === null ? 'Not within 80 years' : mB === 0 ? 'You are already there' : yearsMonths(mB),
      baristaAge: mB === null ? null : age + mB / 12,
      fullNumber: full,
      fullAge: mF === null ? null : age + mF / 12,
      jobNeededNow: Math.max(0, spending - fromPortfolioNow),
      chart: [
        {
          type: 'bar',
          title: 'Who pays for your spending',
          categories: ['Full FIRE', 'Barista FIRE', 'If you quit today'],
          series: [
            { name: 'Portfolio withdrawals', values: [fFull, fB, fNow] },
            { name: 'Job income', values: [jFull, jB, jNow] },
          ],
          format: CURRENCY,
          stacked: true,
        },
        {
          ...fiPathChart({ age, series: [{ name: 'Portfolio', values: path }], target: barista, targetLabel: 'Barista FIRE number', fiAge: mB === null ? null : age + mB / 12, markerLabel: mB ? `Barista at ${(age + mB / 12).toFixed(1)}` : undefined }),
          series: [{ name: 'Portfolio', values: path }, { name: 'Barista FIRE number', values: path.map(() => barista) }, { name: 'Full FIRE number', values: path.map(() => full) }],
          title: 'Barista vs full FIRE',
        },
      ],
      steps: [
        `Portfolio covers ${money(spending, 0)} − ${money(partTime, 0)} = ${money(gap, 0)} a year`,
        `Barista FIRE number = ${money(gap, 0)} ÷ ${swr}% = ${money(barista, 0)} (vs ${money(full, 0)} for full FIRE)`,
        `Today your portfolio can provide ${money(have, 0)} × ${swr}% = ${money(fromPortfolioNow, 0)} a year`,
      ],
      note: mB !== null && mF !== null && mF > mB ? `Part-time work brings your semi-retirement forward by about ${yearsMonths(mF - mB)} compared with waiting for full FIRE.` : undefined,
    };
  },
  content: {
    formula: ['Barista FIRE number = (annual spending − part-time income) ÷ withdrawal rate', 'Part-time income needed today = spending − portfolio × withdrawal rate'],
    body: [
      'Barista FIRE is a middle path between full-time work and full retirement. Your investments cover part of your living costs and a part-time or lower-stress job covers the rest. The name comes from the idea of taking a coffee-shop job partly for its benefits, but any flexible work counts — consulting, seasonal work, teaching, a passion project that earns a little.',
      'Because your portfolio only has to fund the gap, the target is much smaller than a full FIRE number. Earning $24,000 a year part-time removes $600,000 from the portfolio you need at a 4% withdrawal rate. That often brings semi-retirement years forward.',
      'The bar chart shows how your spending is split between portfolio withdrawals and job income for full FIRE, Barista FIRE, and if you quit your current job today. The line chart shows when your portfolio reaches each target.',
    ],
    sections: [
      {
        heading: 'Health insurance and Barista FIRE',
        paragraphs: [
          'In the US, health insurance is one of the biggest costs for anyone retiring before Medicare at 65. Some part-time jobs offer health coverage, which is why Barista FIRE is popular. If yours will not, include a marketplace plan in your spending; premium subsidies depend on your income, which is often low in semi-retirement.',
        ],
      },
      {
        heading: 'Is Barista FIRE right for you?',
        paragraphs: [
          'It suits people who want out of a demanding career sooner but are happy to keep working in some form. It is also a safer early retirement: a little earned income in the first years after you leave full-time work protects your portfolio from selling during a market downturn.',
        ],
      },
    ],
    faq: [
      { q: 'How is Barista FIRE different from Coast FIRE?', a: 'With Barista FIRE you start withdrawing from your portfolio and work part-time to cover the rest. With Coast FIRE you do not withdraw anything: your job covers all your spending while your investments grow untouched.' },
      { q: 'How much part-time income do I need?', a: 'Your spending minus what your portfolio can safely provide. With $400,000 invested at a 4% withdrawal rate, the portfolio covers $16,000 a year, so $60,000 of spending would need $44,000 of job income. The calculator shows this as "Part-time income needed to quit today".' },
      { q: 'Does part-time income need to last forever?', a: 'Not necessarily. Many people work part-time until their portfolio grows to a full FIRE number or until Social Security starts. Recalculate as your portfolio grows to see how much less you need to earn.' },
      { q: 'Should I keep saving after I semi-retire?', a: 'The calculator assumes you stop adding money once you switch to part-time work. Any surplus you invest is a bonus that moves you towards full FIRE.' },
    ],
    sources: [SOURCES.bengen, SOURCES.aca],
  },
  related: ['coast-fire', 'fire-calculator', 'fire-number', 'how-long-will-money-last', 'salary-to-hourly'],
  examples: [{ values: { age: 35, portfolio: 400000, spending: 60000, partTime: 20000, savings: 0, returnRate: 7, inflation: 3, swr: 4 }, expect: { baristaNumber: 1000000, fullNumber: 1500000, jobNeededNow: 44000 } }],
});
