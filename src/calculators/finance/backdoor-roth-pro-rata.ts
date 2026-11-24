import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'backdoor-roth-pro-rata',
  title: 'Backdoor Roth Pro-Rata Calculator',
  category: 'finance',
  description: 'See how much of a backdoor Roth conversion is taxable under the pro-rata rule, given your pre-tax IRA balance, your after-tax basis and your tax rate.',
  keywords: ['backdoor roth pro rata calculator', 'pro rata rule calculator', 'backdoor roth taxable amount', 'form 8606 pro rata', 'roth conversion pro-rata tax', 'backdoor roth with traditional ira balance'],
  updated: '2026-11-24',
  inputs: [
    { id: 'pretax', label: 'Pre-tax IRA balance on Dec 31', type: 'number', prefix: '$', default: 45000, min: 0, step: 1000, info: 'Traditional, SEP and SIMPLE IRA balances at year end, after the conversion leaves the account. Do not include the amount you convert.' },
    { id: 'basis', label: 'After-tax basis (Form 8606)', type: 'number', prefix: '$', default: 7000, min: 0, step: 500, info: 'Nondeductible contributions you have made, including the one you are converting. See line 14 of last year’s Form 8606.' },
    { id: 'conv', label: 'Amount converted', type: 'number', prefix: '$', default: 7000, min: 0, step: 500, info: 'What you convert to a Roth IRA this year.' },
    { id: 'rate', label: 'Marginal tax rate', type: 'number', suffix: '%', default: 24, min: 0, max: 100, step: 1, info: 'Your federal rate on the taxable part of the conversion.' },
  ],
  outputs: [
    { id: 'tax', label: 'Tax on the conversion', format: 'currency', primary: true, info: 'Taxable part × marginal rate.' },
    { id: 'taxable', label: 'Taxable part of the conversion', format: 'currency', info: 'Amount converted − the non-taxable part.' },
    { id: 'nontaxable', label: 'Non-taxable part', format: 'currency', info: 'Amount converted × after-tax share.' },
    { id: 'share', label: 'After-tax share of all IRAs', format: 'percent', info: 'Basis ÷ (pre-tax balance + amount converted).' },
  ],
  compute: (v) => {
    const pretax = num(v.pretax), basis = num(v.basis), conv = num(v.conv), rate = num(v.rate);
    if ([pretax, basis, conv, rate].some((x) => x === null)) return { tax: null };
    if ([pretax, basis, conv, rate].some((x) => (x as number) < 0)) return { tax: null, error: 'Values cannot be negative.' };
    if ((rate as number) > 100) return { tax: null, error: 'Rate cannot be above 100%.' };
    const total = (pretax as number) + (conv as number);
    if (total === 0) return { tax: null, note: 'Enter a balance or an amount to convert.' };
    if ((basis as number) > total) return { tax: null, error: 'Basis cannot be more than your total IRA money (pre-tax balance plus amount converted).' };
    const share = (basis as number) / total;
    const nontaxable = (conv as number) * share;
    const taxable = (conv as number) - nontaxable;
    const tax = taxable * ((rate as number) / 100);
    return {
      tax, taxable, nontaxable, share,
      tone: taxable < 0.005 ? 'good' : 'warn',
      badge: taxable < 0.005 ? 'The conversion is not taxed' : `${((1 - share) * 100).toFixed(2)}% of the conversion is taxable`,
      chart: {
        type: 'bar',
        title: 'How the conversion is split',
        categories: ['Non-taxable', 'Taxable'],
        series: [{ name: 'Converted', values: [nontaxable, taxable] }],
        format: { format: 'currency' },
      },
      steps: [
        `Total IRA money: ${usd(pretax as number)} + ${usd(conv as number)} = ${usd(total)}`,
        `After-tax share: ${usd(basis as number)} ÷ ${usd(total)} = ${(share * 100).toFixed(2)}%`,
        `Non-taxable: ${usd(conv as number)} × ${(share * 100).toFixed(2)}% = ${usd(nontaxable)}`,
        `Taxable: ${usd(conv as number)} − ${usd(nontaxable)} = ${usd(taxable)}, tax ${usd(taxable)} × ${rate}% = ${usd(tax)}`,
      ],
      note: 'An estimate, not a replacement for Form 8606. It does not check income limits and uses the Dec 31 balance you enter. Rolling pre-tax IRA money into a 401(k) before year end (if your plan accepts it) can lower the pre-tax balance.',
    };
  },
  content: {
    formula: [
      'Total = pre-tax IRA balance on Dec 31 + amount converted',
      'After-tax share = basis ÷ total',
      'Non-taxable = amount converted × share; taxable = amount converted − non-taxable',
      'Tax = taxable × marginal rate',
    ],
    body: [
      'A backdoor Roth means making a nondeductible traditional IRA contribution and converting it to Roth. The IRS does not let you pick which dollars you convert: it treats all your traditional, SEP and SIMPLE IRAs as one pot and taxes the conversion in proportion. This is the pro-rata rule.',
      'The pot is measured on December 31. That is why late in the year is when people move pre-tax IRA money into an employer 401(k), if the plan accepts it, to shrink the pre-tax balance before the year ends.',
      'Enter the Dec 31 balance of your pre-tax IRAs without the converted amount, your basis from Form 8606, and the amount you convert. The calculator adds the converted amount back to get the total, as Form 8606 does.',
      'This is an estimate. It does not check income limits or state tax, and Form 8606 is what you actually file.',
    ],
    faq: [
      { q: 'What is the pro-rata rule?', a: 'The taxable part of a Roth conversion is based on all your pre-tax and after-tax IRA money together, not just the dollars you convert.' },
      { q: 'What is the tax in the example?', a: 'With $45,000 pre-tax, $7,000 basis and a $7,000 conversion, the total is $52,000 and the after-tax share is 13.46%. $942.31 is non-taxable, $6,057.69 is taxable, and at 24% the tax is $1,453.85.' },
      { q: 'What if I roll the $45,000 into a 401(k) first?', a: 'The pre-tax balance on Dec 31 becomes $0, so the share is 100% and the conversion is not taxed. Your plan must accept roll-ins.' },
      { q: 'Does a 401(k) balance count?', a: 'No. Only traditional, SEP and SIMPLE IRAs count in the pro-rata calculation.' },
      { q: 'Does this check income limits?', a: 'No. Roth conversions have no income limit, but it does not check eligibility for the contribution itself.' },
    ],
    sources: [
      { label: 'IRS: Instructions for Form 8606', url: 'https://www.irs.gov/instructions/i8606' },
    ],
  },
  related: ['roth-conversion', 'roth-ira', 'bracket-headroom'],
  examples: [
    // total 52000; share 7000/52000; nontaxable 942.3077; taxable 6057.6923; tax 1453.8462
    { values: { pretax: 45000, basis: 7000, conv: 7000, rate: 24 }, expect: { share: 7000 / 52000, nontaxable: 942.31, taxable: 6057.69, tax: 1453.85 }, tolerance: 0.01 },
    // nothing pre-tax: share 100%, tax 0
    { values: { pretax: 0, basis: 7000, conv: 7000, rate: 24 }, expect: { share: 1, taxable: 0, tax: 0 }, tolerance: 0.001 },
    // 13000 pretax + 7000 conv = 20000; basis 5000 -> share .25; nontaxable 1750; taxable 5250; tax at 22% = 1155
    { values: { pretax: 13000, basis: 5000, conv: 7000, rate: 22 }, expect: { share: 0.25, nontaxable: 1750, taxable: 5250, tax: 1155 }, tolerance: 0.01 },
  ],
});
