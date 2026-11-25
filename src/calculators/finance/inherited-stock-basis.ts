import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'inherited-stock-basis',
  title: 'Inherited Stock Basis: Step-Up vs Carryover',
  category: 'finance',
  description: 'Compare the tax on selling inherited stock with a stepped-up basis versus the original cost basis, and see the tax the step-up avoids. Rate is editable.',
  keywords: ['inherited stock basis calculator', 'step-up in basis calculator', 'inherited stock capital gains', 'stepped up basis vs carryover basis', 'sell inherited shares tax'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'shares', label: 'Shares inherited', type: 'number', default: 100, min: 0, step: 1, help: 'Number of shares you are selling.', info: 'Shares sold.' },
    { id: 'cost', label: 'Original cost per share', type: 'number', prefix: '$', default: 20, min: 0, step: 0.5, help: 'What the person who died paid. This is the carryover basis.', info: 'Used for the "no step-up" comparison.' },
    { id: 'death', label: 'Value per share at date of death', type: 'number', prefix: '$', default: 80, min: 0, step: 0.5, help: 'Your stepped-up basis, usually the market value on the date of death.', info: 'Check the estate paperwork or brokerage statement for this value.' },
    { id: 'sale', label: 'Sale price per share', type: 'number', prefix: '$', default: 85, min: 0, step: 0.5, help: 'What you sell for.', info: 'Per-share proceeds.' },
    { id: 'rate', label: 'Capital gains tax rate', type: 'number', suffix: '%', default: 15, min: 0, max: 60, step: 0.5, help: 'Illustrative default. Not a current-year claim: check the IRS for your rate.', info: 'Applied to any gain. Losses are not given a tax benefit here.' },
  ],
  outputs: [
    { id: 'taxStep', label: 'Tax with step-up basis', format: 'currency', primary: true, info: 'Rate × gain over the value at death, never below zero.' },
    { id: 'gainStep', label: 'Gain with step-up', format: 'currency', info: '(Sale − value at death) × shares.' },
    { id: 'gainCarry', label: 'Gain on original cost', format: 'currency', info: '(Sale − original cost) × shares.' },
    { id: 'taxCarry', label: 'Tax on original cost', format: 'currency', info: 'Rate × gain on original cost, never below zero.' },
    { id: 'avoided', label: 'Tax avoided by the step-up', format: 'currency', info: 'Tax on original cost minus tax with step-up. Negative if the value fell.' },
  ],
  compute: (v) => {
    const shares = num(v.shares);
    const cost = num(v.cost);
    const death = num(v.death);
    const sale = num(v.sale);
    const rate = num(v.rate);
    if (shares === null || cost === null || death === null || sale === null || rate === null) return { taxStep: null };
    if (shares < 0 || cost < 0 || death < 0 || sale < 0 || rate < 0) return { taxStep: null };

    const r = rate / 100;
    const gainStep = (sale - death) * shares;
    const gainCarry = (sale - cost) * shares;
    const taxStep = Math.max(0, gainStep) * r;
    const taxCarry = Math.max(0, gainCarry) * r;
    const avoided = taxCarry - taxStep;

    const charts: ChartSpec[] = [
      {
        type: 'bar',
        title: 'Tax on the sale',
        categories: ['Step-up basis', 'Original cost basis'],
        series: [{ name: 'Tax', values: [taxStep, taxCarry] }],
        format: { format: 'currency' },
        highlight: 0,
      },
    ];

    return {
      taxStep, gainStep, gainCarry, taxCarry, avoided,
      tone: avoided > 0 ? 'good' : avoided < 0 ? 'warn' : 'ok',
      badge: avoided > 0 ? `Step-up avoids ${money(avoided, 0)}` : avoided < 0 ? `Step-down costs ${money(-avoided, 0)}` : 'No difference',
      chart: charts,
      steps: [
        `Gain with step-up = (${money(sale)} − ${money(death)}) × ${shares} = ${money(gainStep)}`,
        `Tax with step-up = ${pct(r, 2)} × ${money(Math.max(0, gainStep))} = ${money(taxStep)}`,
        `Gain on original cost = (${money(sale)} − ${money(cost)}) × ${shares} = ${money(gainCarry)}`,
        `Tax on original cost = ${pct(r, 2)} × ${money(Math.max(0, gainCarry))} = ${money(taxCarry)}`,
        `Tax avoided = ${money(taxCarry)} − ${money(taxStep)} = ${money(avoided)}`,
      ],
      note: 'The rate is your input and the default is illustrative, not a current-year claim. The step-up applies to most inherited assets but not all (retirement accounts and some trusts differ). Estate rules are not computed, and losses get no tax benefit here. Not tax advice.',
    };
  },
  content: {
    formula: [
      'Gain with step-up = (sale price − value at death) × shares',
      'Gain on original cost = (sale price − original cost) × shares',
      'Tax = rate × gain, never below zero; tax avoided = tax on original cost − tax with step-up',
    ],
    body: [
      'When you inherit stock, your cost basis is usually reset ("stepped up") to its market value on the date of death. That wipes out the gain that built up during the original owner\'s life, so you only owe tax on growth after you inherit.',
      'This calculator shows the tax with the step-up next to the tax you would owe if the original cost carried over, as it would for a lifetime gift. The difference is the tax the step-up avoids. If the stock fell below its original cost, the step-up works the other way and the difference turns negative.',
      'The rate and values are inputs and the default rate is illustrative, not a claim about the current year. The step-up applies to most inherited assets but not all, and estate rules are not computed.',
    ],
    sections: [
      {
        heading: 'What to keep',
        paragraphs: ['Keep the date-of-death valuation from the estate or brokerage, since it is your basis. Retirement accounts do not get a step-up, and some trust assets are treated differently. Check the IRS rules or a tax professional.'],
      },
    ],
    faq: [
      { q: 'What is the tax on 100 inherited shares with cost $20, value at death $80 and sale $85?', a: 'With the step-up the gain is ($85 − $80) × 100 = $500, so tax at 15% is $75.00. On the original cost the gain would be $6,500 and the tax $975.00, so the step-up avoids $900.00.' },
      { q: 'What if the stock lost value before death?', a: 'The basis steps down to the lower value. With 50 shares, cost $100, value at death $60 and a $70 sale at 20%, the gain is $500 and the tax $100.00. On the original cost there would be a loss and no tax, so the step-down costs $100.00.' },
      { q: 'Does every inherited asset get a step-up?', a: 'No. Most do, but retirement accounts and some trust assets do not. Check the rules for the asset you inherited.' },
      { q: 'Is the default tax rate current?', a: 'No. It is illustrative. Enter the rate that applies to you for the tax year.' },
    ],
    sources: [
      { label: 'IRS Publication 551: Basis of Assets', url: 'https://www.irs.gov/publications/p551' },
      { label: 'IRS Topic 703: Basis of assets', url: 'https://www.irs.gov/taxtopics/tc703' },
    ],
  },
  related: ['average-cost-basis', 'gains-harvest-headroom', 'capital-gains-tax', 'donate-stock-vs-cash'],
  examples: [
    {
      // Step-up gain (85-80)×100 = 500, tax 15% = 75; carryover gain (85-20)×100 = 6,500, tax 975; avoided 900.
      values: { shares: 100, cost: 20, death: 80, sale: 85, rate: 15 },
      expect: { gainStep: 500, taxStep: 75, gainCarry: 6500, taxCarry: 975, avoided: 900 },
      tolerance: 1e-6,
    },
    {
      // Step-down: step-up gain (70-60)×50 = 500, tax 20% = 100; carryover gain (70-100)×50 = -1,500, tax 0; avoided -100.
      values: { shares: 50, cost: 100, death: 60, sale: 70, rate: 20 },
      expect: { gainStep: 500, taxStep: 100, gainCarry: -1500, taxCarry: 0, avoided: -100 },
      tolerance: 1e-6,
    },
  ],
});
