import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'prepay-property-tax',
  title: 'Prepay Property Tax Before Year End: Deduction Gain',
  seoTitle: 'Prepay Property Tax Deduction Calculator',
  metaDescription: 'See whether paying next year\'s property tax early adds to your deduction after the SALT cap and the standard deduction, and what it saves at your tax rate.',
  updated: '2026-11-25',
  category: 'finance',
  description: 'Work out the extra deduction and tax saved by prepaying property tax, after the SALT cap and the standard deduction.',
  keywords: ['prepay property tax deduction calculator', 'should i prepay property taxes', 'prepay property tax before year end', 'salt cap prepay property tax', 'property tax prepayment tax savings'],
  popular: false,
  inputs: [
    { id: 'standard', label: 'Standard deduction for your filing status', type: 'number', prefix: '$', default: 14600, min: 0, step: 100, info: 'Example figure only. Enter the current amount for your filing status and tax year from irs.gov.' },
    { id: 'otherItemized', label: 'Other itemized deductions (not state and local taxes)', type: 'number', prefix: '$', default: 9000, min: 0, step: 100, info: 'Mortgage interest, charity and anything else you itemize, excluding state and local taxes.' },
    { id: 'stateTax', label: 'Other state and local taxes already counted toward the cap', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, info: 'Usually state income tax or sales tax paid in the year.' },
    { id: 'propertyTax', label: 'Property tax you normally pay this year', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, info: 'The property tax you would pay this year without any prepayment.' },
    { id: 'prepaid', label: 'Extra amount prepaid from next year\'s bill', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, info: 'Only count tax your locality has actually assessed and lets you pay early.' },
    { id: 'cap', label: 'SALT deduction cap', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'Example figure only. Check the current limit for your filing status and income on irs.gov.' },
    { id: 'rate', label: 'Marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 60, step: 1, info: 'The rate on your last dollar of taxable income.' },
  ],
  outputs: [
    { id: 'taxSaved', label: 'Tax saved by prepaying', format: 'currency', precision: 0, primary: true, info: 'Extra deduction actually gained × your marginal rate.' },
    { id: 'gain', label: 'Extra deduction gained', format: 'currency', precision: 0, info: 'Deduction with prepay minus deduction without it, after the cap and the standard deduction.' },
    { id: 'wasted', label: 'Prepayment wasted by the cap', format: 'currency', precision: 0, info: 'The part of the prepayment that adds nothing to the SALT deduction because of the cap.' },
    { id: 'deductionWith', label: 'Your deduction with prepay', format: 'currency', precision: 0, info: 'The larger of the standard deduction and your itemized total with the prepayment.' },
  ],
  compute: (v) => {
    const standard = num(v.standard);
    const otherItemized = num(v.otherItemized);
    const stateTax = num(v.stateTax);
    const propertyTax = num(v.propertyTax);
    const prepaid = num(v.prepaid);
    const cap = num(v.cap);
    const rate = num(v.rate);
    if ([standard, otherItemized, stateTax, propertyTax, prepaid, cap, rate].some((x) => x === null)) return { taxSaved: null };
    const s = standard as number, o = otherItemized as number, st = stateTax as number, p = propertyTax as number, pre = prepaid as number, c = cap as number, r = rate as number;
    if (s < 0 || o < 0 || st < 0 || p < 0 || pre < 0 || c < 0) return { taxSaved: null, error: 'Amounts cannot be negative.' };
    if (r < 0 || r > 100) return { taxSaved: null, error: 'Enter a tax rate between 0% and 100%.' };

    const saltWithout = Math.min(c, st + p);
    const saltWith = Math.min(c, st + p + pre);
    const itemWithout = o + saltWithout;
    const itemWith = o + saltWith;
    const dedWithout = Math.max(s, itemWithout);
    const dedWith = Math.max(s, itemWith);
    const gain = dedWith - dedWithout;
    const taxSaved = gain * (r / 100);
    const wasted = pre - (saltWith - saltWithout);

    let note: string;
    let tone: 'good' | 'ok' | 'warn';
    let badge: string;
    if (pre === 0) {
      tone = 'ok'; badge = 'No prepayment entered';
      note = 'Enter an amount to prepay to see the effect.';
    } else if (gain > 0) {
      tone = 'good'; badge = 'Prepaying helps';
      note = `Prepaying ${money(pre, 0)} raises your deduction by ${money(gain, 0)}, worth about ${money(taxSaved, 0)} at ${r}%.${wasted > 0 ? ` The cap wastes ${money(wasted, 0)} of the prepayment.` : ''} The tax is only moved earlier, not avoided.`;
    } else if (itemWith <= s) {
      tone = 'warn'; badge = 'No gain: standard deduction still wins';
      note = `Even with the prepayment, itemizing (${money(itemWith, 0)}) does not beat the standard deduction (${money(s, 0)}), so prepaying changes your deduction by $0.`;
    } else {
      tone = 'warn'; badge = 'No gain: the cap blocks it';
      note = `Your state and local taxes already reach the ${money(c, 0)} cap, so the prepayment adds nothing to your deduction.`;
    }

    return {
      taxSaved,
      gain,
      wasted,
      deductionWith: dedWith,
      tone,
      badge,
      chart: {
        type: 'bar',
        title: 'Deduction without and with prepay',
        categories: ['Standard', 'Itemized, no prepay', 'Itemized, prepay'],
        series: [{ name: 'Deduction', values: [s, itemWithout, itemWith] }],
        format: CURRENCY,
        highlight: itemWith > Math.max(s, itemWithout) ? 2 : undefined,
      },
      steps: [
        `SALT counted without prepay = min(${money(c, 0)}, ${money(st, 0)} + ${money(p, 0)}) = ${money(saltWithout, 0)}`,
        `SALT counted with prepay = min(${money(c, 0)}, ${money(st + p + pre, 0)}) = ${money(saltWith, 0)}`,
        `Deduction without = max(${money(s, 0)}, ${money(itemWithout, 0)}) = ${money(dedWithout, 0)}; with = max(${money(s, 0)}, ${money(itemWith, 0)}) = ${money(dedWith, 0)}`,
        `Tax saved = ${money(gain, 0)} × ${r}% = ${money(taxSaved, 0)}`,
      ],
      note,
    };
  },
  content: {
    formula: [
      'SALT counted = smaller of (cap, other state and local taxes + property tax + prepayment)',
      'Itemized total = other itemized deductions + SALT counted',
      'Deduction = larger of (standard deduction, itemized total)',
      'Tax saved = (deduction with prepay − deduction without) × marginal rate',
    ],
    body: [
      'Paying part of next year\'s property tax before December 31 can pull a deduction into this year. It only pays off if two things are true: you would itemize anyway, and your state and local taxes are still under the cap. This calculator runs your numbers both ways and shows the difference.',
      'Example: standard deduction $14,600, other itemized $9,000, state income tax $5,000, property tax $3,000, prepayment $3,000, cap $10,000. Without prepaying, SALT is $8,000 and itemized is $17,000. With it, SALT hits the $10,000 cap (so $1,000 is wasted) and itemized is $19,000. The gain is $2,000, worth $440 at 22%.',
      'The standard deduction and the SALT cap both change over time and depend on your filing status and income. The defaults here are examples only. Enter the current figures from irs.gov.',
    ],
    sections: [
      {
        heading: 'When prepaying does nothing',
        paragraphs: [
          'If the standard deduction is still bigger than your itemized total after prepaying, the extra payment changes nothing. If your state and local taxes already reach the cap before you prepay, the whole prepayment is wasted. In both cases you have just paid the same tax a little earlier.',
        ],
      },
      {
        heading: 'Check the rules where you live',
        paragraphs: [
          'Many localities do not allow you to deduct property tax that has not yet been assessed, and paying early without a bill may not count. Only tax that is assessed and paid in the year is generally deductible. Ask your tax office or a tax professional before you pay.',
        ],
      },
      {
        heading: 'What this leaves out',
        paragraphs: [
          'The alternative minimum tax, state tax rules, income phase-outs and the effect on next year\'s taxes are not modelled. Prepaying also moves cash out of your hands earlier, and next year you will have less property tax left to deduct. This is general information, not tax advice.',
        ],
      },
    ],
    faq: [
      { q: 'Does prepaying property tax always lower my taxes?', a: 'No. With a $14,600 standard deduction, $4,000 of other itemized deductions, $5,000 state income tax, $3,000 property tax and a $3,000 prepayment under a $10,000 cap, itemized is $14,000 and the standard deduction still wins. The gain is $0.' },
      { q: 'How much does the SALT cap waste?', a: 'The part of the prepayment that pushes your state and local taxes past the cap. In that example, $5,000 + $3,000 + $3,000 = $11,000 against a $10,000 cap, so $1,000 is wasted.' },
      { q: 'How is the tax saved worked out?', a: 'The extra deduction actually gained times your marginal rate. With $9,000 of other itemized deductions, the deduction rises from $17,000 to $19,000, a $2,000 gain, which saves $440 at 22%.' },
      { q: 'What cap and standard deduction should I enter?', a: 'The current figures for your filing status and tax year, from irs.gov. The $10,000 cap and $14,600 standard deduction are examples, not official numbers for your year.' },
      { q: 'Can I prepay any property tax I want?', a: 'Not necessarily. Many localities do not allow you to prepay tax that has not been assessed, and you can only deduct what applies to the year. Check with your local tax office. The calculator does not check this.' },
    ],
    sources: [
      { label: 'IRS Topic No. 503, Deductible taxes', url: 'https://www.irs.gov/taxtopics/tc503' },
      { label: 'IRS Topic No. 501, Should I itemize?', url: 'https://www.irs.gov/taxtopics/tc501' },
      { label: 'IRS Publication 530, Tax Information for Homeowners', url: 'https://www.irs.gov/publications/p530' },
    ],
  },
  related: ['standard-vs-itemized', 'property-tax-appeal', 'income-tax', 'income-timing-tax-shift'],
  examples: [
    // without: SALT min(10000, 5000+3000)=8000, itemized 4000+8000=12000 -> standard 14600
    // with: SALT min(10000, 11000)=10000, itemized 14000 -> standard 14600; gain 0; wasted 3000-(10000-8000)=1000
    { values: { standard: 14600, otherItemized: 4000, stateTax: 5000, propertyTax: 3000, prepaid: 3000, cap: 10000, rate: 22 }, expect: { gain: 0, taxSaved: 0, wasted: 1000, deductionWith: 14600 }, tolerance: 1e-6 },
    // without: itemized 9000+8000=17000; with: 9000+10000=19000; gain 2000; saved 2000*0.22=440; wasted 1000
    { values: { standard: 14600, otherItemized: 9000, stateTax: 5000, propertyTax: 3000, prepaid: 3000, cap: 10000, rate: 22 }, expect: { gain: 2000, taxSaved: 440, wasted: 1000, deductionWith: 19000 }, tolerance: 1e-6 },
    // already over cap: SALT 12000+3000 -> 10000 both ways; gain 0; whole 2000 wasted
    { values: { standard: 14600, otherItemized: 9000, stateTax: 12000, propertyTax: 3000, prepaid: 2000, cap: 10000, rate: 22 }, expect: { gain: 0, taxSaved: 0, wasted: 2000, deductionWith: 19000 }, tolerance: 1e-6 },
  ],
});
