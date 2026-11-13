import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, moneyDonut } from '../../lib/helpers/finance';
import { FIRE_UPDATED, fireNumber, IN, SOURCES } from '../../lib/helpers/fire';

const RATES = [3, 3.25, 3.5, 3.75, 4, 4.5, 5];

export default defineCalculator({
  slug: 'fire-number',
  title: 'FIRE Number Calculator',
  seoTitle: 'FIRE Number Calculator: How Much to Retire Early?',
  metaDescription: 'Work out your FIRE number — the portfolio you need to retire early — from your spending and withdrawal rate, with guaranteed income and progress tracking.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'Calculate how much you need invested to retire early, using the 4% rule or any withdrawal rate you choose.',
  keywords: ['FIRE number', '4% rule calculator', '25x rule', 'how much do I need to retire', 'retirement number', 'financial independence number'],
  popular: true,
  inputs: [
    IN.spending(60000),
    IN.swr(4),
    { id: 'income', label: 'Guaranteed retirement income', type: 'number', prefix: '$', min: 0, step: 1000, optional: true, placeholder: '0', info: 'Yearly income you will have from the first day of retirement without touching investments: a pension, rental income or an annuity. Social Security usually starts later, so only include it if you plan to retire near claiming age.' },
    { id: 'portfolio', label: 'Invested today', type: 'number', prefix: '$', min: 0, step: 1000, optional: true, placeholder: 'Optional', info: 'Your current long-term investments, to show how far along you are. Leave blank if you only want the target.' },
  ],
  outputs: [
    { id: 'fireNumber', label: 'Your FIRE number', primary: true, format: 'currency', precision: 0, info: 'The invested portfolio that supports your spending at the chosen withdrawal rate, after any guaranteed income. In today\'s dollars.' },
    { id: 'multiple', label: 'Times your yearly gap', precision: 1, suffix: '×', info: 'The FIRE number divided by the yearly amount your portfolio must cover. The 4% rule gives 25×; 3.5% gives about 28.6×.' },
    { id: 'gap', label: 'Spending your portfolio must cover', format: 'currency', precision: 0, info: 'Retirement spending minus guaranteed income: what you will withdraw from investments each year.' },
    { id: 'monthly', label: 'Monthly withdrawal', format: 'currency', precision: 0, info: 'The yearly withdrawal divided by 12 — roughly the "paycheck" your portfolio pays you.' },
    { id: 'progress', label: 'Progress so far', format: 'percent', precision: 1, info: 'Your current investments as a share of your FIRE number. Shown when you enter what you have invested.' },
    { id: 'remaining', label: 'Still to save', format: 'currency', precision: 0, info: 'How much more you need invested to reach your FIRE number, before any future growth.' },
  ],
  compute: (v) => {
    const spending = num(v.spending);
    const swr = num(v.swr);
    if (spending === null || swr === null || swr <= 0 || spending < 0) return { fireNumber: null };
    const income = num(v.income) ?? 0;
    const gap = Math.max(0, spending - income);
    const target = fireNumber(gap, swr);
    const have = num(v.portfolio);
    const charts = [
      {
        type: 'bar' as const,
        title: 'FIRE number by withdrawal rate',
        categories: RATES.map((r) => `${r}%`),
        series: [{ name: 'FIRE number', values: RATES.map((r) => fireNumber(gap, r)) }],
        format: CURRENCY,
        highlight: RATES.indexOf(swr),
      },
      ...(have !== null && target > 0 ? [moneyDonut('Progress to your FIRE number', [{ label: 'Invested', value: Math.min(have, target) }, { label: 'Still to save', value: Math.max(0, target - have) }], `${Math.min(100, Math.round((have / target) * 100))}%`, 'of the way')] : []),
    ];
    return {
      fireNumber: target,
      ...(have !== null && target > 0
        ? have >= target
          ? { tone: 'good' as const, badge: 'Fully funded' }
          : { tone: have / target >= 0.5 ? ('ok' as const) : ('warn' as const), badge: `${Math.floor((have / target) * 100)}% funded` }
        : {}),
      multiple: 100 / swr,
      gap,
      monthly: gap / 12,
      progress: have !== null && target > 0 ? have / target : null,
      remaining: have !== null ? Math.max(0, target - have) : null,
      chart: charts,
      steps: [
        ...(income ? [`Gap = ${money(spending, 0)} − ${money(income, 0)} guaranteed income = ${money(gap, 0)}`] : []),
        `FIRE number = ${money(gap, 0)} ÷ ${swr}% = ${money(gap, 0)} × ${+(100 / swr).toFixed(2)} = ${money(target, 0)}`,
      ],
      note: gap === 0 ? 'Your guaranteed income already covers your spending, so you do not need an investment portfolio to retire on these numbers.' : `At ${swr}%, every $1,000 you cut from yearly spending lowers your FIRE number by ${money(100000 / swr, 0)}.`,
    };
  },
  content: {
    formula: ['FIRE number = (annual spending − guaranteed income) ÷ withdrawal rate', '4% rule: FIRE number = 25 × annual spending'],
    body: [
      'Your FIRE number is the size of the investment portfolio that can pay for your life without a job. It comes from a single division: the yearly spending your portfolio needs to cover, divided by a withdrawal rate you are comfortable with.',
      'The 4% rule is the most famous version. Dividing by 4% is the same as multiplying by 25, so someone who spends $60,000 a year needs $1.5 million. Lower withdrawal rates mean a bigger number but more safety: at 3.5%, that same retiree needs about $1.71 million.',
      'If you will have income you can rely on from day one — a pension, a paid-off rental, an annuity — subtract it first. Only the gap needs to come from your investments, which can shrink the target dramatically.',
    ],
    sections: [
      {
        heading: 'Where the 4% rule comes from',
        paragraphs: [
          'In 1994 the financial planner William Bengen tested withdrawal strategies against US market history and found that starting at about 4% of a stock-and-bond portfolio, then raising the amount with inflation, never ran out of money within 30 years. The 1998 "Trinity study" reached a similar conclusion.',
          'Early retirees face longer horizons. Over 40–60 years, a 4% rate has failed in some historical periods, so many FIRE planners use 3.25–3.75% or keep the flexibility to trim spending after a market crash.',
        ],
      },
      {
        heading: 'How to find your retirement spending',
        paragraphs: [
          'Start from what you actually spend today, using a year of bank and card statements. Then adjust: remove costs that end at retirement (commuting, retirement contributions, a mortgage you will have paid off) and add new ones such as private health insurance and more travel.',
        ],
      },
    ],
    faq: [
      { q: 'Is my FIRE number in today\'s dollars?', a: 'Yes. If you spend $60,000 today, a $1.5 million FIRE number means $1.5 million of today\'s purchasing power. In 15 years at 3% inflation the nominal figure would be about $2.3 million.' },
      { q: 'What is the 25x rule?', a: 'It is the 4% rule turned around: 1 ÷ 4% = 25, so you need 25 times your yearly spending. At 3.5% the multiple is about 28.6, and at 3% it is about 33.3.' },
      { q: 'Should I include Social Security?', a: 'Only if you will retire close to when you can claim it. Early retirees usually have a gap of 20+ years before benefits start, so they leave it out of the FIRE number and treat it as a later safety margin.' },
      { q: 'Does my FIRE number include taxes?', a: 'Only if your spending figure does. Withdrawals from traditional 401(k)s and IRAs are taxed as income, so add your expected tax to your spending, or use the Fat FIRE calculator, which grosses spending up by a tax rate.' },
    ],
    sources: [SOURCES.bengen, SOURCES.trinity, SOURCES.ern],
  },
  related: ['fire-calculator', 'safe-withdrawal-rate', 'years-to-fi', 'lean-fire', 'fat-fire', 'net-worth'],
  examples: [
    { values: { spending: 60000, swr: 4, income: null, portfolio: null }, expect: { fireNumber: 1500000, multiple: 25 } },
    { values: { spending: 60000, swr: 4, income: 20000, portfolio: 500000 }, expect: { fireNumber: 1000000, progress: 0.5, remaining: 500000 } },
  ],
});
