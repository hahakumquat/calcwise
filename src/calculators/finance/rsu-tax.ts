import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, moneyDonut } from '../../lib/helpers/finance';
import {
  asStatus,
  federalIncomeTax,
  ficaTax,
  FILING_STATUS_OPTIONS,
  money,
  pct,
  STANDARD_DEDUCTION,
  SUPPLEMENTAL_HIGH_THRESHOLD,
  SUPPLEMENTAL_RATE,
  SUPPLEMENTAL_RATE_HIGH,
  TAX_YEAR,
} from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'rsu-tax',
  title: 'RSU Tax Calculator',
  category: 'finance',
  description: 'Estimate the tax on vesting RSUs and whether the standard 22% or 37% withholding will leave you owing more at tax time.',
  keywords: ['RSU', 'restricted stock units', 'RSU withholding', 'supplemental wages', 'stock compensation tax', 'vesting tax', 'sell to cover', 'under-withholding'],
  inputs: [
    { id: 'shares', label: 'Shares vesting', type: 'number', default: 500, min: 0, step: 1, info: 'The number of shares vesting, before any are sold or withheld for taxes. Your equity portal shows it.' },
    { id: 'price', label: 'Share price at vest', type: 'number', prefix: '$', default: 150, min: 0, step: 0.01, info: 'The share\'s market value on the vest date, which sets your taxable income.' },
    { id: 'wages', label: 'Other taxable income this year', type: 'number', prefix: '$', default: 150000, min: 0, step: 1000, help: 'Salary and bonus after pre-tax 401(k)/benefits, excluding this vest.', info: 'Your other taxable income this year: salary and bonus after pre-tax 401(k) and benefits, excluding this vest.' },
    { id: 'status', label: 'Filing status', type: 'select', default: 'single', options: FILING_STATUS_OPTIONS, info: 'Your federal filing status. It sets your brackets and standard deduction.' },
    { id: 'ytdSupplemental', label: 'Supplemental wages already paid this year', type: 'number', prefix: '$', min: 0, optional: true, placeholder: '0', help: 'Earlier RSU vests and bonuses. Above $1M, withholding jumps to 37%.', info: 'Bonuses and RSU income already paid this calendar year. Supplemental pay above $1 million is withheld at 37%.' },
    { id: 'stateRate', label: 'State income tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.1, optional: true, help: 'Your estimated marginal state rate.', info: 'Your marginal state income tax rate on this extra income. Leave 0 for states without income tax.' },
    { id: 'stateWithholding', label: 'State withholding rate on RSUs', type: 'number', suffix: '%', min: 0, max: 20, step: 0.1, optional: true, placeholder: 'Same as state rate', help: 'Many states have a flat supplemental rate; check your vest statement.', info: 'The rate your employer withholds for state tax on RSUs, from your vest statement. Leave blank to assume it matches your state rate.' },
  ],
  outputs: [
    { id: 'shortfall', label: 'Estimated extra tax owed at filing', format: 'currency', primary: true, help: 'Negative means you were over-withheld and may get it back.', info: 'Estimated federal and state tax due on the vest beyond what was withheld. Plan to pay this at filing or by estimated payments.' },
    { id: 'vestValue', label: 'Vest value (taxable income)', format: 'currency', info: 'Shares × price at vest. This amount is added to your W-2 wages.' },
    { id: 'fedWithheld', label: 'Federal withheld at vest', format: 'currency', info: 'Federal income tax withheld at the flat supplemental rate: 22%, or 37% above $1 million.' },
    { id: 'fedOwed', label: 'Actual federal tax on the vest', format: 'currency', info: 'The extra federal tax the vest really adds, computed with your brackets.' },
    { id: 'effectiveFed', label: 'Federal rate on the vest', format: 'percent', precision: 2, info: 'Actual federal tax on the vest as a share of its value. Above 22% means withholding falls short.' },
    { id: 'marginal', label: 'Your top federal bracket', format: 'percent', precision: 0, info: 'Your top federal bracket once the vest is included.' },
    { id: 'stateWithheld', label: 'State withheld', format: 'currency', info: 'State income tax withheld at vest.' },
    { id: 'stateOwed', label: 'Estimated state tax on the vest', format: 'currency', info: 'Estimated state income tax on the vest at your state rate.' },
    { id: 'fica', label: 'Social Security & Medicare on the vest', format: 'currency', info: 'Social Security and Medicare on the vest. Social Security stops once total wages pass the yearly wage base.' },
    { id: 'sellToCover', label: 'Shares sold to cover withholding (approx.)', format: 'integer', info: 'Approximate shares sold or held back to pay the withholding, rounded up.' },
  ],
  compute: (v) => {
    const shares = num(v.shares);
    const price = num(v.price);
    const wages = num(v.wages);
    if (shares === null || price === null || wages === null || shares < 0 || price < 0 || wages < 0) return { shortfall: null };
    const status = asStatus(v.status);
    const vest = shares * price;
    const ytd = num(v.ytdSupplemental) ?? 0;
    // Supplemental withholding: 22% until year-to-date supplemental wages reach $1M, 37% beyond.
    const roomAt22 = Math.max(0, SUPPLEMENTAL_HIGH_THRESHOLD - ytd);
    const at22 = Math.min(vest, roomAt22);
    const fedWithheld = at22 * SUPPLEMENTAL_RATE + (vest - at22) * SUPPLEMENTAL_RATE_HIGH;
    // Actual federal tax caused by the vest = tax with it − tax without it (standard deduction).
    const std = STANDARD_DEDUCTION[status];
    const before = federalIncomeTax(wages - std, status);
    const after = federalIncomeTax(wages + vest - std, status);
    const fedOwed = after.tax - before.tax;
    const stateRate = (num(v.stateRate) ?? 0) / 100;
    const stateWhRate = num(v.stateWithholding) === null ? stateRate : (num(v.stateWithholding) as number) / 100;
    const stateOwed = vest * stateRate;
    const stateWithheld = vest * stateWhRate;
    const ficaBefore = ficaTax(wages, status);
    const ficaAfter = ficaTax(wages + vest, status);
    const fica = ficaAfter.socialSecurity + ficaAfter.medicare - ficaBefore.socialSecurity - ficaBefore.medicare;
    const shortfall = fedOwed - fedWithheld + (stateOwed - stateWithheld);
    return {
      shortfall,
      vestValue: vest,
      fedWithheld,
      fedOwed,
      effectiveFed: vest > 0 ? fedOwed / vest : 0,
      marginal: after.marginal,
      stateWithheld,
      stateOwed,
      fica,
      sellToCover: price > 0 ? Math.ceil((fedWithheld + stateWithheld + fica) / price) : 0,
      chart: [{ type: 'bar', title: 'Withheld vs actually owed', categories: ['Federal', 'State'], series: [{ name: 'Withheld', values: [fedWithheld, stateWithheld] }, { name: 'Owed', values: [fedOwed, stateOwed] }], format: CURRENCY }, moneyDonut('Where the vest value goes', [{ label: 'Federal tax', value: fedOwed }, { label: 'State tax', value: stateOwed }, { label: 'Social Security & Medicare', value: fica }, { label: 'You keep', value: vest - fedOwed - stateOwed - fica }])],
      steps: [
        `Vest value = ${shares} × ${money(price)} = ${money(vest)}`,
        `Federal withheld = ${money(at22)} × 22%${vest > at22 ? ` + ${money(vest - at22)} × 37%` : ''} = ${money(fedWithheld)}`,
        `Federal tax on ${money(wages + vest - std, 0)} taxable = ${money(after.tax)}; without the vest = ${money(before.tax)}`,
        `Actual federal tax on the vest = ${money(fedOwed)} (${pct(vest > 0 ? fedOwed / vest : 0)})`,
        `State: owed ${money(stateOwed)} − withheld ${money(stateWithheld)} = ${money(stateOwed - stateWithheld)}`,
        `Shortfall = (${money(fedOwed)} − ${money(fedWithheld)}) + (${money(stateOwed)} − ${money(stateWithheld)}) = ${money(shortfall)}`,
      ],
      note:
        shortfall > 0
          ? `Withholding falls about ${money(shortfall, 0)} short. Consider setting that aside, making an estimated payment, or raising W-4 withholding. Tax year ${TAX_YEAR} estimate — not tax advice.`
          : `Withholding should roughly cover the tax on this vest (${money(-shortfall, 0)} over). Tax year ${TAX_YEAR} estimate — not tax advice.`,
    };
  },
  content: {
    formula: [
      'Vest value = shares × price at vest (taxed as ordinary wages)',
      'Withheld = 22% × supplemental wages up to $1M + 37% × the excess',
      'Actual tax = tax(other income + vest − deduction) − tax(other income − deduction)',
      'Shortfall = actual tax − withheld (federal + state)',
    ],
    body: [
      'When restricted stock units vest, the full market value of the shares becomes ordinary income, exactly like a cash bonus. Your employer must withhold tax, usually by selling some of the shares ("sell to cover") or keeping back shares ("net settlement").',
      'For federal income tax, most employers use the flat supplemental-wage rate: 22% on supplemental pay up to $1 million in the calendar year and 37% on anything above that. The problem is that 22% is often lower than the tax you really owe. If your salary already puts you in the 24%, 32% or 35% bracket, every vested dollar is taxed at that higher rate when you file, and the gap shows up as a balance due in April.',
      `This calculator estimates the true federal tax caused by the vest by computing your ${TAX_YEAR} tax with and without it, using the standard deduction for your filing status, and compares that with the 22%/37% withholding. State tax is estimated with a flat rate you enter. It is an estimate, not tax advice: it ignores itemized deductions, credits, other investment income and the Additional Medicare Tax true-up.`,
      'Social Security and Medicare are also withheld on RSU income. Social Security stops once your total wages for the year reach the annual wage base, which is why late-year vests for high earners often have less taken out. These payroll taxes are usually withheld correctly, so they are shown but not counted in the shortfall.',
    ],
    faq: [
      { q: 'Do I pay tax again when I sell the shares?', a: 'Only on the change in value after vesting. Your cost basis is the price at vest. If you sell right away there is little or no extra gain; if you hold, the later gain or loss is a capital gain — long-term if held more than a year after vesting.' },
      { q: 'Can I ask my employer to withhold more?', a: 'Some employers let you choose a higher supplemental rate for RSUs. If not, you can raise withholding on your regular paycheck through your W-4, or make quarterly estimated tax payments.' },
      { q: 'Will I get a penalty for under-withholding?', a: 'You generally avoid the federal underpayment penalty if withholding and estimated payments cover at least 90% of this year\'s tax or 100% of last year\'s (110% if your prior-year AGI was over $150,000). Large vests can break that, so plan ahead.' },
    ],
  },
  related: ['income-tax', 'take-home-pay', 'net-worth', 'investment'],
  examples: [
    {
      values: { shares: 500, price: 150, wages: 150000, status: 'single', ytdSupplemental: null, stateRate: 5, stateWithholding: null },
      expect: { vestValue: 75000, fedWithheld: 16500, fedOwed: 18570, shortfall: 2070, marginal: 0.32 },
    },
    {
      values: { shares: 1000, price: 100, wages: 0, status: 'mfj', ytdSupplemental: 950000, stateRate: 0, stateWithholding: 0 },
      expect: { fedWithheld: 29500 },
    },
  ],
});
