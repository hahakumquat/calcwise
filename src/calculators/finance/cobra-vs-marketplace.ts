import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'cobra-vs-marketplace',
  title: 'COBRA vs Marketplace Plan Calculator',
  category: 'finance',
  description: 'Lost your job or switching jobs? Compare COBRA with a marketplace plan: premiums for the months you need cover plus the deductible you would pay.',
  keywords: ['cobra vs marketplace', 'cobra or obamacare calculator', 'cobra cost calculator', 'health insurance after layoff', 'cobra vs healthcare.gov', 'is cobra worth it'],
  updated: '2026-11-24',
  inputs: [
    { id: 'months', label: 'Months of coverage needed', type: 'number', default: 6, min: 1, max: 36, step: 1, info: 'How long until new employer cover starts or you expect to be covered elsewhere.' },
    { id: 'cobra', label: 'COBRA monthly premium', type: 'number', prefix: '$', default: 720, min: 0, step: 10, info: 'The full price on your COBRA notice, including the part your employer used to pay.' },
    { id: 'market', label: 'Marketplace monthly premium', type: 'number', prefix: '$', default: 410, min: 0, step: 10, info: 'Your price after any subsidy. Get a quote on healthcare.gov.' },
    { id: 'dedCobra', label: 'Deductible left on COBRA plan', type: 'number', prefix: '$', default: 200, min: 0, step: 50, info: 'COBRA keeps your current plan, so deductible you already met this year carries over.' },
    { id: 'dedMarket', label: 'Deductible on marketplace plan', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, info: 'A new plan starts your deductible from zero.' },
    { id: 'spend', label: 'Medical spending you expect', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, info: 'Total allowed charges for the months you need cover.' },
  ],
  outputs: [
    { id: 'cobraTotal', label: 'COBRA total cost', format: 'currency', info: 'Premium × months + the smaller of your spending and the deductible left.' },
    { id: 'marketTotal', label: 'Marketplace total cost', format: 'currency', info: 'Premium × months + the smaller of your spending and the new deductible.' },
    { id: 'diff', label: 'Difference (marketplace − COBRA)', format: 'currency', primary: true, info: 'Positive means COBRA is cheaper, negative means the marketplace is cheaper.' },
    { id: 'cobraPrem', label: 'COBRA premiums', format: 'currency', info: 'Premium × months.' },
    { id: 'marketPrem', label: 'Marketplace premiums', format: 'currency', info: 'Premium × months.' },
  ],
  compute: (v) => {
    const months = num(v.months), cobra = num(v.cobra), market = num(v.market);
    const dedC = num(v.dedCobra), dedM = num(v.dedMarket), spend = num(v.spend);
    if ([months, cobra, market, dedC, dedM, spend].some((x) => x === null)) return { diff: null };
    if ([months, cobra, market, dedC, dedM, spend].some((x) => (x as number) < 0)) return { diff: null, error: 'Values cannot be negative.' };
    if ((months as number) < 1) return { diff: null, note: 'Enter at least 1 month of coverage.' };
    const m = months as number;
    const cobraPrem = (cobra as number) * m;
    const marketPrem = (market as number) * m;
    const cobraTotal = cobraPrem + Math.min(spend as number, dedC as number);
    const marketTotal = marketPrem + Math.min(spend as number, dedM as number);
    const diff = marketTotal - cobraTotal;
    const winner = diff > 0 ? 'COBRA' : diff < 0 ? 'The marketplace plan' : 'Neither';
    return {
      cobraTotal, marketTotal, diff, cobraPrem, marketPrem,
      tone: diff === 0 ? 'ok' : 'good',
      badge: diff === 0 ? 'Dead even at this spending' : `${winner} is cheaper by ${usd(Math.abs(diff))}`,
      chart: {
        type: 'bar',
        title: 'Total cost over ' + m + ' month' + (m === 1 ? '' : 's'),
        categories: ['COBRA', 'Marketplace'],
        series: [
          { name: 'Premiums', values: [cobraPrem, marketPrem] },
          { name: 'Deductible paid', values: [cobraTotal - cobraPrem, marketTotal - marketPrem] },
        ],
        format: { format: 'currency' },
      },
      steps: [
        `COBRA: ${usd(cobra as number)} × ${m} = ${usd(cobraPrem)}, plus ${usd(cobraTotal - cobraPrem)} deductible = ${usd(cobraTotal)}`,
        `Marketplace: ${usd(market as number)} × ${m} = ${usd(marketPrem)}, plus ${usd(marketTotal - marketPrem)} deductible = ${usd(marketTotal)}`,
        `Difference: ${usd(marketTotal)} − ${usd(cobraTotal)} = ${usd(diff)}`,
      ],
      note: 'This ignores coinsurance, copays and out-of-pocket maximums, so it is a rough guide, not a quote. Check the election deadline on your COBRA notice, and compare provider networks and drug coverage before you choose.',
    };
  },
  content: {
    formula: [
      'Plan cost = monthly premium × months + the smaller of (expected spending, deductible)',
      'Difference = marketplace cost − COBRA cost',
    ],
    body: [
      'COBRA lets you keep your old employer plan after leaving a job, but you pay the whole premium. Marketplace plans are often cheaper each month, especially with a subsidy, but they start a new deductible.',
      'The tradeoff depends on how much care you expect. If you have little spending planned, the lower marketplace premium wins. If you expect a lot, COBRA can win because the deductible you already met carries over.',
      'Use the premium after subsidy for the marketplace price. Losing a job usually opens a special enrollment period, but it has a deadline, so check dates on your COBRA notice and on healthcare.gov.',
      'This is a simple cost comparison. Networks, drug coverage and out-of-pocket maximums can matter more than a few hundred dollars.',
    ],
    faq: [
      { q: 'Is COBRA or the marketplace cheaper?', a: 'With 6 months, $720 vs $410 premiums, $200 vs $3,000 deductibles and $3,000 of care, COBRA costs $4,520 and the marketplace $5,460, so COBRA is $940 cheaper.' },
      { q: 'When does the marketplace win?', a: 'When you expect little care. With only $1,000 of spending in the same example, COBRA is $4,520 and the marketplace $3,460, so the marketplace is $1,060 cheaper.' },
      { q: 'Why does the deductible matter?', a: 'COBRA keeps your current plan, so what you already paid this year still counts. A marketplace plan restarts at zero.' },
      { q: 'What does this calculator leave out?', a: 'Coinsurance, copays, out-of-pocket maximums, networks and drug coverage. It assumes you pay the lower of your spending and the deductible.' },
      { q: 'How long do I have to choose?', a: 'It is set by your COBRA election notice and the marketplace special enrollment window. This calculator does not compute dates, so read your notice.' },
    ],
    sources: [
      { label: 'U.S. Department of Labor: COBRA continuation coverage', url: 'https://www.dol.gov/general/topic/health-plans/cobra' },
      { label: 'HealthCare.gov: Special Enrollment Period', url: 'https://www.healthcare.gov/glossary/special-enrollment-period/' },
    ],
  },
  related: ['health-plan-comparison', 'severance-pay', 'savings-runway'],
  examples: [
    // cobra 720×6=4320+200=4520; market 410×6=2460+3000=5460; diff 940
    { values: { months: 6, cobra: 720, market: 410, dedCobra: 200, dedMarket: 3000, spend: 3000 }, expect: { cobraTotal: 4520, marketTotal: 5460, diff: 940 }, tolerance: 0.01 },
    // spend 1000: cobra 4320+200=4520; market 2460+1000=3460; diff -1060
    { values: { months: 6, cobra: 720, market: 410, dedCobra: 200, dedMarket: 3000, spend: 1000 }, expect: { cobraTotal: 4520, marketTotal: 3460, diff: -1060 }, tolerance: 0.01 },
    // spend 0, 3 months: cobra 1500 (500×3), market 900 (300×3); diff -600
    { values: { months: 3, cobra: 500, market: 300, dedCobra: 0, dedMarket: 2000, spend: 0 }, expect: { cobraTotal: 1500, marketTotal: 900, diff: -600 }, tolerance: 0.01 },
  ],
});
