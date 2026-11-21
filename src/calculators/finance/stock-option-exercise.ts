import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'stock-option-exercise',
  title: 'Stock Option Exercise Calculator',
  category: 'finance',
  description: 'Work out what it costs to exercise your stock options and the paper gain (spread) before tax: cost, spread per share, position value and break-even.',
  keywords: ['stock option exercise calculator', 'cost to exercise stock options', 'option spread calculator', 'paper gain stock options', 'strike price vs fmv', 'exercise cost calculator', 'underwater options'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'options', label: 'Number of options', type: 'number', default: 10000, min: 0, step: 1, info: 'Total options in your grant. Each option lets you buy one share.' },
    { id: 'strike', label: 'Strike (exercise) price', type: 'number', prefix: '$', default: 2, min: 0, step: 0.01, info: 'The fixed price per share you pay to exercise. It is on your grant agreement.' },
    { id: 'fmv', label: 'Current fair market value (FMV) per share', type: 'number', prefix: '$', default: 10, min: 0, step: 0.01, info: 'What one share is worth now. For a private company this is usually the latest 409A valuation; for a public one, the market price.' },
    { id: 'vestPct', label: 'Vested portion', type: 'number', suffix: '%', default: 100, min: 0, max: 100, step: 1, optional: true, info: 'Share of your options that you can exercise today. Leave at 100 to use every option, or enter your vested percentage. Blank counts as 100.' },
    { id: 'sell', label: 'Future or sell price per share', type: 'number', prefix: '$', min: 0, step: 0.01, optional: true, info: 'Optional. A price you might sell at later. Leave blank to skip the sale result.' },
  ],
  outputs: [
    { id: 'spread', label: 'Spread (paper gain)', format: 'currency', primary: true, info: '(FMV − strike) × options you exercise. Negative means the options are underwater. This is before any tax.' },
    { id: 'cost', label: 'Cost to exercise', format: 'currency', info: 'Options you exercise × strike price. The cash you pay to buy the shares.' },
    { id: 'perShare', label: 'Spread per share', format: 'currency', info: 'FMV − strike for one share.' },
    { id: 'positionValue', label: 'Value of the shares', format: 'currency', info: 'Options you exercise × FMV: what the shares are worth at the current FMV.' },
    { id: 'breakEven', label: 'Break-even share price', format: 'currency', info: 'The price at which selling just covers the exercise cost, before tax and fees. It equals the strike price.' },
    { id: 'saleGain', label: 'Gain if sold at your price', format: 'currency', info: '(Sell price − strike) × options you exercise, before tax and fees. Shown only when you enter a sell price.' },
  ],
  compute: (v) => {
    const options = num(v.options), strike = num(v.strike), fmv = num(v.fmv);
    const vest = num(v.vestPct) ?? 100;
    const sell = num(v.sell);
    if (options === null || strike === null || fmv === null) return { spread: null };
    if (options <= 0 || strike < 0 || fmv < 0 || vest <= 0 || vest > 100 || (sell !== null && sell < 0)) return { spread: null };
    const shares = (options * vest) / 100;
    const cost = shares * strike;
    const perShare = fmv - strike;
    const spread = perShare * shares;
    const positionValue = shares * fmv;
    const saleGain = sell === null ? null : (sell - strike) * shares;
    const shareTxt = `${+shares.toFixed(4)}`;
    const steps = [
      `Options exercised = ${options} × ${vest}% = ${shareTxt}`,
      `Cost to exercise = ${shareTxt} × ${money(strike)} = ${money(cost)}`,
      `Spread per share = ${money(fmv)} − ${money(strike)} = ${money(perShare)}`,
      `Spread = ${money(perShare)} × ${shareTxt} = ${money(spread)}`,
      `Value of the shares = ${shareTxt} × ${money(fmv)} = ${money(positionValue)}`,
    ];
    if (saleGain !== null && sell !== null) steps.push(`Gain at ${money(sell)} = (${money(sell)} − ${money(strike)}) × ${shareTxt} = ${money(saleGain)}`);

    const top = Math.max(fmv, strike, sell ?? 0) || 1;
    const lo = 0, hi = top * 1.5;
    const xs = Array.from({ length: 7 }, (_, i) => Math.round(((hi - lo) * i) / 6 * 100) / 100);
    const underwater = perShare < 0;
    const atmoney = perShare === 0;
    return {
      spread,
      cost,
      perShare,
      positionValue,
      breakEven: strike,
      saleGain,
      tone: underwater ? 'bad' : atmoney ? 'warn' : 'good',
      badge: underwater ? 'Underwater' : atmoney ? 'At the money' : 'In the money',
      chart: {
        type: 'line',
        title: 'Gain or loss before tax at different share prices',
        x: xs,
        xLabel: 'Share price ($)',
        yFormat: { format: 'currency' },
        series: [{ name: 'Spread over cost', values: xs.map((p) => (p - strike) * shares) }],
      },
      steps,
      note: underwater
        ? `The FMV is below the strike, so exercising now would cost ${money(cost)} for shares worth ${money(positionValue)}, a ${money(-spread)} loss on paper. The options themselves are not negative: you simply would not exercise them.`
        : atmoney
          ? `FMV equals the strike. You would pay ${money(cost)} and have no paper gain yet. Taxes are not included.`
          : `You would pay ${money(cost)} to exercise and hold shares worth ${money(positionValue)}, a ${money(spread)} paper gain. Taxes are not included and can be large.`,
    } as never;
  },
  content: {
    formula: ['Options exercised = options × vested %', 'Cost to exercise = options exercised × strike price', 'Spread per share = FMV − strike price', 'Spread (paper gain) = (FMV − strike) × options exercised', 'Value of the shares = options exercised × FMV', 'Break-even price = strike price (before tax and fees)'],
    body: [
      'A stock option gives you the right to buy company shares at a fixed strike price. Exercising means paying that price. The difference between what the shares are worth (the fair market value, or FMV) and what you pay is called the spread, or paper gain.',
      'Take 10,000 options with a $2 strike and a $10 FMV. Exercising costs 10,000 × $2 = $20,000. The spread is ($10 − $2) × 10,000 = $80,000, and the shares are worth $100,000 at that FMV. It is a paper gain: you only keep it if you can sell the shares, which for a private company may not be possible for years.',
      'If the FMV is below the strike, the options are underwater. The spread is negative, and exercising would mean paying more than the shares are worth today. Most people would wait or let them expire rather than exercise.',
      'This calculator does not compute tax. Depending on the type of option and where you live, exercising can trigger ordinary income tax, the alternative minimum tax (AMT) or other charges, and these can be due even if you cannot sell. Rules change and depend on your situation, so check with a tax professional before you exercise.',
    ],
    faq: [
      { q: 'How much does it cost to exercise stock options?', a: 'Multiply the number of options you exercise by the strike price. For 10,000 options at a $2 strike, that is $20,000. Taxes and any broker fees are extra and are not included here.' },
      { q: 'What is the spread on stock options?', a: 'It is the FMV minus the strike price, multiplied by the options you exercise. With a $10 FMV and a $2 strike, the spread is $8 per share, or $80,000 for 10,000 options.' },
      { q: 'What does underwater mean?', a: 'The FMV is below the strike price. The spread comes out negative here, which shows what you would lose on paper by exercising now. The option itself is not worth less than nothing, because you are never forced to exercise.' },
      { q: 'What is the break-even price?', a: 'It is the strike price. If you exercise and sell at the strike, you get back exactly what you paid, before tax and fees. Above it you gain; below it you lose.' },
      { q: 'Does this calculator include taxes?', a: 'No. Tax on exercising, including ordinary income tax or AMT, varies by option type, country and your income. Talk to a tax professional before exercising.' },
      { q: 'What does the vested percentage do?', a: 'It scales the number of options to the share you can exercise now. At 50%, 10,000 options means 5,000 are used for the cost, spread and value results.' },
    ],
    sources: [
      { label: 'Stock options (Investopedia)', url: 'https://www.investopedia.com/terms/s/stockoption.asp' },
      { label: 'Strike price (Investopedia)', url: 'https://www.investopedia.com/terms/s/strikeprice.asp' },
    ],
  },
  related: ['rsu-tax', 'rsu-fire', 'stock-profit-calculator', 'capital-gains-tax', 'tax-loss-harvesting'],
  examples: [
    // 10,000 × $2 = 20,000 cost; ($10 − $2) × 10,000 = 80,000 spread; 10,000 × $10 = 100,000 value
    { values: { options: 10000, strike: 2, fmv: 10, vestPct: 100 }, expect: { cost: 20000, spread: 80000, perShare: 8, positionValue: 100000, breakEven: 2 }, tolerance: 1e-6 },
    // Underwater, 50% vested: 5,000 shares; cost 5,000 × 12 = 60,000; spread (8 − 12) × 5,000 = −20,000; value 5,000 × 8 = 40,000
    { values: { options: 10000, strike: 12, fmv: 8, vestPct: 50 }, expect: { cost: 60000, spread: -20000, perShare: -4, positionValue: 40000, breakEven: 12 }, tolerance: 1e-6 },
    // Sale at $15: (15 − 4) × 1,000 = 11,000; cost 4,000; spread 6,000
    { values: { options: 1000, strike: 4, fmv: 10, vestPct: 100, sell: 15 }, expect: { cost: 4000, spread: 6000, saleGain: 11000 }, tolerance: 1e-6 },
  ],
});
