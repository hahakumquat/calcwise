import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';
import { FIRE_UPDATED, fireNumber, fireStep, growPath, IN, realReturn, realStep, SOURCES } from '../../lib/helpers/fire';

export default defineCalculator({
  slug: 'coast-fire',
  title: 'Coast FIRE Calculator',
  seoTitle: 'Coast FIRE Calculator: Can I Stop Saving Now?',
  metaDescription: 'Find your Coast FIRE number — the amount that grows to a full retirement on its own — see if you have hit it, and the age you will if you keep investing.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'See whether you have saved enough to stop investing and still retire on time, and when you will reach Coast FIRE.',
  keywords: ['coast FIRE', 'coastFI', 'coast FIRE number', 'stop saving for retirement', 'coasting to retirement'],
  popular: true,
  inputs: [
    IN.age(30),
    { id: 'retireAge', label: 'Full retirement age', type: 'number', suffix: 'years', default: 60, min: 0, max: 100, step: 1, info: 'The age you want your portfolio to fully support you. Coast FIRE means you stop adding money and let growth carry you to this age.' },
    IN.portfolio(150000),
    IN.spending(40000),
    { id: 'monthly', label: 'Monthly investing until you coast', type: 'number', prefix: '$', default: 1500, min: 0, step: 50, optional: true, info: 'What you invest each month for now. Used to find the age you reach your Coast FIRE number and can stop.' },
    IN.returnRate(7),
    IN.inflation(3),
    IN.swr(4),
  ],
  outputs: [
    { id: 'coastNumber', label: 'Coast FIRE number today', primary: true, format: 'currency', precision: 0, info: 'The amount you need invested today so that, with no more contributions, growth alone reaches your full FIRE number by your retirement age.' },
    { id: 'status', label: 'Status', format: 'text', info: 'Whether your current investments already meet today\'s Coast FIRE number.' },
    { id: 'gap', label: 'Still needed to coast', format: 'currency', precision: 0, info: 'Coast FIRE number minus what you have invested. Zero means you can stop saving for retirement today.' },
    { id: 'coastAge', label: 'You reach Coast FIRE at age', precision: 1, suffix: 'years old', info: 'The age your portfolio, plus your monthly investing, first meets the Coast FIRE number for that age. After this you only need to cover your current spending.' },
    { id: 'fiNumber', label: 'Full FIRE number at retirement', format: 'currency', precision: 0, info: 'The portfolio you need at your retirement age: retirement spending ÷ withdrawal rate, in today\'s dollars.' },
    { id: 'projected', label: 'Projected at retirement if you stop now', format: 'currency', precision: 0, info: 'What your current investments grow to by retirement age with no further contributions, in today\'s dollars.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const retireAge = num(v.retireAge);
    const have = num(v.portfolio) ?? 0;
    const spending = num(v.spending);
    const R = num(v.returnRate);
    const I = num(v.inflation) ?? 0;
    const swr = num(v.swr);
    if (age === null || retireAge === null || spending === null || R === null || swr === null || swr <= 0) return { coastNumber: null };
    const n = Math.round(retireAge - age);
    if (n <= 0) return { coastNumber: null, error: 'Retirement age must be greater than your current age.' };
    const real = realReturn(R, I);
    const fi = fireNumber(spending, swr);
    const need = (a: number) => fi / (1 + real) ** (retireAge - a);
    const coast = need(age);
    const projected = have * (1 + real) ** n;
    const monthly = num(v.monthly) ?? 0;
    const path = growPath(have, monthly * 12, real, n);
    // First age where the contributing portfolio meets the coast requirement for that age (monthly resolution).
    let coastAge: number | null = null;
    if (have >= coast) coastAge = age;
    else if (monthly > 0) {
      const rm = (1 + real) ** (1 / 12) - 1;
      let b = have;
      for (let m = 1; m <= n * 12; m++) {
        b = b * (1 + rm) + monthly;
        if (b >= need(age + m / 12)) {
          coastAge = age + m / 12;
          break;
        }
      }
    }
    const ages = Array.from({ length: n + 1 }, (_, i) => age + i);
    const reached = have >= coast;
    return {
      coastNumber: coast,
      tone: reached ? 'good' : have / coast >= 0.75 ? 'ok' : 'warn',
      badge: reached ? 'Coast FIRE reached' : `${Math.round((have / coast) * 100)}% of the way to Coast FIRE`,
      status: reached ? 'You have reached Coast FIRE' : `${Math.round((have / coast) * 100)}% of the way there`,
      gap: Math.max(0, coast - have),
      coastAge,
      fiNumber: fi,
      projected,
      chart: [
        {
          type: 'line',
          title: 'Coast FIRE number vs your portfolio',
          x: ages,
          xLabel: 'Age',
          yFormat: CURRENCY,
          series: [
            { name: 'Coast FIRE number', values: ages.map(need) },
            { name: 'Keep investing', values: path },
            { name: 'Stop investing now', values: ages.map((a) => have * (1 + real) ** (a - age)) },
          ],
          markers: coastAge !== null && coastAge > age ? [{ x: Math.round(coastAge * 10) / 10, label: `Coast at ${coastAge.toFixed(1)}` }] : [],
        },
        {
          type: 'bar',
          title: 'At retirement age',
          categories: ['Needed', 'Stop now', 'Keep investing'],
          series: [{ name: 'Portfolio', values: [fi, projected, path[path.length - 1]] }],
          format: CURRENCY,
          highlight: 1,
        },
      ],
      steps: [
        fireStep(spending, swr, fi),
        realStep(R, I, real),
        `Coast FIRE number = ${money(fi, 0)} ÷ (1 + ${(real * 100).toFixed(2)}%)^${n} = ${money(coast, 0)}`,
        `Your ${money(have, 0)} grows to ${money(projected, 0)} by ${retireAge} with no more contributions`,
      ],
      note: reached
        ? `You could stop retirement saving today and still reach ${money(fi, 0)} by ${retireAge}, as long as you earn enough to cover your spending until then.`
        : coastAge !== null
          ? `Keep investing ${money(monthly, 0)} a month until about age ${coastAge.toFixed(1)}, then you can coast.`
          : monthly > 0
            ? `At ${money(monthly, 0)} a month you would not reach Coast FIRE before ${retireAge}. Investing more, or a later retirement age, closes the gap.`
            : 'Add a monthly investment amount to see when you will reach Coast FIRE.',
    };
  },
  content: {
    formula: ['FIRE number = retirement spending ÷ withdrawal rate', 'Coast FIRE number = FIRE number ÷ (1 + real return)^(years to retirement)'],
    body: [
      'Coast FIRE is the point where you have invested enough that you never need to add another dollar for retirement. Compounding takes your current portfolio the rest of the way to your full FIRE number by the age you choose. From then on you only need to earn enough to pay your bills.',
      'The Coast FIRE number is your full FIRE number, discounted back to today at your real return. The younger you are, the smaller it is: a 25-year-old aiming to retire at 60 needs far less invested than a 45-year-old with the same goal, because the money has 35 years to grow instead of 15.',
      'The chart shows how the requirement rises each year — the curve climbs because there is less time left to compound — alongside your portfolio if you keep investing and if you stop today. Where your portfolio crosses the curve, you can coast.',
    ],
    sections: [
      {
        heading: 'Coast FIRE vs Barista FIRE',
        paragraphs: [
          'Both involve working after you have built a large portfolio, but in different ways. With Coast FIRE you do not touch your investments at all — your job covers all your spending until retirement age. With Barista FIRE you start withdrawing early and work part-time to cover only the shortfall.',
          'Coast FIRE suits people who like their work but want the freedom to switch to a lower-paying, lower-stress job, take a sabbatical, or go part-time without derailing retirement.',
        ],
      },
      {
        heading: 'Risks to keep in mind',
        paragraphs: [
          'Coasting puts more weight on future returns. A poor decade of markets right after you stop contributing can leave you short at retirement age, so build in a margin — use a lower expected return or keep investing a little after you reach the number.',
        ],
      },
    ],
    faq: [
      { q: 'What does "coasting" actually mean?', a: 'You stop saving for retirement and spend everything you earn. Your existing investments stay invested and grow on their own. You still need income to cover today\'s living costs.' },
      { q: 'What retirement age should I use?', a: 'Use the age you would like full financial independence. Traditional plans use 60–67; using an earlier age makes Coast FIRE harder to reach because there is less time to compound.' },
      { q: 'Is the Coast FIRE number in today\'s dollars?', a: 'Yes. The calculator uses your real return (return minus inflation), so every figure is in today\'s purchasing power.' },
      { q: 'Should I count retirement accounts I cannot touch until 59½?', a: 'Yes — Coast FIRE is about reaching your goal by a traditional retirement age, when those accounts are available without penalty.' },
    ],
    sources: [SOURCES.bengen, SOURCES.trinity],
  },
  related: ['fire-calculator', 'barista-fire', 'fire-number', 'compound-interest', 'retirement'],
  examples: [
    { values: { age: 30, retireAge: 60, portfolio: 0, spending: 40000, monthly: null, returnRate: 3, inflation: 3, swr: 4 }, expect: { coastNumber: 1000000, fiNumber: 1000000 }, tolerance: 0.01 },
    { values: { age: 30, retireAge: 31, portfolio: 1000000, spending: 40000, monthly: null, returnRate: 3, inflation: 3, swr: 4 }, expect: { coastAge: 30, gap: 0, status: 'You have reached Coast FIRE' }, tolerance: 0.01 },
  ],
});
