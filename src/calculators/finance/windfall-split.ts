import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'windfall-split',
  title: 'Windfall Split Calculator: Bonus, Refund, Gift',
  category: 'finance',
  description: 'Split a bonus, tax refund or cash gift into spend, save, invest and debt buckets by percentage, and see what the invested share could grow to in 10 years.',
  keywords: ['windfall calculator', 'bonus split calculator', 'what to do with a bonus', 'tax refund split', 'how to spend a windfall', 'save invest or pay debt'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'amount', label: 'Windfall amount', type: 'number', prefix: '$', default: 10000, min: 0, step: 100, info: 'The bonus, refund or gift before any tax is withheld. If it is already after tax, leave tax withheld at 0.' },
    { id: 'tax', label: 'Tax withheld', type: 'number', suffix: '%', default: 0, min: 0, max: 99, step: 1, optional: true, help: 'Leave at 0 if the amount is already after tax.', info: 'Share of the windfall taken as tax before you receive it. Use the bonus tax calculator to estimate it.' },
    { id: 'spend', label: 'Spend (fun, gifts)', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 5, info: 'Share you spend on something you want.' },
    { id: 'save', label: 'Save (emergency fund)', type: 'number', suffix: '%', default: 30, min: 0, max: 100, step: 5, info: 'Share that goes into savings you can reach quickly.' },
    { id: 'invest', label: 'Invest', type: 'number', suffix: '%', default: 30, min: 0, max: 100, step: 5, info: 'Share that goes into investments.' },
    { id: 'debt', label: 'Pay down debt', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 5, info: 'Share used to pay down debt faster than the minimum.' },
    { id: 'rate', label: 'Assumed yearly return on invested share', type: 'number', suffix: '%', default: 7, min: 0, max: 30, step: 0.5, help: 'An assumption, not a promise.', info: 'Annual return, compounded once a year. Real returns vary and can be negative.' },
  ],
  outputs: [
    { id: 'net', label: 'You keep (after tax)', format: 'currency', primary: true, info: 'Amount × (1 − tax withheld).' },
    { id: 'spendAmt', label: 'Spend', format: 'currency', info: 'Amount kept × spend %.' },
    { id: 'saveAmt', label: 'Save', format: 'currency', info: 'Amount kept × save %.' },
    { id: 'investAmt', label: 'Invest', format: 'currency', info: 'Amount kept × invest %.' },
    { id: 'debtAmt', label: 'Pay down debt', format: 'currency', info: 'Amount kept × debt %.' },
    { id: 'future', label: 'Invested share after 10 years', format: 'currency', info: 'Invest bucket × (1 + return)^10, at the assumed return.' },
  ],
  compute: (v) => {
    const amount = num(v.amount);
    const tax = num(v.tax) ?? 0;
    const sp = num(v.spend);
    const sv = num(v.save);
    const iv = num(v.invest);
    const db = num(v.debt);
    const rate = num(v.rate) ?? 0;
    if (amount === null || amount < 0 || sp === null || sv === null || iv === null || db === null) return { net: null };
    if (tax < 0 || tax >= 100 || sp < 0 || sv < 0 || iv < 0 || db < 0 || rate < 0) return { net: null };

    const total = sp + sv + iv + db;
    if (Math.abs(total - 100) > 1e-9) {
      const diff = 100 - total;
      return {
        net: null,
        error: `Your percentages add up to ${+total.toFixed(2)}%, not 100%. ${diff > 0 ? `Give the remaining ${+diff.toFixed(2)}% to a bucket` : `Take ${+(-diff).toFixed(2)}% out of a bucket`} so the split is complete.`,
      };
    }

    const net = amount * (1 - tax / 100);
    const spendAmt = net * (sp / 100);
    const saveAmt = net * (sv / 100);
    const investAmt = net * (iv / 100);
    const debtAmt = net * (db / 100);
    const factor = Math.pow(1 + rate / 100, 10);
    const future = investAmt * factor;
    const taxAmt = amount - net;

    return {
      net,
      spendAmt,
      saveAmt,
      investAmt,
      debtAmt,
      future,
      tone: 'good',
      badge: `${money(net, 0)} to allocate`,
      chart: [
        moneyDonut('Where the money goes', [
          { label: 'Spend', value: spendAmt },
          { label: 'Save', value: saveAmt },
          { label: 'Invest', value: investAmt },
          { label: 'Debt', value: debtAmt },
        ].filter((s) => s.value > 0), money(net, 0), 'to allocate'),
      ],
      steps: [
        ...(tax > 0 ? [`Kept after tax = ${money(amount, 2)} × (1 − ${tax}%) = ${money(net, 2)} (tax ${money(taxAmt, 2)})`] : []),
        `Spend = ${money(net, 2)} × ${sp}% = ${money(spendAmt, 2)}`,
        `Save = ${money(net, 2)} × ${sv}% = ${money(saveAmt, 2)}`,
        `Invest = ${money(net, 2)} × ${iv}% = ${money(investAmt, 2)}`,
        `Debt = ${money(net, 2)} × ${db}% = ${money(debtAmt, 2)}`,
        `Invested share in 10 years = ${money(investAmt, 2)} × (1 + ${rate}%)^10 = ${money(future, 2)}`,
      ],
      note: `Assuming a steady ${rate}% a year, which is an assumption and not a forecast, ${money(investAmt, 0)} invested today could grow to about ${money(future, 0)} in 10 years. This is a planning tool, not financial advice.`,
    };
  },
  content: {
    formula: [
      'Kept after tax = windfall × (1 − tax withheld %)',
      'Each bucket = kept after tax × bucket %',
      'Percentages must add up to 100',
      'Invested share after 10 years = invest bucket × (1 + return)^10',
    ],
    body: [
      'A bonus, tax refund or cash gift is easy to spend without noticing. Deciding the split before the money lands makes it easier to stick to. Enter the amount, say how much tax was withheld, and give each of four buckets a percentage: spend, save, invest and pay down debt.',
      'The default of 20% spend, 30% save, 30% invest and 20% debt is only a starting point, not a rule. If you have high-interest card debt, a bigger debt share often makes sense. If you have no emergency fund, put more into saving first.',
      'The percentages must add up to 100. If they do not, the calculator shows how far off you are instead of a result, so you never see numbers that do not add up to your windfall.',
      'The 10-year figure assumes a steady return, compounded once a year. Real investments go up and down, so treat it as an illustration. This is not financial advice.',
    ],
    sections: [
      {
        heading: 'Gross or after tax?',
        paragraphs: [
          'Bonuses are often taxed at a higher withholding rate than regular pay, so the amount that reaches you can be well below the headline number. Enter the headline amount and the tax percentage, or enter what you actually received and leave tax at 0.',
        ],
      },
    ],
    faq: [
      { q: 'How does the split work for $10,000 at 20/30/30/20?', a: 'With no tax withheld, spend is $2,000, save is $3,000, invest is $3,000 and debt is $2,000.' },
      { q: 'What would $3,000 invested grow to in 10 years?', a: 'At an assumed 7% a year compounded annually, $3,000 grows to about $5,901.45, which is $3,000 × 1.07^10. Actual returns will differ.' },
      { q: 'What if my percentages do not add up to 100?', a: 'The calculator shows a warning with how far off you are and no dollar amounts, so you can fix the split first.' },
      { q: 'How does tax withheld change the result?', a: 'The buckets are split from what you keep. On $5,000 with 20% withheld you keep $4,000, so a 25% bucket is $1,000.' },
      { q: 'Is the 7% return guaranteed?', a: 'No. It is an assumption you can change. Returns vary year to year and can be negative.' },
    ],
    sources: [
      { label: 'Investor.gov: Compound interest calculator', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
    ],
  },
  related: ['bonus-tax', 'compound-interest', 'emergency-fund', 'debt-payoff-planner', 'savings-goal'],
  examples: [
    {
      // 10,000 × 20% = 2,000; × 30% = 3,000; × 30% = 3,000; × 20% = 2,000. 3,000 × 1.07^10 = 3,000 × 1.967151 = 5,901.45.
      values: { amount: 10000, tax: 0, spend: 20, save: 30, invest: 30, debt: 20, rate: 7 },
      expect: { net: 10000, spendAmt: 2000, saveAmt: 3000, investAmt: 3000, debtAmt: 2000, future: 5901.45 },
      tolerance: 0.01,
    },
    {
      // 5,000 × (1 − 0.2) = 4,000; 25% each = 1,000; 1,000 × 1.05^10 = 1,628.89.
      values: { amount: 5000, tax: 20, spend: 25, save: 25, invest: 25, debt: 25, rate: 5 },
      expect: { net: 4000, spendAmt: 1000, saveAmt: 1000, investAmt: 1000, debtAmt: 1000, future: 1628.89 },
      tolerance: 0.01,
    },
  ],
});
