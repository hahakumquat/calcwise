import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'stock-profit-calculator',
  title: 'Stock Profit Calculator (Gain, Fees and Tax)',
  category: 'finance',
  description: 'Work out the profit or loss on a stock trade after fees and tax: gain in dollars, return percent and the break-even sell price.',
  keywords: ['stock profit calculator', 'stock gain calculator', 'stock return calculator', 'break even sell price', 'trade profit after fees', 'capital gains on stock'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'shares', label: 'Number of shares', type: 'number', default: 100, min: 0, step: 1, info: 'How many shares you bought and sold.' },
    { id: 'buy', label: 'Buy price per share', type: 'number', prefix: '$', default: 50, min: 0, step: 0.01, info: 'What you paid for each share.' },
    { id: 'sell', label: 'Sell price per share', type: 'number', prefix: '$', default: 60, min: 0, step: 0.01, info: 'Use the price you sold at, or the price you are thinking of selling at.' },
    { id: 'fee', label: 'Fee per trade', type: 'number', prefix: '$', default: 5, min: 0, step: 0.5, info: 'Charged once when you buy and once when you sell. Many brokers charge $0.' },
    { id: 'taxPct', label: 'Tax rate on gains', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 1, info: 'Your own rate. Leave at 0 to ignore tax. Losses are treated as having no tax effect here.' },
  ],
  outputs: [
    { id: 'afterTax', label: 'Profit after fees and tax', format: 'currency', primary: true, info: 'Gain minus both fees, minus tax if you made a profit.' },
    { id: 'gross', label: 'Gain before fees', format: 'currency', info: 'Shares × (sell − buy).' },
    { id: 'fees', label: 'Total fees', format: 'currency', info: 'Buy fee plus sell fee.' },
    { id: 'tax', label: 'Tax owed', format: 'currency', info: 'Tax rate × profit after fees, never below zero.' },
    { id: 'returnPct', label: 'Return after fees and tax', format: 'number', precision: 2, suffix: '%', info: 'Profit after tax ÷ money you paid in (shares × buy price + buy fee).' },
    { id: 'breakEven', label: 'Break-even sell price', format: 'currency', info: 'The sell price where fees are covered and you make exactly nothing.' },
  ],
  compute: (v) => {
    const shares = num(v.shares), buy = num(v.buy), sell = num(v.sell);
    const fee = num(v.fee) ?? 0, taxPct = num(v.taxPct) ?? 0;
    if (shares === null || buy === null || sell === null) return { afterTax: null };
    if (shares <= 0 || buy <= 0 || sell < 0 || fee < 0 || taxPct < 0) return { afterTax: null };
    const gross = shares * (sell - buy);
    const fees = 2 * fee;
    const net = gross - fees;
    const tax = net > 0 ? (net * taxPct) / 100 : 0;
    const afterTax = net - tax;
    const invested = shares * buy + fee;
    const returnPct = (afterTax / invested) * 100;
    const breakEven = buy + fees / shares;
    const steps = [
      `Gain before fees = ${shares} × (${money(sell)} − ${money(buy)}) = ${money(gross)}`,
      `Fees = 2 × ${money(fee)} = ${money(fees)}, so profit after fees = ${money(net)}`,
      `Tax = ${taxPct}% × ${money(Math.max(net, 0))} = ${money(tax)}`,
      `Return = ${money(afterTax)} ÷ ${money(invested)} = ${returnPct.toFixed(2)}%`,
    ];
    const lo = Math.max(0, Math.min(buy, sell) * 0.8), hi = Math.max(buy, sell) * 1.2 || 1;
    const xs = Array.from({ length: 7 }, (_, i) => lo + ((hi - lo) * i) / 6);
    const profitAt = (p: number) => {
      const n = shares * (p - buy) - fees;
      return n - (n > 0 ? (n * taxPct) / 100 : 0);
    };
    return {
      afterTax,
      gross,
      fees,
      tax,
      returnPct,
      breakEven,
      chart: {
        type: 'line',
        title: 'Profit after fees and tax at different sell prices',
        x: xs.map((x) => Math.round(x * 100) / 100),
        xLabel: 'Sell price ($)',
        yFormat: { format: 'currency', precision: 0 },
        series: [{ name: 'Profit', values: xs.map(profitAt) }],
      },
      steps,
      note: afterTax >= 0
        ? `You keep ${money(afterTax)} of a ${money(gross)} gain. Fees and tax took ${money(gross - afterTax)}.`
        : `This trade loses ${money(-afterTax)}. You would need to sell at ${money(breakEven)} just to cover fees.`,
    } as never;
  },
  content: {
    formula: ['Gain = shares × (sell − buy)', 'Profit after fees = gain − 2 × fee per trade', 'Tax = tax rate × profit after fees (if positive)', 'Return = profit after tax ÷ (shares × buy + buy fee)', 'Break-even sell price = buy + total fees ÷ shares'],
    body: [
      'A stock trade looks simple: sell for more than you paid. But fees on both sides and tax on any profit shrink what you actually keep. This calculator shows the full picture in one go.',
      'Take 100 shares bought at $50 and sold at $60 with a $5 fee each way. The gain before fees is $1,000. Fees are $10, leaving $990. At a 15% tax rate, tax is $148.50, so you keep $841.50. You paid in $5,005 (including the buy fee), so the return is 16.81%.',
      'The break-even price tells you how far the stock must rise before the trade makes money. With $10 of total fees on 100 shares, that is $50.10, ten cents above your buy price.',
      'Tax rules depend on your country, how long you held the shares and your income, so enter the rate that applies to you. This tool does not model loss offsets, and it is a maths tool, not tax or investment advice.',
    ],
    faq: [
      { q: 'How do I calculate profit on a stock?', a: 'Multiply the number of shares by the difference between the sell and buy price, then subtract fees and any tax. This calculator does all three steps.' },
      { q: 'What is the break-even sell price?', a: 'It is the buy price plus total fees divided by shares. Selling above it makes a profit before tax; selling below it loses money.' },
      { q: 'Is the return based on the price or my total cost?', a: 'On your total cost: shares × buy price plus the buy fee. That is the money that actually left your account.' },
      { q: 'What happens if I lose money?', a: 'No tax is charged in this calculator on a loss, and the result shows the loss after fees. In real life, capital losses can often offset other gains, which is not modelled here.' },
    ],
    sources: [
      { label: 'Capital gains and losses (IRS Topic 409)', url: 'https://www.irs.gov/taxtopics/tc409' },
      { label: 'Capital gains (Investopedia)', url: 'https://www.investopedia.com/terms/c/capitalgain.asp' },
    ],
  },
  related: ['roi', 'average-cost-basis', 'capital-gains-tax', 'position-size-calculator', 'tax-loss-harvesting'],
  examples: [
    { values: { shares: 100, buy: 50, sell: 60, fee: 5, taxPct: 15 }, expect: { afterTax: 841.5, gross: 1000, fees: 10, tax: 148.5, returnPct: 16.813186813, breakEven: 50.1 }, tolerance: 1e-6 },
    { values: { shares: 10, buy: 20, sell: 18, fee: 0, taxPct: 15 }, expect: { afterTax: -20, tax: 0, returnPct: -10, breakEven: 20 }, tolerance: 1e-6 },
  ],
});
