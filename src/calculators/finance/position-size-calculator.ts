import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'position-size-calculator',
  title: 'Position Size Calculator (Risk per Trade)',
  category: 'finance',
  description: 'Work out how many shares to buy so a stop-loss costs only a set percent of your account. Includes position value, risk and reward-to-risk ratio.',
  keywords: ['position size calculator', 'stock position size', 'risk per trade calculator', 'how many shares to buy', 'stop loss calculator', 'risk reward ratio'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'account', label: 'Account size', type: 'number', prefix: '$', default: 10000, min: 0, step: 100, info: 'The money you could trade with.' },
    { id: 'riskPct', label: 'Risk per trade', type: 'number', suffix: '%', default: 1, min: 0, max: 100, step: 0.25, info: 'The share of your account you accept losing if the stop is hit. Many traders use 1–2%.' },
    { id: 'entry', label: 'Entry price', type: 'number', prefix: '$', default: 50, min: 0, step: 0.01, info: 'The price you plan to buy (or short) at.' },
    { id: 'stop', label: 'Stop-loss price', type: 'number', prefix: '$', default: 48, min: 0, step: 0.01, info: 'The price where you exit to limit the loss. Below entry for a buy, above for a short.' },
    { id: 'target', label: 'Target price (optional)', type: 'number', prefix: '$', default: 56, min: 0, step: 0.01, info: 'Where you plan to take profit. Leave at 0 to skip the reward-to-risk ratio.' },
  ],
  outputs: [
    { id: 'shares', label: 'Shares to buy', format: 'number', precision: 0, primary: true, info: 'Whole shares, rounded down so the risk never goes over your limit.' },
    { id: 'riskAmount', label: 'Money at risk', format: 'currency', info: 'Shares × distance from entry to stop.' },
    { id: 'positionValue', label: 'Position value', format: 'currency', info: 'Shares × entry price.' },
    { id: 'pctOfAccount', label: 'Position as % of account', format: 'number', precision: 1, suffix: '%', info: 'Over 100% needs margin.' },
    { id: 'rr', label: 'Reward-to-risk ratio', format: 'number', precision: 2, suffix: ' : 1', info: 'Distance to target ÷ distance to stop.' },
  ],
  compute: (v) => {
    const account = num(v.account), riskPct = num(v.riskPct), entry = num(v.entry), stop = num(v.stop);
    const target = num(v.target) ?? 0;
    if (account === null || riskPct === null || entry === null || stop === null) return { shares: null };
    if (account <= 0 || riskPct <= 0 || entry <= 0 || stop <= 0 || entry === stop) return { shares: null };
    const budget = (account * riskPct) / 100;
    const perShare = Math.abs(entry - stop);
    const shares = Math.floor(budget / perShare + 1e-9);
    const riskAmount = shares * perShare;
    const positionValue = shares * entry;
    const long = stop < entry;
    const out: Record<string, unknown> = {
      shares,
      riskAmount,
      positionValue,
      pctOfAccount: (positionValue / account) * 100,
    };
    let rrNote = '';
    if (target > 0) {
      const goodSide = long ? target > entry : target < entry;
      if (goodSide) {
        const reward = Math.abs(target - entry);
        out.rr = reward / perShare;
        rrNote = ` Hitting the target would make ${money(shares * reward)}.`;
      } else {
        rrNote = ' The target is on the wrong side of your entry, so the ratio is skipped.';
      }
    }
    const steps = [
      `Risk budget = ${money(account, 0)} × ${riskPct}% = ${money(budget)}`,
      `Risk per share = |${money(entry)} − ${money(stop)}| = ${money(perShare)}`,
      `Shares = ${money(budget)} ÷ ${money(perShare)} = ${(budget / perShare).toFixed(2)}, rounded down to ${shares}`,
    ];
    const riskLevels = [0.5, 1, 1.5, 2, 2.5, 3];
    return {
      ...out,
      chart: {
        type: 'line',
        title: 'Shares you could buy at different risk levels',
        x: riskLevels,
        xLabel: 'Risk per trade (%)',
        yFormat: { format: 'number', precision: 0 },
        series: [{ name: 'Shares', values: riskLevels.map((r) => Math.floor((account * r) / 100 / perShare + 1e-9)) }],
      },
      steps,
      note: (shares === 0
        ? 'Your stop is too far away for this risk budget: not even one share fits.'
        : `${long ? 'Buying' : 'Shorting'} ${shares} shares risks ${money(riskAmount)} if the stop is hit.`) + rrNote,
    } as never;
  },
  content: {
    formula: ['Risk budget = account × risk %', 'Shares = risk budget ÷ |entry − stop|, rounded down', 'Reward-to-risk = |target − entry| ÷ |entry − stop|'],
    body: [
      'Position sizing answers one question: how many shares can I buy so that, if my stop-loss is hit, I lose only a set slice of my account? Fixing that slice, often 1% or 2% per trade, keeps one bad trade from doing real damage.',
      'For a $10,000 account risking 1% ($100), buying at $50 with a stop at $48 risks $2 a share, so the size is 100 ÷ 2 = 50 shares, a $2,500 position. If your target is $56, you stand to gain $6 for every $2 risked: a 3 : 1 reward-to-risk ratio.',
      'A tighter stop lets you buy more shares for the same dollar risk; a wider stop means fewer. The size comes from the stop, not from how much cash you have. Real losses can exceed the plan when prices gap past a stop, and fees and slippage are not included.',
      'This is a maths tool, not investment advice.',
    ],
    faq: [
      { q: 'How many shares should I buy?', a: 'Divide the money you are willing to lose by the gap between your entry and stop prices, then round down. This calculator does that for you.' },
      { q: 'What is a good risk per trade?', a: 'Many traders cap it at 1–2% of the account, but it is a personal choice. The calculator works with any percentage.' },
      { q: 'Does it work for short selling?', a: 'Yes. Put the stop above your entry and the calculator sizes a short position the same way. A short target sits below the entry.' },
      { q: 'Why can I lose more than the risk amount?', a: 'If the price gaps past your stop overnight or in a fast market, your exit fills at a worse price. Fees and slippage add to the loss too.' },
    ],
    sources: [
      { label: 'Position sizing (Investopedia)', url: 'https://www.investopedia.com/terms/p/positionsizing.asp' },
      { label: 'Risk/reward ratio (Investopedia)', url: 'https://www.investopedia.com/terms/r/riskrewardratio.asp' },
    ],
  },
  related: ['roi', 'break-even', 'average-cost-basis', 'tax-loss-harvesting', 'profit-margin'],
  examples: [
    { values: { account: 10000, riskPct: 1, entry: 50, stop: 48, target: 56 }, expect: { shares: 50, riskAmount: 100, positionValue: 2500, pctOfAccount: 25, rr: 3 }, tolerance: 1e-6 },
    { values: { account: 25000, riskPct: 2, entry: 120, stop: 114, target: 0 }, expect: { shares: 83, riskAmount: 498, positionValue: 9960 }, tolerance: 1e-6 },
    { values: { account: 10000, riskPct: 1, entry: 50, stop: 52, target: 44 }, expect: { shares: 50, riskAmount: 100, rr: 3 }, tolerance: 1e-6 },
  ],
});
