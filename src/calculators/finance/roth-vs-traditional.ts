import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, LIMIT_401K, money, pct, TAX_YEAR } from '../../lib/helpers/finance';

/** Future value of a yearly contribution made at the start of each year (annuity-due). Factor per $1 contributed. */
const fvFactor = (r: number, n: number) => (r === 0 ? n : (((1 + r) ** n - 1) / r) * (1 + r));

export default defineCalculator({
  slug: 'roth-vs-traditional',
  title: 'Roth vs Traditional 401(k)/IRA Calculator',
  category: 'finance',
  description: 'Compare Roth and traditional 401(k) or IRA contributions at the same take-home cost. See which leaves you more after tax in retirement.',
  keywords: ['roth vs traditional', 'roth vs traditional 401k', 'roth vs traditional ira calculator', 'should i choose roth or traditional', 'roth 401k calculator', 'traditional 401k calculator'],
  updated: '2026-11-15',
  popular: false,
  inputs: [
    { id: 'contribution', label: 'Pre-tax contribution per year', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The amount you would put into a traditional account each year. The Roth is sized so your take-home pay drops by the same amount.' },
    { id: 'taxNow', label: 'Tax rate now (marginal)', type: 'number', suffix: '%', default: 24, min: 0, max: 60, step: 1, info: 'The federal (plus state, if you like) rate on your next dollar of income this year. This is your bracket, not your average rate.' },
    { id: 'taxRet', label: 'Expected tax rate in retirement (marginal)', type: 'number', suffix: '%', default: 22, min: 0, max: 60, step: 1, info: 'The rate you expect on the money you withdraw. Your best guess is fine; this is the number that decides the winner.' },
    { id: 'years', label: 'Years until withdrawal', type: 'number', suffix: 'years', default: 30, min: 1, max: 60, step: 1, info: 'How many yearly contributions you will make and how long the money grows.' },
    { id: 'ret', label: 'Annual return', type: 'number', suffix: '%', default: 7, min: -10, max: 30, step: 0.5, info: 'Average yearly growth before inflation, applied to both accounts equally.' },
  ],
  outputs: [
    { id: 'winner', label: 'Better choice', format: 'text', primary: true, info: 'Roth if your retirement tax rate is higher than today\'s, traditional if it is lower, a tie if equal.' },
    { id: 'difference', label: 'Advantage of the winner', format: 'currency', info: 'How much more the better account leaves you after tax, in future dollars.' },
    { id: 'rothValue', label: 'Roth after-tax value', format: 'currency', info: 'The Roth balance at withdrawal. It is tax-free, so this is also what you keep.' },
    { id: 'tradValue', label: 'Traditional after-tax value', format: 'currency', info: 'The traditional balance at withdrawal minus income tax at your retirement rate.' },
    { id: 'rothContribution', label: 'Roth contribution per year', format: 'currency', info: 'Your pre-tax amount times (1 - current rate): what the Roth gets for the same take-home cost.' },
    { id: 'breakEven', label: 'Break-even retirement rate', format: 'percent', precision: 1, info: 'The retirement tax rate at which both options tie. It equals your current rate.' },
  ],
  compute: (v) => {
    const c = num(v.contribution);
    const tn = num(v.taxNow);
    const tr = num(v.taxRet);
    const nRaw = num(v.years);
    const rp = num(v.ret);
    if (c === null || c < 0 || tn === null || tr === null || nRaw === null || rp === null) return { winner: null };
    if (tn < 0 || tn > 60 || tr < 0 || tr > 60) return { winner: null, error: 'Tax rates must be between 0% and 60%.' };
    const n = Math.floor(nRaw);
    if (n < 1 || n > 60) return { winner: null, error: 'Years must be between 1 and 60.' };
    if (rp < -10 || rp > 30) return { winner: null, error: 'Annual return must be between -10% and 30%.' };

    const r = rp / 100;
    const t1 = tn / 100;
    const t2 = tr / 100;
    const factor = fvFactor(r, n);
    const rothContribution = c * (1 - t1);
    const rothValue = rothContribution * factor;
    const tradGross = c * factor;
    const tradValue = tradGross * (1 - t2);
    const difference = Math.abs(rothValue - tradValue);
    const tie = Math.abs(rothValue - tradValue) < 0.005;

    let winner: string;
    let tone: 'good' | 'ok' | 'warn' | 'bad';
    let badge: string;
    if (tie) { winner = 'Tie'; tone = 'ok'; badge = 'Identical'; }
    else if (rothValue > tradValue) { winner = 'Roth'; tone = 'good'; badge = 'Roth wins'; }
    else { winner = 'Traditional'; tone = 'good'; badge = 'Traditional wins'; }

    const note = tie
      ? 'The two rates are equal, so Roth and traditional end up with exactly the same after-tax money. Other factors (employer match, flexibility, rate uncertainty) can break the tie.'
      : `${winner} leaves you ${money(difference, 0)} more after tax. Roth wins when your retirement rate is above your current rate (${pct(t1, 1)}); traditional wins when it is below. Estimate only, not tax advice.`;

    const steps = [
      `Growth factor per $1 contributed each year = ((1 + ${rp}%)^${n} - 1) / ${rp}% x (1 + ${rp}%) = ${factor.toFixed(4)} (contribution at the start of each year${r === 0 ? '; 0% return gives years x $1' : ''})`,
      `Traditional: ${money(c, 0)} x ${factor.toFixed(4)} = ${money(tradGross, 0)} before tax; x (1 - ${pct(t2, 1)}) = ${money(tradValue, 0)} after tax`,
      `Roth: same take-home cost, so contribute ${money(c, 0)} x (1 - ${pct(t1, 1)}) = ${money(rothContribution, 2)} per year; x ${factor.toFixed(4)} = ${money(rothValue, 0)}, tax-free`,
      tie ? 'Both are equal.' : `Difference = ${money(difference, 0)} in favour of ${winner}`,
    ];

    const x = Array.from({ length: n + 1 }, (_, k) => k);
    const f = (k: number) => fvFactor(r, k);
    const line: ChartSpec = {
      type: 'line',
      title: 'After-tax value over time',
      x,
      xLabel: 'Years',
      xFormat: { format: 'integer' },
      yLabel: 'After-tax value',
      yFormat: CURRENCY,
      series: [
        { name: 'Roth', values: x.map((k) => rothContribution * f(k)) },
        { name: 'Traditional (after tax)', values: x.map((k) => c * f(k) * (1 - t2)) },
      ],
    };

    return { winner, difference, rothValue, tradValue, rothContribution, breakEven: t1, tone, badge, note, steps, chart: line };
  },
  content: {
    formula: [
      'Growth factor = ((1 + r)^n - 1) / r x (1 + r)  (n x 1 if r = 0)',
      'Traditional after tax = contribution x factor x (1 - retirement rate)',
      'Roth = contribution x (1 - current rate) x factor',
    ],
    body: [
      'Traditional contributions come out of your pay before income tax, so they lower your tax bill today, and you pay income tax on withdrawals. Roth contributions are made with after-tax money, and qualified withdrawals are tax-free. The question is simply whether your tax rate is higher now or later.',
      'To compare fairly, this calculator holds your take-home pay constant. A $10,000 traditional contribution and a Roth contribution of $10,000 x (1 - current rate) cost you the same in lost paycheck. The traditional account is bigger, but part of it belongs to the IRS.',
      'Convention used: one contribution at the start of every year for the number of years you enter, with the return compounding annually. Both accounts earn the same return, and fees, inflation and the tax on any investment gains outside the accounts are ignored. Results are in future (not inflation-adjusted) dollars.',
    ],
    sections: [
      {
        heading: 'The rule of thumb',
        paragraphs: [
          'If the two rates are equal, Roth and traditional produce identical after-tax money, because multiplication does not care about order. Roth wins if your retirement rate is higher than your current rate. Traditional wins if it is lower. That is why the break-even retirement rate shown above is always your current rate.',
          'Rates are uncertain. Many people split between the two to hedge. If you expect to be in a lower bracket when you retire, traditional is usually the better bet; if you are early in your career and expect to earn more later, Roth often is.',
        ],
      },
      {
        heading: 'Employer match, limits and catch-up rules',
        paragraphs: [
          'An employer match is generally made pre-tax, so it goes into the traditional side of your plan even if your own contributions are Roth, and you pay tax on it at withdrawal. This calculator does not include the match.',
          `The ${TAX_YEAR} employee limit for a 401(k) is ${money(LIMIT_401K, 0)}, and it is shared between Roth and traditional contributions. Roth IRA contributions are limited by income, so higher earners may not be able to contribute directly; check the IRS rules.`,
          'Under rules taking effect in 2026, workers whose prior-year FICA wages were above $150,000 may be required to make their 401(k) catch-up contributions as Roth. Check with your plan.',
        ],
      },
      {
        heading: 'What this calculator leaves out',
        paragraphs: [
          'Roth money has no required minimum distributions in a Roth IRA, and Roth contributions can be withdrawn without tax or penalty in a Roth IRA, which adds flexibility. Traditional withdrawals can also raise how much of your Social Security is taxed and may affect Medicare premiums. None of that is modeled here.',
        ],
      },
    ],
    faq: [
      { q: 'Which is better, Roth or traditional?', a: 'It depends on your tax rate now versus in retirement. Roth is better if your retirement rate will be higher than your current rate, traditional if it will be lower, and they tie if equal. With the defaults (24% now, 22% later), traditional wins by about $20,215 over 30 years ($788,370 versus $768,155).' },
      { q: 'What happens if my tax rate is the same in retirement?', a: 'Both end up with identical after-tax money. With 24% now and 24% later, $10,000 a year for 30 years at 7% leaves about $768,155 in either account.' },
      { q: 'Why does the Roth contribution look smaller?', a: 'To keep your take-home pay the same, the Roth gets only what is left after tax. At a 24% current rate, a $10,000 pre-tax amount becomes a $7,600 Roth contribution. The smaller Roth balance is all yours, while the larger traditional balance is partly owed to the IRS.' },
      { q: 'What if I am in a lower bracket in retirement?', a: 'Traditional wins. With 24% now and 12% in retirement, traditional leaves about $889,443 versus $768,155 for Roth, a gap of roughly $121,288, because 0.88 / 0.76 is about 1.158.' },
      { q: 'Does the employer match go in the Roth or traditional account?', a: 'Employer matching contributions are generally pre-tax, so they sit in the traditional part of your plan and are taxed when withdrawn. Your own Roth contributions are separate.' },
      { q: 'Can I contribute to a Roth IRA at any income?', a: 'No. Direct Roth IRA contributions phase out at higher incomes. Roth 401(k) contributions have no income limit, though they count toward the same employee limit as traditional 401(k) contributions.' },
      { q: 'Does the return rate change the winner?', a: 'No. The winner depends only on the two tax rates, because both accounts grow at the same rate. The return only changes how large the dollar gap is.' },
    ],
    sources: [
      { label: 'IRS Publication 590-A: Contributions to Individual Retirement Arrangements', url: 'https://www.irs.gov/publications/p590a' },
      { label: 'IRS Publication 590-B: Distributions from Individual Retirement Arrangements', url: 'https://www.irs.gov/publications/p590b' },
      { label: 'IRS: 401(k) limit increases to $24,500 for 2026, IRA limit increases to $7,500', url: 'https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500' },
    ],
  },
  related: ['401k-max-out', 'take-home-pay', 'retirement', 'compound-interest'],
  examples: [
    // factor = (1.07^30 - 1)/0.07 x 1.07 = 101.07304; Roth = 7600 x 101.07304 = 768155.11; Trad = 10000 x 101.07304 x 0.76 = 768155.11
    {
      values: { contribution: 10000, taxNow: 24, taxRet: 24, years: 30, ret: 7 },
      expect: { rothValue: 768155.11, tradValue: 768155.11, difference: 0, winner: 'Tie', badge: 'Identical', rothContribution: 7600, breakEven: 0.24 },
    },
    // defaults 24 / 22: Trad = 1010730.41 x 0.78 = 788369.72; Roth 768155.11; diff 20214.61 (ratio 0.78/0.76)
    {
      values: { contribution: 10000, taxNow: 24, taxRet: 22, years: 30, ret: 7 },
      expect: { rothValue: 768155.11, tradValue: 788369.72, difference: 20214.61, winner: 'Traditional' },
    },
    // 24 / 12: Trad = 1010730.41 x 0.88 = 889442.76; ratio 0.88/0.76 = 1.1579; diff 121287.65
    {
      values: { contribution: 10000, taxNow: 24, taxRet: 12, years: 30, ret: 7 },
      expect: { tradValue: 889442.76, rothValue: 768155.11, difference: 121287.65, winner: 'Traditional', tone: 'good' },
    },
    // 0% return, 10 years: factor 10, gross 100000. Roth: 7000 x 10 = 70000. Trad: 100000 x (1 - 0.40) = 60000. Roth wins by 10000
    {
      values: { contribution: 10000, taxNow: 30, taxRet: 40, years: 10, ret: 0 },
      expect: { rothValue: 70000, tradValue: 60000, difference: 10000, winner: 'Roth', badge: 'Roth wins' },
    },
  ],
});
