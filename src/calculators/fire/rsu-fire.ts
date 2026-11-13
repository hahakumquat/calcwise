import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';
import { fiPathChart, FIRE_UPDATED, fireNumber, IN, realReturn, SOURCES, yearsMonths } from '../../lib/helpers/fire';

interface Sim {
  months: number | null;
  path: number[];
  company: number;
  total: number;
  fromSalary: number;
  fromRsu: number;
}

/** Monthly simulation of a diversified pot plus a company-stock pot. Stops at the target (or 80 years). */
function simulate(o: { spend: number; start: number; startCompany: number; salarySave: number; rsuNet: number; hold: number; vestMonths: number; rm: number; cm: number; target: number; chartYears: number }): Sim {
  let d = o.start;
  let c = o.startCompany;
  let months: number | null = d + c >= o.target ? 0 : null;
  let fromSalary = 0;
  let fromRsu = 0;
  const path = [d + c];
  let atFi = { company: c, total: d + c, fromSalary: 0, fromRsu: 0 };
  for (let m = 1; m <= Math.max(o.chartYears * 12, 80 * 12) && (months === null || m <= o.chartYears * 12); m++) {
    const fi = months !== null;
    const vest = !fi && m <= o.vestMonths ? o.rsuNet / 12 : 0;
    const save = fi ? 0 : o.salarySave / 12;
    // After FI: stop saving and start withdrawing spending, from diversified money first.
    const draw = fi ? o.spend / 12 : 0;
    d = d * (1 + o.rm) + save + vest * (1 - o.hold) - draw;
    c = c * (1 + o.cm) + vest * o.hold;
    if (d < 0) {
      c = Math.max(0, c + d);
      d = 0;
    }
    fromSalary += save;
    fromRsu += vest;
    if (months === null && d + c >= o.target) {
      months = m;
      atFi = { company: c, total: d + c, fromSalary, fromRsu };
    }
    if (m % 12 === 0 && m <= o.chartYears * 12) path.push(d + c);
  }
  return { months, path, ...atFi };
}

export default defineCalculator({
  slug: 'rsu-fire',
  title: 'RSU FIRE Calculator',
  seoTitle: 'RSU FIRE Calculator: Retire Early With Stock Comp',
  metaDescription: 'For tech workers paid in RSUs: see how vesting stock, taxes at vest and how much company stock you hold change the age you reach financial independence.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'See how RSU vests change your financial independence date, after tax, and how much company stock you would be holding.',
  keywords: ['RSU', 'RSU FIRE', 'tech FIRE', 'stock compensation retirement', 'retire early with RSUs', 'restricted stock units', 'equity compensation FIRE', 'sell RSUs'],
  inputs: [
    IN.age(30),
    { id: 'portfolio', label: 'Diversified investments today', type: 'number', prefix: '$', default: 200000, min: 0, step: 1000, info: 'Index funds, 401(k), IRA and other diversified investments. Leave out shares of your employer — enter those below.' },
    { id: 'companyStock', label: 'Company stock you hold today', type: 'number', prefix: '$', default: 0, min: 0, step: 1000, optional: true, info: 'The current value of vested employer shares you still own. Unvested RSUs are not counted until they vest.' },
    { id: 'salarySave', label: 'Savings from salary each year', type: 'number', prefix: '$', default: 30000, min: 0, step: 1000, info: 'What you invest each year from your paycheck, including 401(k) contributions and match — not counting RSUs.' },
    IN.spending(80000),
    { id: 'rsu', label: 'RSUs vesting per year', type: 'number', prefix: '$', default: 100000, min: 0, step: 5000, info: 'The yearly value of shares vesting, before tax, at today\'s share price. Include refresher grants if you expect to keep receiving them.' },
    { id: 'tax', label: 'Total tax rate on RSUs', type: 'number', suffix: '%', default: 40, min: 0, max: 70, step: 1, info: 'RSUs are taxed as ordinary income when they vest: your marginal federal rate, plus state tax, Social Security and Medicare. 35–45% is typical for high earners in high-tax states. Withholding at 22% is often too low.' },
    { id: 'hold', label: 'Share of vested stock you keep', type: 'number', suffix: '%', default: 0, min: 0, max: 100, step: 5, info: 'How much of each after-tax vest you hold as company stock. 0% means you sell at vest and invest in diversified funds — the usual advice, since you already depend on the company for your paycheck.' },
    { id: 'vestYears', label: 'Years you keep receiving RSUs', type: 'number', suffix: 'years', min: 0, max: 60, step: 1, optional: true, placeholder: 'Until FI', info: 'How long the vests continue — for example, the years left on your grant if you do not expect refreshers. Leave blank to assume they continue until you reach FI.' },
    IN.returnRate(7),
    { id: 'companyReturn', label: 'Company stock return', type: 'number', suffix: '% / yr', min: -50, step: 0.5, optional: true, placeholder: 'Same as market', info: 'Expected yearly return on your employer\'s stock, before inflation. Leave blank to use the market return. A single stock is far riskier than an index — this is a planning number, not a forecast.' },
    IN.inflation(3),
    IN.swr(4),
  ],
  outputs: [
    { id: 'fiAge', label: 'Financial independence at age', primary: true, precision: 1, suffix: 'years old', info: 'When your diversified investments plus any company stock reach your FIRE number, including RSU vests.' },
    { id: 'fiAgeNoRsu', label: 'Without RSUs', precision: 1, suffix: 'years old', info: 'When you would reach financial independence from salary savings alone. The difference shows what your stock compensation is worth to your timeline.' },
    { id: 'saved', label: 'RSUs bring FI forward by', format: 'text', info: 'How much sooner you reach financial independence because of RSU vests.' },
    { id: 'rsuNet', label: 'RSU value after tax each year', format: 'currency', precision: 0, info: 'Yearly vest value minus tax. This is what you actually have to invest.' },
    { id: 'fiNumber', label: 'Your FIRE number', format: 'currency', precision: 0, info: 'Retirement spending ÷ withdrawal rate, in today\'s dollars.' },
    { id: 'concentration', label: 'Company stock at FI', format: 'percent', precision: 1, info: 'The share of your portfolio in your employer\'s stock when you reach FI. Many advisers suggest keeping any single stock below 10–15%.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const start = num(v.portfolio) ?? 0;
    const startCompany = num(v.companyStock) ?? 0;
    const salarySave = num(v.salarySave) ?? 0;
    const spending = num(v.spending);
    const rsu = num(v.rsu) ?? 0;
    const tax = num(v.tax) ?? 0;
    const hold = Math.min(100, Math.max(0, num(v.hold) ?? 0)) / 100;
    const R = num(v.returnRate);
    const I = num(v.inflation) ?? 0;
    const swr = num(v.swr);
    if (age === null || spending === null || R === null || swr === null || swr <= 0 || tax >= 100) return { fiAge: null };
    const target = fireNumber(spending, swr);
    const real = realReturn(R, I);
    const cReal = realReturn(num(v.companyReturn) ?? R, I);
    const rm = (1 + real) ** (1 / 12) - 1;
    const cm = (1 + cReal) ** (1 / 12) - 1;
    const rsuNet = rsu * (1 - tax / 100);
    const vy = num(v.vestYears);
    const vestMonths = vy === null ? Infinity : vy * 12;
    const base = { spend: spending, start, startCompany, salarySave, hold, rm, cm, target };
    const probeA = simulate({ ...base, rsuNet, vestMonths, chartYears: 0 });
    const probeB = simulate({ ...base, rsuNet: 0, vestMonths: 0, chartYears: 0 });
    const chartYears = Math.min(60, Math.ceil(Math.max(probeA.months ?? 0, probeB.months ?? (probeA.months ?? 240) + 120) / 12) + 2);
    const a = simulate({ ...base, rsuNet, vestMonths, chartYears });
    const b = simulate({ ...base, rsuNet: 0, vestMonths: 0, chartYears });
    if (a.months === null) return { fiAge: null, fiNumber: target, rsuNet, error: 'At these numbers you would not reach financial independence within 80 years. Try lower spending or higher savings.' };
    const growth = Math.max(0, a.total - start - startCompany - a.fromSalary - a.fromRsu);
    return {
      fiAge: age + a.months / 12,
      fiAgeNoRsu: b.months === null ? null : age + b.months / 12,
      saved: b.months === null ? 'You would not reach FI without them' : yearsMonths(b.months - a.months),
      rsuNet,
      fiNumber: target,
      concentration: a.total > 0 ? a.company / a.total : 0,
      chart: [
        { ...fiPathChart({ age, series: [{ name: 'With RSUs', values: a.path }, { name: 'Salary savings only', values: b.path }], target, fiAge: age + a.months / 12 }), title: 'With and without RSUs' },
        moneyDonut('Where your FIRE money comes from', [
          { label: 'Invested today', value: start + startCompany },
          { label: 'Salary savings', value: a.fromSalary },
          { label: 'RSUs (after tax)', value: a.fromRsu },
          { label: 'Growth', value: growth },
        ]),
      ],
      steps: [
        `FIRE number = ${money(spending, 0)} ÷ ${swr}% = ${money(target, 0)}`,
        `RSUs after tax = ${money(rsu, 0)} × (1 − ${tax}%) = ${money(rsuNet, 0)} a year; ${Math.round(hold * 100)}% kept as company stock, the rest diversified`,
        `Invest ${money(salarySave + rsuNet, 0)} a year in total until FI: ${yearsMonths(a.months)} (vs ${b.months === null ? 'never' : yearsMonths(b.months)} on salary alone)`,
      ],
      note:
        hold > 0 && a.company / a.total > 0.15
          ? `About ${Math.round((a.company / a.total) * 100)}% of your portfolio would be in one company — the same one that pays your salary. A drop in the share price could hit your job and your savings at once.`
          : 'Values are in today\'s dollars and assume the share price keeps pace with your expected return. Share prices can fall; consider the "without RSUs" age your floor.',
    };
  },
  content: {
    formula: ['RSU after tax = vest value × (1 − tax rate)', 'Yearly investing = salary savings + RSU after tax', 'FIRE number = retirement spending ÷ withdrawal rate'],
    body: [
      'For many people in tech, restricted stock units are a large share of pay — sometimes more than salary. Yet most FIRE calculators only ask for a single savings number. This calculator treats RSUs separately: it taxes each vest, lets you choose how much company stock to keep, and compares your financial independence date with and without them.',
      'RSUs are taxed as ordinary income on the day they vest, at the market value of the shares. Employers usually withhold only 22% for federal tax (37% above $1 million of supplemental pay), which is often less than you actually owe. Enter your full marginal rate — federal, state, Social Security and Medicare — to see what really reaches your portfolio.',
      'The "without RSUs" line is a useful floor: it is when you would reach financial independence if the stock went nowhere or the grants stopped. The gap between the two lines is what your equity compensation is worth to your timeline.',
    ],
    sections: [
      {
        heading: 'Should you sell RSUs as soon as they vest?',
        paragraphs: [
          'A common way to think about it: if your employer paid you the same amount in cash, would you use it to buy company stock? If not, selling at vest and diversifying is consistent with that answer. Because RSUs are taxed at vest, selling immediately usually triggers little or no additional tax.',
          'Holding concentrates your risk. Your salary, your unvested grants and your held shares all depend on one company. Set the "Share of vested stock you keep" above zero to see how concentrated your portfolio would become by the time you reach FI.',
        ],
      },
      {
        heading: 'Planning around refreshers and vesting cliffs',
        paragraphs: [
          'Initial grants typically vest over four years. If you do not expect refreshers, set "Years you keep receiving RSUs" to the years left on your grant to see a more conservative date. Many people pursuing FIRE in tech treat the end of a grant as a natural moment to reassess, since leaving earlier means walking away from unvested shares.',
        ],
      },
    ],
    faq: [
      { q: 'Are RSUs taxed twice?', a: 'No. They are taxed as income when they vest. If you hold the shares and later sell for more than the vest price, only that extra gain is taxed, as a capital gain. If you sell right away, there is usually little or no further tax.' },
      { q: 'What tax rate should I enter?', a: 'Your marginal rate on extra income: federal bracket, state income tax, plus 1.45% Medicare (and 6.2% Social Security if you are under the yearly wage base). For a high earner in California this can exceed 45%. The RSU tax calculator can estimate it.' },
      { q: 'Should I count unvested RSUs in my net worth?', a: 'Most FIRE planners do not, because you lose them if you leave. This calculator only counts shares as they vest.' },
      { q: 'What if my company stock grows faster than the market?', a: 'Set a higher company stock return and keep some shares to see the effect. Remember that single stocks can also fall sharply — model a pessimistic case too.' },
    ],
    sources: [SOURCES.irs525, SOURCES.bengen],
  },
  related: ['rsu-tax', 'fire-calculator', 'fat-fire', 'coast-fire', 'take-home-pay'],
  examples: [
    { values: { age: 30, portfolio: 0, companyStock: null, salarySave: 25000, spending: 50000, rsu: 50000, tax: 50, hold: 0, vestYears: null, returnRate: 3, companyReturn: null, inflation: 3, swr: 4 }, expect: { fiAge: 55, fiAgeNoRsu: 80, rsuNet: 25000, fiNumber: 1250000 }, tolerance: 0.01 },
  ],
});
