import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';
import { fiAgeVerdict, drawPath, fiPathChart, FIRE_UPDATED, fireNumber, fireStep, growPath, IN, monthsToTarget, realReturn, realStep, SOURCES, yearsMonths } from '../../lib/helpers/fire';

export default defineCalculator({
  slug: 'fire-calculator',
  title: 'FIRE Calculator',
  seoTitle: 'FIRE Calculator: When Can I Retire Early?',
  metaDescription: 'Free FIRE calculator: see the age you can reach financial independence from your income, spending and savings, with a year-by-year chart in today\'s dollars.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'Find the age you can reach financial independence and retire early, based on what you earn, spend and have already invested.',
  keywords: ['FIRE', 'early retirement calculator', 'financial independence calculator', 'when can I retire', 'retire early', 'FI date', 'FIRE age'],
  popular: true,
  inputs: [
    IN.age(30),
    IN.portfolio(100000),
    { id: 'income', label: 'Annual take-home income', type: 'number', prefix: '$', default: 120000, min: 0, step: 1000, info: 'Your household income after taxes. Count pre-tax 401(k) contributions and any employer match as income too, since they are part of what you save.' },
    { id: 'spendNow', label: 'Annual spending today', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, info: 'Everything you spend in a year: housing, food, insurance, travel, the lot. Income minus spending is what you save.' },
    { id: 'spendRetired', label: 'Annual spending in retirement', type: 'number', prefix: '$', min: 0, step: 1000, optional: true, placeholder: 'Same as today', info: 'What you expect to spend once you stop working, in today\'s dollars. Leave blank to assume the same as today. Remember to budget for health insurance before Medicare.' },
    IN.returnRate(7),
    IN.inflation(3),
    IN.swr(4),
    { id: 'raise', label: 'Savings growth above inflation', type: 'number', suffix: '% / yr', min: -20, max: 30, step: 0.5, optional: true, placeholder: '0', info: 'How much faster than inflation your yearly savings grow, from raises and promotions. Leave at 0 for a cautious plan.' },
  ],
  outputs: [
    { id: 'fiAge', label: 'Financial independence at age', primary: true, precision: 1, suffix: 'years old', info: 'The age at which your invested portfolio is projected to reach your FIRE number, so withdrawals can cover your spending.' },
    { id: 'timeToFi', label: 'Time to financial independence', format: 'text', info: 'How long from today until you reach your FIRE number, if you keep saving at your current rate.' },
    { id: 'fiNumber', label: 'Your FIRE number', format: 'currency', precision: 0, info: 'The portfolio you need: retirement spending divided by your withdrawal rate. At 4% that is 25 times your spending. In today\'s dollars.' },
    { id: 'savingsRate', label: 'Savings rate', format: 'percent', precision: 1, info: 'The share of your take-home income you save. It is the biggest single driver of how soon you can retire.' },
    { id: 'annualSavings', label: 'Saved each year', format: 'currency', precision: 0, info: 'Income minus spending: the amount you add to investments each year, in today\'s dollars.' },
    { id: 'nominalFi', label: 'FIRE number in future dollars', format: 'currency', precision: 0, info: 'Your FIRE number expressed in the dollars of the year you reach it, after inflation. It looks bigger but buys the same lifestyle.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const start = num(v.portfolio) ?? 0;
    const income = num(v.income);
    const spendNow = num(v.spendNow);
    const R = num(v.returnRate);
    const I = num(v.inflation) ?? 0;
    const swr = num(v.swr);
    if (age === null || income === null || spendNow === null || R === null || swr === null || swr <= 0 || start < 0) return { fiAge: null };
    const spendRet = num(v.spendRetired) ?? spendNow;
    const savings = income - spendNow;
    const real = realReturn(R, I);
    const target = fireNumber(spendRet, swr);
    const growth = (num(v.raise) ?? 0) / 100;
    const months = monthsToTarget({ start, savings: Math.max(0, savings), real, target, savingsGrowth: growth });
    const base = { fiNumber: target, savingsRate: income > 0 ? savings / income : 0, annualSavings: savings };
    if (months === null) {
      return {
        ...base,
        fiAge: null,
        error: savings <= 0 ? 'You are not saving anything yet, so your portfolio will not reach your FIRE number. Try lowering spending or raising income.' : 'At these numbers you would not reach financial independence within 80 years. Try a higher savings rate or lower retirement spending.',
      };
    }
    const years = months / 12;
    const accYears = Math.ceil(years);
    const acc = growPath(start, Math.max(0, savings), real, accYears, growth);
    const after = drawPath(acc[acc.length - 1], spendRet, real, Math.max(10, Math.min(60, 95 - Math.round(age) - accYears)));
    const path = [...acc, ...after.slice(1)];
    let contributed = 0;
    let s = Math.max(0, savings);
    for (let y = 0; y < Math.floor(years); y++, s *= 1 + growth) contributed += s;
    contributed += s * (years - Math.floor(years));
    const growthPart = Math.max(0, target - start - contributed);
    return {
      ...base,
      fiAge: age + years,
      ...fiAgeVerdict(age + years, years === 0),
      timeToFi: years === 0 ? 'You are already there' : yearsMonths(months),
      nominalFi: target * (1 + I / 100) ** years,
      chart: [
        fiPathChart({ age, series: [{ name: 'Portfolio (today\'s $)', values: path }], target, fiAge: age + years }),
        ...(years > 0 ? [moneyDonut('What gets you there', [{ label: 'Already invested', value: Math.min(start, target) }, { label: 'Your savings', value: Math.min(contributed, target) }, { label: 'Investment growth', value: growthPart }], `${Math.round((growthPart / target) * 100)}%`, 'from growth')] : []),
      ],
      steps: [
        fireStep(spendRet, swr, target),
        `Savings = ${money(income, 0)} − ${money(spendNow, 0)} = ${money(savings, 0)} a year (${((savings / income) * 100).toFixed(1)}% savings rate)`,
        realStep(R, I, real),
        `Grow ${money(start, 0)} at ${(real * 100).toFixed(2)}% real, adding ${money(Math.max(0, savings), 0)} a year, until it reaches ${money(target, 0)}: ${yearsMonths(months)}`,
      ],
      note:
        years === 0
          ? `Your portfolio already covers ${money(spendRet, 0)} a year at a ${swr}% withdrawal rate. You are financially independent on these assumptions.`
          : `After financial independence the chart keeps going: you withdraw ${money(spendRet, 0)} a year (rising with inflation) while the rest stays invested.`,
    };
  },
  content: {
    formula: ['FIRE number = annual retirement spending ÷ withdrawal rate', 'Real return = (1 + return) ÷ (1 + inflation) − 1', 'Each month: portfolio = portfolio × (1 + real return)^(1/12) + savings ÷ 12'],
    body: [
      'This FIRE calculator answers one question: at what age could you stop depending on a paycheck? It works out the portfolio you need — your FIRE number — then grows what you already have, plus what you save each year, until it gets there.',
      'Everything is in today\'s dollars. Instead of inflating your spending decade by decade, the calculator subtracts inflation from your return up front. A $60,000 lifestyle stays $60,000 on the chart, which makes the result much easier to reason about.',
      'Once you reach financial independence, the chart keeps running: it withdraws your retirement spending each year and lets the rest stay invested. With a 4% withdrawal rate and a real return just under 4%, the line drifts down slowly over decades. Real markets will make it wobble, which is why the safe withdrawal rate calculator tests thousands of market paths.',
    ],
    sections: [
      {
        heading: 'How to retire early: the three levers',
        paragraphs: [
          'Your savings rate does most of the work. Going from saving 20% to 50% of take-home pay can cut decades off your working life, because it both increases what you invest and shrinks the FIRE number you need.',
          'Retirement spending sets the finish line. Every $1,000 of yearly spending you can drop adds about $25,000 to the portfolio you need at a 4% withdrawal rate. Paying off a mortgage before you retire is a common way to lower it.',
          'Returns matter, but you do not control them. Plan with a cautious real return (3.5–5%) and treat anything better as a bonus that lets you retire sooner.',
        ],
      },
      {
        heading: 'What this FIRE calculator does not include',
        paragraphs: [
          'Social Security, pensions and inheritances are left out, which makes the result conservative; reduce your retirement spending by any guaranteed income you are confident about. Taxes on withdrawals are also not modelled — enter spending including the tax you expect to pay, or use the Fat FIRE calculator, which adds an effective tax rate.',
        ],
      },
    ],
    faq: [
      { q: 'What is a good savings rate for FIRE?', a: 'Many people pursuing FIRE save 40–70% of their take-home pay. At 50%, with a 5% real return and a 4% withdrawal rate, you could reach financial independence in roughly 17 years starting from zero.' },
      { q: 'Should I use 4% or a lower withdrawal rate?', a: 'The 4% rule was tested over 30-year retirements. If you might be retired for 40–50 years, 3.25–3.75% gives a larger margin of safety. Try both here to see how much later each one makes your date.' },
      { q: 'Should I count my home equity?', a: 'Usually not. Your home does not produce income you can spend unless you sell or rent it. Instead, make sure your retirement spending reflects whether you will still have a mortgage or rent.' },
      { q: 'Why does the portfolio shrink slowly after financial independence?', a: 'You withdraw about 4% a year while the portfolio earns a little under 4% after inflation, so the balance drifts down gradually but lasts for decades. In a real retirement, market swings will make the line bumpier.' },
    ],
    sources: [SOURCES.bengen, SOURCES.trinity, SOURCES.mmm],
  },
  related: ['fire-number', 'years-to-fi', 'coast-fire', 'safe-withdrawal-rate', 'rsu-fire', 'retirement'],
  examples: [
    { values: { age: 30, portfolio: 0, income: 100000, spendNow: 50000, spendRetired: null, returnRate: 3, inflation: 3, swr: 4, raise: null }, expect: { fiAge: 55, fiNumber: 1250000, savingsRate: 0.5 }, tolerance: 0.01 },
    { values: { age: 40, portfolio: 2000000, income: 100000, spendNow: 50000, spendRetired: null, returnRate: 7, inflation: 3, swr: 4, raise: null }, expect: { fiAge: 40, timeToFi: 'You are already there' } },
  ],
});
