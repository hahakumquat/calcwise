import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'fund-distribution-tax',
  title: 'Mutual Fund Distribution Tax Calculator',
  category: 'finance',
  description: 'See the tax you owe on a mutual fund year-end capital gains distribution, how the share price drops by the same amount, and the cost of buying late.',
  keywords: ['mutual fund distribution tax', 'capital gains distribution calculator', 'mutual fund year-end distribution', 'buying a fund before record date', 'taxable mutual fund tax', 'fund distribution cost basis'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'shares', label: 'Shares owned', type: 'number', default: 500, min: 0, step: 10, info: 'How many fund shares you hold on the record date.' },
    { id: 'nav', label: 'NAV per share before the distribution', type: 'number', prefix: '$', default: 40, min: 0, step: 0.5, info: 'The fund share price (net asset value) just before the distribution is paid.' },
    { id: 'dist', label: 'Capital gains distribution per share', type: 'number', prefix: '$', default: 2, min: 0, step: 0.25, info: 'Found on the fund company page. It is a dollar amount per share, not a percent.' },
    { id: 'rate', label: 'Federal capital gains tax rate', type: 'number', suffix: '%', default: 15, min: 0, max: 40, step: 1, info: 'Long-term distributions are taxed at 0%, 15% or 20% federally. Short-term ones are taxed at your ordinary rate. Enter the rate that applies to you.' },
    { id: 'state', label: 'State tax rate', type: 'number', suffix: '%', default: 0, min: 0, max: 15, step: 0.5, optional: true, placeholder: '0', info: 'Optional. Added to the federal rate.' },
    { id: 'timing', label: 'When did you buy?', type: 'select', default: 'held', options: [{ value: 'held', label: 'Held for a while' }, { value: 'late', label: 'Bought just before the record date' }], info: 'Everyone holding on the record date gets the same distribution and the same tax bill, however long they have owned the shares.' },
  ],
  outputs: [
    { id: 'taxOwed', label: 'Tax owed on the distribution', format: 'currency', primary: true, info: 'Total distribution times your federal plus state rate.' },
    { id: 'distribution', label: 'Total distribution', format: 'currency', info: 'Shares times distribution per share. It is taxable even if you reinvest it.' },
    { id: 'navAfter', label: 'NAV per share after', format: 'currency', info: 'NAV before minus the distribution per share. The fund pays out the gains, so its price drops by that amount.' },
    { id: 'valueBefore', label: 'Position value before', format: 'currency', info: 'Shares times NAV before.' },
    { id: 'valueAfter', label: 'Position value after', format: 'currency', info: 'Shares times NAV after. The distribution you received in cash or new shares makes up the difference.' },
    { id: 'netChange', label: 'After-tax value change', format: 'currency', info: 'Position value after plus distribution minus tax, minus value before. Always the negative of the tax, because the distribution just moves money out of the share price.' },
    { id: 'taxPct', label: 'Tax as % of position', format: 'percent', precision: 2, info: 'Tax owed divided by the position value before the distribution.' },
  ],
  compute: (v) => {
    const shares = num(v.shares);
    const nav = num(v.nav);
    const dist = num(v.dist);
    const rate = num(v.rate);
    const state = num(v.state) ?? 0;
    if (shares === null || nav === null || dist === null || rate === null) return { taxOwed: null };
    if (shares < 0 || nav <= 0 || dist < 0 || rate < 0 || state < 0) return { taxOwed: null };
    if (dist > nav) return { taxOwed: null };

    const late = v.timing === 'late';
    const distribution = shares * dist;
    const combined = rate + state;
    const taxOwed = (distribution * combined) / 100;
    const navAfter = nav - dist;
    const valueBefore = shares * nav;
    const valueAfter = shares * navAfter;
    const netChange = valueAfter + distribution - taxOwed - valueBefore;
    const taxPct = valueBefore > 0 ? taxOwed / valueBefore : 0;

    const tone: 'ok' | 'warn' = late && taxOwed > 0 ? 'warn' : 'ok';
    const badge = late && taxOwed > 0
      ? `${money(taxOwed, 0)} tax on gains you never earned`
      : `${money(taxOwed, 0)} tax, no extra gain`;
    const note = late
      ? 'You bought just before the record date, so you owe tax on gains the fund made before you owned it. Your price paid is still your basis, and the distribution lowers the share price. Reinvested distributions add to your cost basis. General info, not tax advice.'
      : 'The price fell by the distribution, so you owe tax on money that did not add to your wealth. Reinvested distributions add to your cost basis, which cuts the gain when you sell. General info, not tax advice.';

    return {
      taxOwed, distribution, navAfter, valueBefore, valueAfter, netChange, taxPct,
      tone, badge,
      chart: {
        type: 'bar',
        title: 'Your position around the distribution',
        categories: ['Value before', 'Value after', 'Distribution', 'Tax owed'],
        series: [{ name: 'Amount', values: [valueBefore, valueAfter, distribution, taxOwed] }],
        format: CURRENCY,
      },
      steps: [
        `Total distribution = ${shares} shares × ${money(dist)} = ${money(distribution)}`,
        `Tax owed = ${money(distribution)} × ${+combined.toFixed(2)}% = ${money(taxOwed)}`,
        `NAV after = ${money(nav)} − ${money(dist)} = ${money(navAfter)}`,
        `Position value = ${money(valueBefore)} before, ${money(valueAfter)} after`,
        `After-tax change = ${money(valueAfter)} + ${money(distribution)} − ${money(taxOwed)} − ${money(valueBefore)} = ${money(netChange)}`,
      ],
      note,
    };
  },
  content: {
    formula: [
      'Total distribution = shares × distribution per share',
      'Tax owed = total distribution × (federal rate + state rate)',
      'NAV after = NAV before − distribution per share',
      'After-tax value change = value after + distribution − tax − value before = −tax',
    ],
    body: [
      'A mutual fund must pass most of its realized capital gains to shareholders each year, usually in November or December. In a taxable account that payout is taxable to you, whether you take it as cash or reinvest it. The fund share price falls by the distribution amount on the ex-dividend date, so your position is worth less by the same amount you received.',
      'That is why a distribution does not make you richer, yet it still creates a tax bill. Before tax you are even: the cash or new shares you receive equals the drop in value. After tax you are behind by the tax owed. This calculator shows that cost for your shares.',
      'Timing matters. Whoever holds shares on the record date gets the full distribution and the full tax bill, even if they bought a day earlier. If you buy right before the record date, you pay tax on gains the fund made before you owned it. Checking the fund distribution schedule before a year-end purchase can avoid that.',
    ],
    sections: [
      {
        heading: 'Reinvested distributions raise your basis',
        paragraphs: ['If you reinvest a distribution, the new shares have a cost basis equal to the amount reinvested. That raises your total basis, so when you later sell you report a smaller gain. Without tracking it you could pay tax on the same money twice. Most brokers track basis for you, but check your statement.'],
      },
      {
        heading: 'What this estimate leaves out',
        paragraphs: ['The rate is an input. It does not work out your bracket, the 3.8% Net Investment Income Tax, or whether part of the payout is short-term, which is taxed as ordinary income. Funds held in an IRA or 401(k) usually owe nothing on distributions. This is general information, not tax advice.'],
      },
    ],
    faq: [
      { q: 'What tax do I owe on 500 shares with a $2 distribution at 15%?', a: 'The total distribution is 500 × $2 = $1,000. At 15% and no state tax you owe $150. The NAV drops from $40 to $38, so your position goes from $20,000 to $19,000.' },
      { q: 'Do I owe tax if I reinvest the distribution?', a: 'Yes. A reinvested distribution is taxed the same as one taken in cash. The reinvested amount is added to your cost basis, which lowers your taxable gain when you sell.' },
      { q: 'Why does the share price drop after a distribution?', a: 'The fund pays out the gains from its own assets, so its NAV falls by the distribution per share. This calculator subtracts the distribution from NAV: $40 minus $2 is $38.' },
      { q: 'What happens if I buy just before the record date?', a: 'You still receive the full distribution and owe the full tax, on gains the fund made before you bought. Your after-tax value change is the same as for a long-term holder: the negative of the tax.' },
      { q: 'Is the after-tax change really equal to the tax?', a: 'Yes. Position value falls by the distribution, you receive the same amount, so before tax you are even. After tax, the change is minus the tax. With $150 of tax the change is −$150.' },
    ],
    sources: [
      { label: 'IRS Topic 404: Dividends and other corporate distributions', url: 'https://www.irs.gov/taxtopics/tc404' },
      { label: 'IRS Publication 550: Investment Income and Expenses', url: 'https://www.irs.gov/publications/p550' },
      { label: 'SEC Investor.gov: Mutual fund distributions', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/mutual-fund-distributions' },
    ],
  },
  related: ['capital-gains-tax', 'tax-drag', 'average-cost-basis', 'tax-loss-harvesting', 'wash-sale-basis', 'investment-fee-drag'],
  examples: [
    {
      // dist 500 × 2 = 1,000; tax 1,000 × 15% = 150; NAV after 38; value 20,000 → 19,000; change 19,000 + 1,000 − 150 − 20,000 = −150; 150/20,000 = 0.0075.
      values: { shares: 500, nav: 40, dist: 2, rate: 15, state: 0, timing: 'held' },
      expect: { distribution: 1000, taxOwed: 150, navAfter: 38, valueBefore: 20000, valueAfter: 19000, netChange: -150, taxPct: 0.0075 },
      tolerance: 1e-6,
    },
    {
      // dist 120 × 1.25 = 150; tax 150 × (20% + 5%) = 37.5; NAV after 24.25; value 3,060 → 2,910; change −37.5; 37.5/3,060 = 0.012254902.
      values: { shares: 120, nav: 25.5, dist: 1.25, rate: 20, state: 5, timing: 'late' },
      expect: { distribution: 150, taxOwed: 37.5, navAfter: 24.25, valueBefore: 3060, valueAfter: 2910, netChange: -37.5, taxPct: 0.012254902 },
      tolerance: 1e-6,
    },
  ],
});
