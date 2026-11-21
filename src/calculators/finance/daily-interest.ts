import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'daily-interest',
  title: 'Daily Interest Calculator',
  category: 'finance',
  description: 'See how much interest a balance costs per day, per month and per year from its APR. Works for credit cards, loans and savings, on a 365 or 360-day basis.',
  keywords: ['daily interest calculator', 'how much interest per day', 'credit card daily interest', 'daily periodic rate', 'apr to daily rate', 'interest per day on balance'],
  updated: '2026-11-21',
  inputs: [
    { id: 'balance', label: 'Balance', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, info: 'The amount that is accruing interest.' },
    { id: 'apr', label: 'Interest rate (APR)', type: 'number', suffix: '%', default: 24, min: 0, step: 0.1, info: 'The yearly rate on your statement or agreement.' },
    {
      id: 'basis', label: 'Day-count basis', type: 'select', segmented: true, default: '365',
      options: [{ value: '365', label: '365 days' }, { value: '360', label: '360 days' }],
      info: 'Most credit cards divide the APR by 365. Some loans use 360. Your agreement says which.',
    },
  ],
  outputs: [
    { id: 'perDay', label: 'Interest per day', format: 'currency', primary: true, info: 'Balance × APR ÷ day-count basis.' },
    { id: 'perMonth', label: 'Interest per month', format: 'currency', info: 'Per-day interest × 365 ÷ 12 (about 30.42 days), on either basis.' },
    { id: 'perYear', label: 'Interest per year (simple)', format: 'currency', info: 'Balance × APR, with no compounding and a constant balance.' },
    { id: 'dailyRate', label: 'Daily rate', format: 'percent', precision: 4, info: 'APR ÷ day-count basis.' },
  ],
  compute: (v) => {
    const b = num(v.balance), apr = num(v.apr);
    const basis = Number(v.basis) === 360 ? 360 : 365;
    if (b === null || apr === null) return { perDay: null, note: 'Enter a balance and an APR.' };
    if (b < 0 || apr < 0) return { perDay: null, error: 'Balance and APR cannot be negative.' };
    const rate = apr / 100 / basis;
    const perDay = b * rate;
    const perMonth = perDay * 365 / 12;
    const perYear = b * apr / 100;
    const x = Array.from({ length: 13 }, (_, i) => i);
    const extra = basis === 360 ? ` On a 360-day basis a full 365 days is charged, so a year of daily accrual comes to ${usd(perDay * 365)}.` : '';
    return {
      perDay,
      perMonth,
      perYear,
      dailyRate: rate,
      tone: 'ok',
      badge: `${usd(perDay)} a day`,
      chart: {
        type: 'area',
        title: 'Interest building up over 12 months (balance unchanged)',
        x,
        xLabel: 'Months',
        yFormat: { format: 'currency' },
        series: [{ name: 'Interest so far', values: x.map((i) => perMonth * i) }],
      },
      steps: [
        `Daily rate = ${apr}% ÷ ${basis} = ${(rate * 100).toFixed(6)}%`,
        `Per day = ${usd(b)} × ${(rate * 100).toFixed(6)}% = ${usd(perDay)}`,
        `Per month = ${usd(perDay)} × 365 ÷ 12 = ${usd(perMonth)}`,
        `Per year (simple) = ${usd(b)} × ${apr}% = ${usd(perYear)}`,
      ],
      note: `That is about ${usd(perDay)} every day this balance stays put.${extra} Real figures differ if interest compounds or your balance changes. Your card or loan agreement is the authority.`,
    };
  },
  content: {
    formula: [
      'Daily rate = APR ÷ 365 (or 360)',
      'Interest per day = balance × daily rate',
      'Interest per month = interest per day × 365 ÷ 12',
      'Interest per year (simple) = balance × APR',
    ],
    body: [
      'Most card and loan interest is worked out daily. The lender turns your yearly rate into a daily rate, multiplies it by the balance, and adds the result up over the billing period. This calculator shows that daily figure so the APR feels less abstract.',
      'It assumes a constant balance and simple interest. In reality, many cards compound daily, so interest is charged on earlier interest, and your balance moves as you spend and pay. Both make the real total a little different from the figures here.',
      'Day-count basis matters slightly. Dividing by 360 instead of 365 gives a bigger daily amount, because the same yearly rate is spread over fewer days. The monthly figure uses 365 ÷ 12 days on both bases.',
      'Treat the result as an estimate. Your card or loan agreement and statement are the authority on how interest is calculated. To plan a payoff, use the credit card payoff calculator. To compare rates, see the APR calculator.',
    ],
    faq: [
      { q: 'How much interest does $5,000 at 24% APR cost per day?', a: 'On a 365-day basis the daily rate is 24% ÷ 365 = 0.0658%, so interest is $5,000 × 0.000657534 = $3.29 a day. That is about $100.00 a month and $1,200 a year before compounding.' },
      { q: 'What changes on a 360-day basis?', a: 'The same $5,000 at 24% gives $5,000 × 0.24 ÷ 360 = $3.33 a day. Spreading the rate over fewer days makes each day cost slightly more.' },
      { q: 'Why does my statement show a different amount?', a: 'Many cards compound daily and your balance changes as you spend and pay. Both change the real figure. The agreement and statement from your lender are the authority.' },
      { q: 'How is the monthly figure worked out?', a: 'Interest per day × 365 ÷ 12, which is about 30.42 days. It is used on both bases so months are comparable.' },
    ],
    sources: [
      { label: 'Annual percentage rate (Investopedia)', url: 'https://www.investopedia.com/terms/a/apr.asp' },
    ],
  },
  related: ['credit-card-payoff', 'apr', 'simple-interest', 'compound-interest'],
  examples: [
    // 5000 x 0.24 / 365 = 3.287671; x 365/12 = 100.00; year 1200; rate 0.24/365 = 0.00065753
    { values: { balance: 5000, apr: 24, basis: '365' }, expect: { perDay: 3.287671, perMonth: 100, perYear: 1200, dailyRate: 0.000657534 }, tolerance: 1e-6 },
    // 5000 x 0.24 / 360 = 3.333333; x 365/12 = 101.388889; year still 1200
    { values: { balance: 5000, apr: 24, basis: '360' }, expect: { perDay: 3.333333, perMonth: 101.388889, perYear: 1200 }, tolerance: 1e-6 },
    // 1000 x 0.1825 / 365 = 0.5; month 0.5 x 365/12 = 15.208333; year 182.5
    { values: { balance: 1000, apr: 18.25, basis: '365' }, expect: { perDay: 0.5, perMonth: 15.208333, perYear: 182.5 }, tolerance: 1e-6 },
  ],
});
