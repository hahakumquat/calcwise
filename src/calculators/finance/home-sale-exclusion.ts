import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'home-sale-exclusion',
  title: 'Home Sale Tax Exclusion Calculator',
  category: 'finance',
  description: 'Estimate the taxable gain on your home sale after the $250,000 or $500,000 exclusion. Enter the sale price, costs, purchase price, improvements and tax rate.',
  keywords: ['home sale exclusion calculator', 'capital gains on home sale', 'section 121 exclusion', '250000 500000 home sale exclusion', 'tax on selling a house'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'price', label: 'Sale price', type: 'number', prefix: '$', default: 1200000, min: 0, step: 10000, info: 'What the buyer pays.' },
    { id: 'costs', label: 'Selling costs', type: 'number', prefix: '$', default: 72000, min: 0, step: 1000, info: 'Agent commissions, closing fees and other costs of selling.' },
    { id: 'purchase', label: 'Purchase price', type: 'number', prefix: '$', default: 400000, min: 0, step: 10000, info: 'What you paid for the home.' },
    { id: 'improve', label: 'Capital improvements', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'Major improvements that add to the home, such as a new roof or addition. Routine repairs usually do not count.' },
    { id: 'exclusion', label: 'Exclusion', type: 'number', prefix: '$', default: 500000, min: 0, step: 250000, info: '$250,000 for most single filers or $500,000 for married filing jointly, if you meet the ownership and use tests. Confirm with the IRS.' },
    { id: 'rate', label: 'Capital gains tax rate', type: 'number', suffix: '%', default: 15, min: 0, max: 60, step: 1, info: 'Your long-term capital gains rate on the taxable part.' },
  ],
  outputs: [
    { id: 'tax', label: 'Estimated tax on the sale', format: 'currency', precision: 2, primary: true, info: 'Taxable gain × capital gains rate.' },
    { id: 'taxable', label: 'Taxable gain after exclusion', format: 'currency', precision: 2, info: 'Gain − exclusion, never below zero.' },
    { id: 'gain', label: 'Total gain', format: 'currency', precision: 2, info: 'Sale price − selling costs − (purchase price + improvements).' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const costs = num(v.costs);
    const buy = num(v.purchase);
    const imp = num(v.improve);
    const exc = num(v.exclusion);
    const rate = num(v.rate);
    if ([price, costs, buy, imp, exc, rate].some((x) => x === null)) return { tax: null };
    if ([price, costs, buy, imp, exc, rate].some((x) => (x as number) < 0)) return { tax: null, error: 'Values cannot be negative.' };
    if (rate! > 60) return { tax: null, error: 'Use a rate of 60% or less.' };
    const basis = buy! + imp!;
    const gain = price! - costs! - basis;
    const taxable = Math.max(0, gain - exc!);
    const tax = taxable * (rate! / 100);
    const shielded = Math.max(0, Math.min(gain, exc!));
    return {
      tax,
      taxable,
      gain,
      tone: taxable === 0 ? 'good' : 'ok',
      badge: gain <= 0 ? 'No gain' : taxable === 0 ? 'Fully excluded' : `${money(taxable)} taxable`,
      note: gain <= 0
        ? `You sold for ${money(-gain)} less than your cost basis, so there is no gain to tax. A loss on a personal home is generally not deductible.`
        : taxable === 0
          ? `Your gain of ${money(gain)} is within the ${money(exc!)} exclusion, so none of it is taxed, assuming you meet the ownership and use tests.`
          : `Your gain of ${money(gain)} is ${money(taxable)} over the ${money(exc!)} exclusion. At ${rate}% that is ${money(tax)}. State tax, the net investment income tax and depreciation recapture are not included.`,
      chart: {
        type: 'bar' as const,
        title: 'Gain on the sale',
        categories: ['Gain'],
        series: [
          { name: 'Excluded', values: [shielded] },
          { name: 'Taxable', values: [taxable] },
        ],
        format: CURRENCY,
        stacked: true,
      },
      steps: [
        `Cost basis = ${money(buy!)} + ${money(imp!)} = ${money(basis)}`,
        `Gain = ${money(price!)} − ${money(costs!)} − ${money(basis)} = ${money(gain)}`,
        `Taxable gain = ${money(gain)} − ${money(exc!)} = ${money(taxable)} (never below zero)`,
        `Tax = ${money(taxable)} × ${rate}% = ${money(tax)}`,
      ],
    };
  },
  content: {
    formula: [
      'Cost basis = purchase price + capital improvements',
      'Gain = sale price − selling costs − cost basis',
      'Taxable gain = gain − exclusion (never below zero)',
      'Tax = taxable gain × capital gains rate',
    ],
    body: [
      'When you sell your main home, you can usually exclude up to $250,000 of gain from tax, or up to $500,000 if you are married filing jointly. Only the gain above that is taxed as a capital gain.',
      'Example: you sell for $1,200,000 with $72,000 of costs, bought for $400,000 and added $50,000 of improvements. The gain is $678,000. With a $500,000 exclusion, $178,000 is taxable, which is $26,700 of tax at 15%.',
      'To qualify, you generally must have owned and lived in the home as your main home for at least 2 of the 5 years before the sale. Partial exclusions, rental use and depreciation are not modelled. This is general information, not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much of my gain is tax free?', a: 'Up to the exclusion you enter: $250,000 for most single filers or $500,000 for married filing jointly, if you meet the IRS ownership and use tests.' },
      { q: 'What counts as an improvement?', a: 'Work that adds value or extends the life of the home, such as a new roof or an addition. Routine repairs usually do not count. Add improvements to raise your cost basis.' },
      { q: 'What if I lose money on the sale?', a: 'There is no gain to tax and the calculator shows zero. A loss on your personal home is generally not deductible.' },
      { q: 'Which tax rate should I use?', a: 'Your long-term capital gains rate, commonly 0%, 15% or 20% federally. The result does not add state tax or the net investment income tax.' },
      { q: 'Is this the same as net proceeds?', a: 'No. Net proceeds shows the cash you receive. This shows the tax on the gain, so use both when planning a sale.' },
    ],
    sources: [
      { label: 'IRS Topic 701: Sale of your home', url: 'https://www.irs.gov/taxtopics/tc701' },
    ],
  },
  related: ['home-sale-net-proceeds', 'capital-gains-tax', 'capital-loss-carryover', 'income-tax'],
  examples: [
    // basis 450000; gain 1200000-72000-450000 = 678000; taxable 178000; tax 26700
    { values: { price: 1200000, costs: 72000, purchase: 400000, improve: 50000, exclusion: 500000, rate: 15 }, expect: { gain: 678000, taxable: 178000, tax: 26700 } },
    // gain 900000-54000-450000 = 396000 within 500000
    { values: { price: 900000, costs: 54000, purchase: 400000, improve: 50000, exclusion: 500000, rate: 15 }, expect: { gain: 396000, taxable: 0, tax: 0 } },
    // loss: 300000-18000-400000 = -118000
    { values: { price: 300000, costs: 18000, purchase: 400000, improve: 0, exclusion: 250000, rate: 15 }, expect: { gain: -118000, taxable: 0, tax: 0 } },
  ],
});
