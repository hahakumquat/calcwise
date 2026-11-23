import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'hsa-invest-vs-spend',
  title: 'HSA: Invest or Spend Calculator',
  category: 'finance',
  description: 'Pay a medical bill from cash and let the HSA keep growing, or pay from the HSA and invest the cash? See the dollar difference after tax.',
  keywords: ['hsa invest vs spend', 'hsa pay out of pocket or use hsa', 'hsa stealth ira calculator', 'should i pay medical bills from hsa', 'hsa receipts reimburse later', 'hsa growth calculator'],
  updated: '2026-11-23',
  inputs: [
    { id: 'expense', label: 'Medical expense today', type: 'number', prefix: '$', default: 1000, min: 0, step: 100, info: 'The bill you could pay from either the HSA or your own cash.' },
    { id: 'years', label: 'Years the money stays invested', type: 'number', suffix: 'years', default: 20, min: 1, max: 60, step: 1, info: 'How long before you would use the money.' },
    { id: 'ret', label: 'Annual return', type: 'number', suffix: '%', default: 7, min: -50, max: 50, step: 0.5, info: 'An assumption, not a forecast. The same return applies to both accounts.' },
    { id: 'rate', label: 'Tax rate on taxable gains', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 1, info: 'The rate you would pay on gains if the cash went into a taxable account instead.' },
  ],
  outputs: [
    { id: 'advantage', label: 'Advantage of paying cash and keeping the HSA invested', format: 'currency', primary: true, info: 'HSA balance minus the taxable balance after tax.' },
    { id: 'hsa', label: 'HSA balance if you pay cash', format: 'currency', info: 'The expense amount left in the HSA and grown at the return.' },
    { id: 'taxableBefore', label: 'Taxable balance before tax', format: 'currency', info: 'The same amount invested in a taxable account instead.' },
    { id: 'tax', label: 'Tax on the gain', format: 'currency', info: 'Tax rate × growth.' },
    { id: 'taxableAfter', label: 'Taxable balance after tax', format: 'currency', info: 'What is left after tax on the gain.' },
  ],
  compute: (v) => {
    const expense = num(v.expense);
    const years = num(v.years);
    const ret = num(v.ret);
    const rate = num(v.rate);
    if (expense === null || years === null || ret === null || rate === null) return { advantage: null };
    if (expense < 0 || rate < 0) return { advantage: null, error: 'Values cannot be negative.' };
    if (years < 1) return { advantage: null, error: 'Enter at least 1 year.' };
    if (rate > 100) return { advantage: null, error: 'The tax rate cannot be above 100%.' };
    if (ret <= -100) return { advantage: null, error: 'The return must be above -100%.' };
    if (expense === 0) return { advantage: null, note: 'Enter an expense to see the result.' };
    const hsa = expense * Math.pow(1 + ret / 100, years);
    const tax = Math.max(0, hsa - expense) * (rate / 100);
    const taxableAfter = hsa - tax;
    const advantage = hsa - taxableAfter;
    return {
      advantage,
      hsa,
      taxableBefore: hsa,
      tax,
      taxableAfter,
      tone: advantage > 0.005 ? 'good' : 'ok',
      badge: advantage > 0.005 ? 'Keeping the HSA invested comes out ahead' : 'No difference',
      chart: {
        type: 'bar',
        title: 'Balance after ' + years + ' years',
        categories: ['HSA (paid cash)', 'Taxable, after tax'],
        series: [{ name: 'Balance', values: [hsa, taxableAfter] }],
        format: { format: 'currency' },
      },
      steps: [
        `Grown at ${ret}% for ${years} years: ${usd(expense)} → ${usd(hsa)}`,
        `Tax if it were taxable: ${rate}% × (${usd(hsa)} − ${usd(expense)}) = ${usd(tax)}`,
        `Taxable after tax: ${usd(hsa)} − ${usd(tax)} = ${usd(taxableAfter)}`,
        `Advantage: ${usd(hsa)} − ${usd(taxableAfter)} = ${usd(advantage)}`,
      ],
      note: 'The return and tax rate are your own assumptions. This compares only the tax on growth: the cash you spend is assumed to be money you can really afford to part with. It assumes tax-free withdrawal for qualified medical expenses, ignores yearly tax on dividends in the taxable account, and does not model some states taxing HSA growth. Keep your receipts if you plan to reimburse yourself later.',
    };
  },
  content: {
    formula: [
      'HSA balance = expense × (1 + r)^years',
      'Tax = tax rate × (HSA balance − expense)',
      'Taxable balance after tax = HSA balance − tax',
      'Advantage = HSA balance − taxable balance after tax = tax',
    ],
    body: [
      'A health savings account can be used two ways. You can pay a medical bill straight from the HSA, or you can pay it from your own cash, leave the HSA invested, and reimburse yourself later. This calculator puts a dollar figure on the second option.',
      'In both cases the same amount of money ends up spent on the bill. The difference is where the leftover money grows: inside the HSA, where qualified withdrawals are tax-free, or in a taxable account, where you pay tax on the gain. The advantage is therefore the tax you avoid on the growth.',
      'It only makes sense if paying cash does not strain your budget or emergency fund. Keep every receipt and the proof that the expense was qualified and happened after you opened the HSA; without them you cannot reimburse yourself later.',
      'Some states tax HSA growth or contributions, and HSA rules and limits change each year. Check your plan documents and IRS Publication 969 before relying on this.',
    ],
    faq: [
      { q: 'Should I pay medical bills from my HSA or out of pocket?', a: 'If you can afford the cash, paying out of pocket and leaving the HSA invested lets the money grow tax-free. If cash is tight, paying from the HSA is what it is for. This calculator only measures the tax gap.' },
      { q: 'How much does it add up to?', a: 'With a $1,000 expense, 20 years at 7% and a 15% tax rate on taxable gains, the HSA grows to $3,869.68 and the taxable account ends at $3,439.23 after tax, an advantage of $430.45.' },
      { q: 'Can I reimburse myself years later?', a: 'Federal rules generally allow a tax-free reimbursement for a qualified expense incurred after the HSA was opened, with no deadline, if you can document it. Rules and employer plans vary, so check IRS Publication 969.' },
      { q: 'Why is the advantage equal to the tax?', a: 'Both paths end with the same pre-tax growth. The only difference is that the taxable account owes tax on the gain and the HSA does not, so the advantage equals that tax.' },
      { q: 'Does this include yearly tax on dividends?', a: 'No. A taxable account also pays tax on dividends along the way, so the real advantage is a little larger. Tax Drag Calculator covers that effect.' },
    ],
    sources: [
      { label: 'IRS Publication 969: Health Savings Accounts', url: 'https://www.irs.gov/publications/p969' },
      { label: 'IRS Topic 409: Capital gains and losses', url: 'https://www.irs.gov/taxtopics/tc409' },
    ],
  },
  related: ['hsa-fsa-savings', 'compound-interest', 'tax-drag'],
  examples: [
    // 1.07^20 = 3.8696844; hsa 3869.68; tax 0.15×2869.68 = 430.45; after 3439.23
    { values: { expense: 1000, years: 20, ret: 7, rate: 15 }, expect: { hsa: 3869.68, tax: 430.45, taxableAfter: 3439.23, advantage: 430.45 }, tolerance: 0.01 },
    // 1.05^10 = 1.6288946; 814.45; gain 314.45; tax 20% = 62.89; after 751.56
    { values: { expense: 500, years: 10, ret: 5, rate: 20 }, expect: { hsa: 814.45, tax: 62.89, taxableAfter: 751.56, advantage: 62.89 }, tolerance: 0.01 },
    // zero return: no gain, no tax
    { values: { expense: 800, years: 5, ret: 0, rate: 25 }, expect: { hsa: 800, tax: 0, advantage: 0 }, tolerance: 1e-6 },
  ],
});
