import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const p1 = (f: number) => `${+(f * 100).toFixed(2)}%`;

export default defineCalculator({
  slug: 'covered-call-return',
  title: 'Covered Call Calculator: Premium Yield and Cap',
  category: 'finance',
  description: 'Selling a covered call? Enter price, strike, premium and days to see the premium yield, breakeven, maximum profit and how it compares with owning the stock.',
  keywords: ['covered call calculator', 'covered call return', 'covered call breakeven', 'covered call premium yield', 'covered call max profit'],
  updated: '2026-11-28',
  inputs: [
    { id: 'price', label: 'Stock purchase price per share', type: 'number', prefix: '$', default: 100, min: 0, step: 0.5, info: 'What you paid per share (or today\'s price if you are buying now).' },
    { id: 'shares', label: 'Shares', type: 'number', default: 100, min: 0, step: 100, info: 'One option contract covers 100 shares.' },
    { id: 'strike', label: 'Strike price', type: 'number', prefix: '$', default: 105, min: 0, step: 0.5, info: 'The price at which you agree to sell the shares.' },
    { id: 'premium', label: 'Premium per share', type: 'number', prefix: '$', default: 2.5, min: 0, step: 0.05, info: 'What the buyer pays you per share for the call.' },
    { id: 'days', label: 'Days to expiry', type: 'number', default: 30, min: 0, step: 1, info: 'Calendar days until the option expires.' },
    { id: 'exp', label: 'Stock price at expiry (what-if)', type: 'number', prefix: '$', default: 110, min: 0, step: 0.5, optional: true, info: 'Leave blank to skip the comparison with owning the stock alone.' },
  ],
  outputs: [
    { id: 'yield', label: 'Premium yield', format: 'percent', precision: 2, primary: true, info: 'Premium divided by the stock price, before any move in the stock.' },
    { id: 'premiumTotal', label: 'Premium collected', format: 'currency', info: 'Premium per share times shares.' },
    { id: 'breakeven', label: 'Breakeven price', format: 'currency', info: 'Purchase price minus premium. Below this at expiry you lose money.' },
    { id: 'maxProfit', label: 'Maximum profit', format: 'currency', info: '(Strike - price + premium) x shares, reached when the stock is at or above the strike.' },
    { id: 'calledReturn', label: 'Return if called away', format: 'percent', precision: 2, info: 'Maximum profit per share divided by the purchase price.' },
    { id: 'annualized', label: 'Simple annualized yield', format: 'percent', precision: 1, info: 'Premium yield x 365 ÷ days. A simple scale-up, not a forecast.' },
    { id: 'optProfit', label: 'Profit at expiry price (with call)', format: 'currency', info: '(min(expiry price, strike) - price + premium) x shares.' },
    { id: 'stockProfit', label: 'Profit at expiry price (stock only)', format: 'currency', info: '(expiry price - price) x shares.' },
  ],
  compute: (v) => {
    const price = num(v.price), sh = num(v.shares), k = num(v.strike), prem = num(v.premium), days = num(v.days), s = num(v.exp);
    if (price === null || sh === null || k === null || prem === null || days === null) return { yield: null };
    if (price <= 0 || sh <= 0 || k <= 0 || days <= 0) return { yield: null, error: 'Price, shares, strike and days must be above 0.' };
    if (prem < 0) return { yield: null, error: 'Premium cannot be negative.' };
    if (s !== null && s < 0) return { yield: null, error: 'Expiry price cannot be negative.' };
    const yld = prem / price;
    const premTotal = prem * sh;
    const breakeven = price - prem;
    const maxPer = k - price + prem;
    const maxProfit = maxPer * sh;
    const calledRet = maxPer / price;
    const ann = (yld * 365) / days;
    const out: Record<string, any> = { yield: yld, premiumTotal: premTotal, breakeven, maxProfit, calledReturn: calledRet, annualized: ann };
    const steps = [
      `Premium = ${usd(prem)} x ${sh} = ${usd(premTotal)}; yield = ${usd(prem)} ÷ ${usd(price)} = ${p1(yld)}`,
      `Breakeven = ${usd(price)} - ${usd(prem)} = ${usd(breakeven)}`,
      `Max profit = (${usd(k)} - ${usd(price)} + ${usd(prem)}) x ${sh} = ${usd(maxProfit)} (${p1(calledRet)})`,
      `Simple annualized = ${p1(yld)} x 365 ÷ ${days} = ${p1(ann)}`,
    ];
    let chart;
    if (s !== null) {
      const opt = (Math.min(s, k) - price + prem) * sh;
      const stock = (s - price) * sh;
      out.optProfit = opt;
      out.stockProfit = stock;
      steps.push(`At ${usd(s)}: with the call ${usd(opt)} (${p1(opt / (price * sh))}) versus stock only ${usd(stock)} (${p1(stock / (price * sh))})`);
      chart = {
        type: 'bar' as const,
        title: `Profit if the stock is ${usd(s)} at expiry`,
        categories: ['With covered call', 'Stock only'],
        series: [{ name: 'Profit', values: [opt, stock] }],
        format: { format: 'currency' as const },
        highlight: 0,
      };
    }
    return {
      ...out,
      tone: 'ok',
      badge: `Capped at ${p1(calledRet)}`,
      ...(chart ? { chart } : {}),
      steps,
      note: 'Education, not advice. Assignment can happen before expiry, dividends, fees and taxes are ignored, one contract covers 100 shares, and options carry real risk. Confirm the mechanics at theocc.com.',
    };
  },
  content: {
    formula: [
      'Premium yield = premium ÷ stock price',
      'Breakeven = stock price - premium',
      'Max profit per share = strike - stock price + premium',
      'Profit at expiry price S = (min(S, strike) - stock price + premium) x shares',
      'Simple annualized yield = premium yield x 365 ÷ days',
    ],
    body: [
      'A covered call means owning shares and selling someone the right to buy them at the strike price. You keep the premium either way. In return, your upside stops at the strike.',
      'The calculator shows the premium as a yield, the price where you break even, and the most you can make if the shares are called away. Add an expiry price to see how the position compares with simply holding the stock.',
      'The annualized figure just scales the premium to 365 days. Premiums and prices change, so do not treat it as a forecast.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A $100 stock, $105 strike and $2.50 premium on 100 shares collects $250, a 2.50% yield. Breakeven is $97.50 and the maximum profit is $750, a 7.50% return if called.' },
      { q: 'What is the annualized yield?', a: '2.5% x 365 ÷ 30 is about 30.4%. It assumes you could repeat the trade at the same premium all year, which is not guaranteed.' },
      { q: 'What if the stock rises to $110?', a: 'The call caps you at $750 (7.5%), while owning the stock alone would make $1,000. That forgone upside is the cost of the premium.' },
      { q: 'What if the stock falls to $95?', a: 'With the call you lose $250 (-2.5%). Stock only loses $500 (-5%). The premium cushions the fall but does not remove it.' },
    ],
    sources: [{ label: 'Options Clearing Corporation', url: 'https://www.theocc.com/' }],
  },
  related: ['dividend-calculator', 'yield-on-cost'],
  examples: [
    // premium 2.50/100 = 2.5% (0.025); total 250; breakeven 97.50; max (105-100+2.5)*100 = 750; 7.5/100 = 0.075
    // annualized 0.025*365/30 = 0.304167; at S=110: min(110,105)=105 -> 750; stock (110-100)*100 = 1000
    { values: { price: 100, shares: 100, strike: 105, premium: 2.5, days: 30, exp: 110 }, expect: { yield: 0.025, premiumTotal: 250, breakeven: 97.5, maxProfit: 750, calledReturn: 0.075, annualized: 0.304167, optProfit: 750, stockProfit: 1000 }, tolerance: 0.01 },
    // S=95: (95-100+2.5)*100 = -250; stock (95-100)*100 = -500
    { values: { price: 100, shares: 100, strike: 105, premium: 2.5, days: 30, exp: 95 }, expect: { optProfit: -250, stockProfit: -500 }, tolerance: 0.01 },
  ],
});
