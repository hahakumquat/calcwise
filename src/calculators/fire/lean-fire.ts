import { defineCalculator, type NumberInput } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';
import { fiPathChart, FIRE_UPDATED, fireNumber, growPath, IN, monthsToTarget, realReturn, SOURCES, yearsMonths } from '../../lib/helpers/fire';

const budget = (id: string, label: string, d: number, info: string): NumberInput => ({ id, label, type: 'number', prefix: '$', suffix: '/ yr', default: d, min: 0, step: 500, info });

const LINES = [
  ['housing', 'Housing'],
  ['food', 'Food'],
  ['health', 'Health care'],
  ['transport', 'Transport'],
  ['other', 'Everything else'],
] as const;

export default defineCalculator({
  slug: 'lean-fire',
  title: 'Lean FIRE Calculator',
  seoTitle: 'Lean FIRE Calculator: Retire Early on a Budget',
  metaDescription: 'Lean FIRE calculator: build a frugal retirement budget line by line, get your Lean FIRE number and see how many years until you can retire on it.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'Build a frugal retirement budget, see the portfolio it needs, and find out how soon you could retire on it.',
  keywords: ['lean FIRE', 'frugal retirement', 'retire early on a budget', 'minimalist retirement', 'lean FI'],
  inputs: [
    budget('housing', 'Housing', 14000, 'Rent or mortgage, property tax, home insurance and utilities for a year. A paid-off home makes Lean FIRE far easier.'),
    budget('food', 'Food', 6000, 'Groceries and eating out for a year.'),
    budget('health', 'Health care', 6000, 'Insurance premiums plus expected out-of-pocket costs. Before 65 you buy your own coverage; marketplace subsidies can make it much cheaper on a low retirement income.'),
    budget('transport', 'Transport', 3000, 'Car costs (insurance, fuel, maintenance, eventual replacement) or transit passes.'),
    budget('other', 'Everything else', 7000, 'Phone, internet, clothing, travel, hobbies, gifts and a buffer for surprises.'),
    IN.age(28),
    IN.portfolio(80000),
    IN.savings(35000),
    IN.returnRate(7),
    IN.inflation(3),
    IN.swr(4),
  ],
  outputs: [
    { id: 'leanNumber', label: 'Lean FIRE number', primary: true, format: 'currency', precision: 0, info: 'The portfolio that covers your lean budget at the chosen withdrawal rate, in today\'s dollars.' },
    { id: 'spending', label: 'Annual budget', format: 'currency', precision: 0, info: 'The total of your budget lines: what you would spend each year in retirement.' },
    { id: 'monthly', label: 'Monthly budget', format: 'currency', precision: 0, info: 'Your yearly budget divided by 12.' },
    { id: 'tier', label: 'FIRE style', format: 'text', info: 'A rough label used in the FIRE community: Lean under about $40,000 a year, regular FIRE up to about $100,000, Fat FIRE above that.' },
    { id: 'timeTo', label: 'Time to Lean FIRE', format: 'text', info: 'How long until your portfolio reaches the Lean FIRE number at your current savings.' },
    { id: 'leanAge', label: 'Lean FIRE at age', precision: 1, suffix: 'years old', info: 'Your age when your portfolio reaches the Lean FIRE number.' },
  ],
  compute: (v) => {
    const parts = LINES.map(([id, label]) => ({ label, value: Math.max(0, num(v[id]) ?? 0) }));
    const spending = parts.reduce((a, p) => a + p.value, 0);
    const age = num(v.age);
    const have = num(v.portfolio) ?? 0;
    const savings = num(v.savings) ?? 0;
    const R = num(v.returnRate);
    const I = num(v.inflation) ?? 0;
    const swr = num(v.swr);
    if (age === null || R === null || swr === null || swr <= 0) return { leanNumber: null };
    const real = realReturn(R, I);
    const target = fireNumber(spending, swr);
    const m = monthsToTarget({ start: have, savings, real, target });
    const years = Math.min(70, Math.ceil((m ?? 240) / 12) + 3);
    return {
      leanNumber: target,
      spending,
      monthly: spending / 12,
      tier: spending < 40000 ? 'Lean FIRE' : spending <= 100000 ? 'Regular FIRE (above a typical lean budget)' : 'Fat FIRE',
      timeTo: m === null ? 'Not within 80 years' : m === 0 ? 'You are already there' : yearsMonths(m),
      leanAge: m === null ? null : age + m / 12,
      chart: [
        moneyDonut('Your lean budget', parts, money(spending / 12, 0), 'a month'),
        fiPathChart({ age, series: [{ name: 'Portfolio', values: growPath(have, savings, real, years) }], target, targetLabel: 'Lean FIRE number', fiAge: m === null ? null : age + m / 12 }),
      ],
      steps: [`Budget = ${parts.map((p) => money(p.value, 0)).join(' + ')} = ${money(spending, 0)} a year`, `Lean FIRE number = ${money(spending, 0)} ÷ ${swr}% = ${money(target, 0)}`],
      note: spending >= 40000 ? 'This budget is above what most people call Lean FIRE. That is fine — it just means a bigger target; see the FIRE calculator.' : `Every $100 a month you trim lowers your Lean FIRE number by ${money(120000 / swr, 0)}.`,
    };
  },
  content: {
    formula: ['Annual budget = housing + food + health care + transport + everything else', 'Lean FIRE number = annual budget ÷ withdrawal rate'],
    body: [
      'Lean FIRE means reaching financial independence on a deliberately modest budget — commonly under about $40,000 a year for a household. A smaller budget means a smaller target, so Lean FIRE can be reached years or decades sooner than a conventional retirement.',
      'Because there is less slack in a lean budget, it pays to build it line by line rather than guess. This calculator adds up housing, food, health care, transport and everything else, shows the split, and turns the total into a Lean FIRE number and a date.',
      'Small changes have outsized effects. At a 4% withdrawal rate, trimming $100 a month from your budget lowers the portfolio you need by $30,000 — often the equivalent of a year of saving.',
    ],
    sections: [
      {
        heading: 'Making Lean FIRE resilient',
        paragraphs: [
          'The main risk of Lean FIRE is that unexpected costs — a car, a medical bill, a rent increase — have nowhere to go. Common safeguards include a slightly lower withdrawal rate, a separate cash buffer, keeping some optional spending you could cut, and the willingness to earn a little income in bad years.',
          'Geography matters more than almost anything. Housing and health care costs vary hugely by region, and some lean FIRE retirees move to lower-cost areas or abroad to make the numbers work.',
        ],
      },
      {
        heading: 'Lean FIRE vs Fat FIRE',
        paragraphs: [
          'The difference is the lifestyle you fund. Lean FIRE trades spending for time — you retire sooner on less. Fat FIRE trades time for comfort — you work longer to fund a generous budget. Many people aim for something in between, or reach Lean FIRE first and keep working part-time.',
        ],
      },
    ],
    faq: [
      { q: 'What counts as Lean FIRE?', a: 'There is no official cut-off. In the FIRE community, Lean FIRE usually means spending under about $40,000 a year for a household (some use $25,000 for a single person). The calculator labels your budget so you can see where it falls.' },
      { q: 'How do I handle health insurance on Lean FIRE?', a: 'In the US, marketplace plans under the Affordable Care Act base subsidies on income. Lean FIRE retirees often have low taxable income, which can make premiums much cheaper. Include your realistic premium and out-of-pocket costs in the health care line.' },
      { q: 'Should I use a lower withdrawal rate for Lean FIRE?', a: 'It is a good idea if your budget has little room to cut. A 3.5% rate needs about 14% more money than 4% but gives more protection against bad markets early in retirement.' },
      { q: 'Is Lean FIRE realistic with kids?', a: 'Yes, but budget carefully for food, health care, activities and possibly college. Many families with children aim a little above the usual lean threshold.' },
    ],
    sources: [SOURCES.mmm, SOURCES.aca],
  },
  related: ['fat-fire', 'fire-calculator', 'fire-number', 'barista-fire', 'years-to-fi'],
  examples: [{ values: { housing: 12000, food: 6000, health: 6000, transport: 3000, other: 3000, age: 30, portfolio: 750000, savings: 0, returnRate: 7, inflation: 3, swr: 4 }, expect: { leanNumber: 750000, spending: 30000, tier: 'Lean FIRE', leanAge: 30 } }],
});
