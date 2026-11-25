import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut, pct } from '../../lib/helpers/finance';

const SE_FACTOR = 0.9235;

export default defineCalculator({
  slug: 'tax-set-aside',
  title: 'Freelance Tax Set-Aside Calculator',
  category: 'finance',
  description: 'Find out how much of each freelance invoice to set aside for self-employment, federal and state tax, and what you actually get to keep.',
  keywords: ['tax set aside calculator', 'how much to set aside for taxes freelance', '1099 tax per invoice', 'freelancer tax percentage', 'self employed tax set aside', 'quarterly tax savings'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'invoice', label: 'Invoice amount', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, info: 'The amount you were paid or billed, after business expenses you can tie to this job.' },
    { id: 'seRate', label: 'Self-employment tax rate', type: 'number', suffix: '%', default: 15.3, min: 0, max: 100, step: 0.1, help: 'The standard rate is 15.3%. It is applied to 92.35% of your net earnings.', info: 'Social Security 12.4% plus Medicare 2.9%. Set 0 if you owe none, for example on a very small side income.' },
    { id: 'fedRate', label: 'Federal income tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 0.5, help: 'Your marginal bracket, such as 12%, 22% or 24%.', info: 'The federal bracket your next dollar of income falls in.' },
    { id: 'stateRate', label: 'State income tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 0.1, optional: true, help: 'Use 0 for states without income tax.', info: 'A flat estimate of your state tax on this income.' },
    { id: 'perYear', label: 'Invoices per year', type: 'number', default: 12, min: 1, step: 1, optional: true, help: 'For the yearly total, assuming they are all this size.', info: 'How many invoices of this amount you expect in a year.' },
    { id: 'ytd', label: 'Invoiced so far this year', type: 'number', prefix: '$', min: 0, step: 500, optional: true, placeholder: '0', help: 'Optional. Gives a running total of what you should already hold in your tax account.', info: 'Total of all invoices this year to date.' },
  ],
  outputs: [
    { id: 'setAside', label: 'Set aside from this invoice', format: 'currency', primary: true, info: 'Invoice × (SE rate × 92.35% + federal rate + state rate).' },
    { id: 'takeHome', label: 'Yours to keep', format: 'currency', info: 'Invoice minus the set-aside.' },
    { id: 'effectiveRate', label: 'Set-aside share of the invoice', format: 'percent', precision: 2, info: 'Effective SE rate plus federal rate plus state rate.' },
    { id: 'yearly', label: 'Set aside per year', format: 'currency', info: 'Set-aside per invoice × invoices per year.' },
    { id: 'ytdSetAside', label: 'Should be saved so far', format: 'currency', info: 'Year-to-date invoiced total × the set-aside share.' },
  ],
  compute: (v) => {
    const invoice = num(v.invoice);
    const seRate = num(v.seRate);
    const fed = num(v.fedRate);
    if (invoice === null || invoice <= 0 || seRate === null || fed === null) return { setAside: null };
    const state = num(v.stateRate) ?? 0;
    const perYear = num(v.perYear) ?? 12;
    const ytd = Math.max(0, num(v.ytd) ?? 0);
    if (seRate < 0 || fed < 0 || state < 0 || perYear < 1) return { setAside: null };

    const effSE = (seRate * SE_FACTOR) / 100;
    const rate = effSE + fed / 100 + state / 100;
    if (rate > 1) return { setAside: null, error: 'These rates add up to more than 100% of the invoice. Check them.' };

    const seAmt = invoice * effSE;
    const fedAmt = (invoice * fed) / 100;
    const stateAmt = (invoice * state) / 100;
    const setAside = seAmt + fedAmt + stateAmt;
    const takeHome = invoice - setAside;
    const yearly = setAside * perYear;
    const ytdSetAside = ytd > 0 ? ytd * rate : null;

    let tone: 'good' | 'ok' | 'warn' | 'bad';
    if (rate < 0.25) tone = 'good';
    else if (rate < 0.35) tone = 'ok';
    else if (rate < 0.45) tone = 'warn';
    else tone = 'bad';

    return {
      setAside,
      takeHome,
      effectiveRate: rate,
      yearly,
      ytdSetAside,
      tone,
      badge: `Save ${pct(rate, 1)}`,
      chart: moneyDonut('Where this invoice goes', [
        { label: 'Yours to keep', value: takeHome },
        { label: 'Self-employment tax', value: seAmt },
        { label: 'Federal income tax', value: fedAmt },
        { label: 'State income tax', value: stateAmt },
      ], pct(1 - rate, 0), 'kept'),
      steps: [
        `Effective SE rate = ${+seRate.toFixed(4)}% × 92.35% = ${+(effSE * 100).toFixed(4)}%`,
        `Set-aside share = ${+(effSE * 100).toFixed(4)}% + ${+fed.toFixed(4)}% federal + ${+state.toFixed(4)}% state = ${+(rate * 100).toFixed(4)}%`,
        `Set aside = ${money(invoice)} × ${+(rate * 100).toFixed(4)}% = ${money(setAside)}`,
        `Take-home = ${money(invoice)} − ${money(setAside)} = ${money(takeHome)}`,
        `Per year = ${money(setAside)} × ${perYear} invoices = ${money(yearly)}`,
        ...(ytdSetAside !== null ? [`Running total = ${money(ytd)} × ${+(rate * 100).toFixed(4)}% = ${money(ytdSetAside)}`] : []),
      ],
      note: 'Simple flat-rate estimate. It does not model the deduction for half of SE tax, the QBI deduction, brackets, credits or the Social Security wage base. Not tax advice.',
    };
  },
  content: {
    formula: [
      'Effective SE rate = SE rate × 92.35%',
      'Set-aside share = effective SE rate + federal rate + state rate',
      'Set aside = invoice × set-aside share',
      'Take-home = invoice − set aside',
    ],
    body: [
      'When a client pays a freelance invoice in full, nothing has been withheld. This calculator turns your tax rates into a single number: the amount to move into a separate tax account each time you get paid, so the quarterly payment or April bill is already covered.',
      'Self-employment tax is 15.3% (12.4% Social Security plus 2.9% Medicare), but it applies to 92.35% of net earnings, so the effective rate on each dollar is 15.3% × 0.9235 = 14.13%. Federal and state income tax are added on top using the rates you enter.',
      'Every rate is an input, so you can match your own bracket and state. The estimate is deliberately simple and ignores the deduction for half of your SE tax and the qualified business income (QBI) deduction. Both would lower your real bill, which makes the result a cautious planning number.',
    ],
    sections: [
      {
        heading: 'Which federal rate should I use?',
        paragraphs: ['Use the bracket your extra income lands in, which is usually your marginal rate. If your freelance income is on top of a salary, that is often 22% or 24%. If freelancing is your only income, a lower figure such as 12% may fit.'],
      },
      {
        heading: 'Running total for the year',
        paragraphs: ['Enter what you have invoiced so far and the calculator multiplies it by the same set-aside share. Compare that to the balance in your tax account to see whether you are ahead or behind.'],
      },
    ],
    faq: [
      { q: 'How much of a $5,000 invoice should I set aside?', a: 'With 15.3% SE tax, 22% federal and 5% state: the effective SE rate is 15.3% × 92.35% = 14.12955%, so the set-aside share is 14.12955% + 22% + 5% = 41.12955%. On $5,000 that is $2,056.48, leaving $2,943.52 to keep.' },
      { q: 'Why is the SE rate 14.13% and not 15.3%?', a: 'SE tax is charged on 92.35% of your net earnings, so each dollar of income is taxed at 15.3% × 0.9235 = 14.12955%.' },
      { q: 'How much per year if I send 12 invoices of $5,000?', a: 'Using the same rates, $2,056.48 × 12 = $24,677.73 set aside across the year, out of $60,000 invoiced.' },
      { q: 'Does this include the half SE-tax deduction or QBI?', a: 'No. Neither is modelled, so the real tax is often a bit lower than the figure shown.' },
      { q: 'Is this a substitute for estimated tax payments?', a: 'No. It tells you how much to save. You still pay the IRS through quarterly estimated payments or when you file.' },
    ],
    sources: [
      { label: 'IRS Publication 505: Tax Withholding and Estimated Tax', url: 'https://www.irs.gov/publications/p505' },
      { label: 'IRS: About Schedule SE (Form 1040)', url: 'https://www.irs.gov/forms-pubs/about-schedule-se-form-1040' },
      { label: 'IRS: Self-employment tax', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes' },
    ],
  },
  related: ['self-employment-tax', 'estimated-tax-safe-harbor', 'freelance-rate', 'income-tax', 'take-home-pay', 'w2-to-contractor-rate'],
  examples: [
    {
      // effSE = 15.3 × 0.9235 = 14.12955%; share = 14.12955 + 22 + 5 = 41.12955% (0.4112955).
      // set aside = 5000 × 0.4112955 = 2056.4775; take-home = 2943.5225; yearly = 2056.4775 × 12 = 24677.73.
      values: { invoice: 5000, seRate: 15.3, fedRate: 22, stateRate: 5, perYear: 12, ytd: null },
      expect: { setAside: 2056.4775, takeHome: 2943.5225, effectiveRate: 0.4112955, yearly: 24677.73 },
      tolerance: 1e-6,
    },
    {
      // share = 14.12955 + 12 + 0 = 26.12955% (0.2612955).
      // set aside = 1000 × 0.2612955 = 261.2955; take-home = 738.7045; yearly = 261.2955 × 4 = 1045.182; ytd = 8000 × 0.2612955 = 2090.364.
      values: { invoice: 1000, seRate: 15.3, fedRate: 12, stateRate: 0, perYear: 4, ytd: 8000 },
      expect: { setAside: 261.2955, takeHome: 738.7045, yearly: 1045.182, ytdSetAside: 2090.364 },
      tolerance: 1e-6,
    },
  ],
});
