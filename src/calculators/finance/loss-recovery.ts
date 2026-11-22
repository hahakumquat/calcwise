import { defineCalculator } from '../../lib/types';
import type { ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

/** Gain needed (as a fraction) to get back to even after losing `loss` (a fraction, 0 < loss < 1). */
const gainNeeded = (loss: number) => 1 / (1 - loss) - 1;

const TABLE = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export default defineCalculator({
  slug: 'loss-recovery',
  title: 'Loss Recovery Calculator',
  category: 'finance',
  description: 'Find the gain you need to get back to even after a loss: down 50% needs +100%. Add an assumed yearly return to see how long recovery could take.',
  keywords: ['loss recovery calculator', 'gain needed to recover loss', 'percent gain to break even', 'drawdown recovery calculator', 'down 50 percent need 100', 'how much gain to recover from a loss'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'loss', label: 'Loss', type: 'number', suffix: '%', default: 30, min: 0.01, max: 99.99, step: 1, info: 'How far your investment or balance fell from its peak, as a percentage. It must be above 0 and below 100.' },
    { id: 'ret', label: 'Assumed annual return (optional)', type: 'number', suffix: '%', default: 7, min: 0, max: 100, step: 0.5, info: 'A steady yearly return used only for the time estimate. It is an assumption, not a forecast. Leave it blank, or enter 0, to skip the time.' },
  ],
  outputs: [
    { id: 'gain', label: 'Gain needed to get back to even', format: 'percent', precision: 2, primary: true, info: '1 ÷ (1 − loss) − 1. The percentage rise from the lower value that returns you to where you started.' },
    { id: 'multiple', label: 'Multiple of today\'s value', format: 'number', precision: 3, suffix: '×', info: 'How many times today\'s value you need to reach. After a 50% loss it is 2×.' },
    { id: 'years', label: 'Years to recover', format: 'number', precision: 1, suffix: 'years', info: 'ln(1 ÷ (1 − loss)) ÷ ln(1 + return). Needs a return above 0, and assumes the same return every year with no deposits or withdrawals.' },
  ],
  compute: (v) => {
    const lossPct = num(v.loss);
    if (lossPct === null) return { gain: null };
    if (lossPct <= 0) return { gain: null, error: 'Enter a loss above 0%.' };
    if (lossPct >= 100) return { gain: null, error: 'A loss of 100% or more cannot be recovered by any percentage gain.' };
    const retPct = num(v.ret);
    const loss = lossPct / 100;
    const gain = gainNeeded(loss);
    const multiple = 1 / (1 - loss);
    const years = retPct !== null && retPct > 0 ? Math.log(multiple) / Math.log(1 + retPct / 100) : null;

    const highlight = TABLE.indexOf(lossPct);
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Gain needed to get back to even, by size of loss',
      categories: TABLE.map((t) => `-${t}%`),
      series: [{ name: 'Gain needed', values: TABLE.map((t) => +(gainNeeded(t / 100) * 100).toFixed(2)) }],
      format: { format: 'number', suffix: '%' },
      ...(highlight >= 0 ? { highlight } : {}),
    };

    const tone = lossPct < 20 ? 'good' : lossPct < 40 ? 'ok' : lossPct < 60 ? 'warn' : 'bad';
    const badge = lossPct < 20 ? 'A short climb back' : lossPct < 40 ? 'A steady climb back' : lossPct < 60 ? 'A long climb back' : 'A very steep climb back';

    return {
      gain,
      multiple,
      years,
      tone,
      badge,
      chart,
      steps: [
        `Start at 100 and lose ${fmt(lossPct)}%: you are left with ${fmt(100 - lossPct)}`,
        `To return to 100 from ${fmt(100 - lossPct)} you need 100 ÷ ${fmt(100 - lossPct)} = ${fmt(multiple, 4)}×, which is a gain of ${fmt(gain * 100)}%`,
        years === null
          ? 'Add an assumed annual return above 0% to estimate the time to recover'
          : `At ${fmt(retPct as number)}% a year: ln(${fmt(multiple, 4)}) ÷ ln(${fmt(1 + (retPct as number) / 100, 4)}) = ${fmt(years)} years`,
        `Other losses: ${TABLE.map((t) => `-${t}% needs +${fmt(gainNeeded(t / 100) * 100)}%`).join('; ')}`,
      ],
      note: `A ${fmt(lossPct)}% loss needs a ${fmt(gain * 100)}% gain to get back to even, because the gain is measured from a smaller amount.${years === null ? '' : ` At a steady ${fmt(retPct as number)}% a year that would take about ${fmt(years, 1)} years, if returns were that smooth, which real markets are not.`}`,
    };
  },
  content: {
    formula: [
      'Gain needed = 1 ÷ (1 − loss) − 1, with the loss written as a fraction (30% = 0.30)',
      'Years to recover = ln(1 ÷ (1 − loss)) ÷ ln(1 + annual return), for a return above 0',
      'Both assume nothing is added or withdrawn while you recover',
    ],
    body: [
      'Percentages are always measured from the amount you have at the time. If $100 falls by 50% you have $50, and a 50% gain on $50 is only $75. To get back to $100 you need to double the $50, which is a 100% gain. The bigger the loss, the more lopsided this gets.',
      'A 10% loss needs about an 11.1% gain. A 20% loss needs 25%, a 30% loss needs about 42.9%, and a 50% loss needs 100%. A 90% loss needs a 900% gain, a tenfold increase from the bottom.',
      'The time estimate divides the growth you need by a steady yearly return. At 7% a year, a 30% loss takes about 5.3 years to recover and a 50% loss about 10.2 years. Real returns are uneven, so treat this as a rough guide rather than a forecast, and note it ignores deposits, withdrawals, taxes and fees.',
    ],
    faq: [
      { q: 'Why does a 50% loss need a 100% gain?', a: 'Because the gain applies to the smaller amount. $100 down 50% is $50, and you need to add another $50 to get back to $100. Adding $50 to $50 is a 100% gain.' },
      { q: 'How much gain do I need after a 30% loss?', a: 'About 42.86%. $100 becomes $70, and $70 × 1.4286 is $100. At a steady 7% a year it would take about 5.3 years.' },
      { q: 'What about losses of 10% and 20%?', a: 'A 10% loss needs about an 11.11% gain, and a 20% loss needs exactly 25%. Small losses are easier to recover from because the gap between the two percentages is small.' },
      { q: 'Why can\'t I enter a 100% loss?', a: 'If everything is gone there is nothing left to grow, so no percentage gain can bring it back. The calculator accepts losses up to 99.99%.' },
      { q: 'How is the time to recover worked out?', a: 'It is ln(1 ÷ (1 − loss)) ÷ ln(1 + return). That is how many years of steady growth at your assumed return it takes to multiply the lower value back to the old one. It is blank if the return is 0% or less.' },
    ],
    sources: [
      { label: 'Investor.gov (SEC): compound interest and investing basics', url: 'https://www.investor.gov/introduction-investing' },
    ],
  },
  related: ['percentage-change', 'cagr-calculator', 'rule-of-72', 'compound-interest', 'stock-profit-calculator', 'investment'],
  examples: [
    // 30% loss: 1/0.7 - 1 = 0.428571...; 1/0.7 = 1.428571; years = ln(1.428571)/ln(1.07) = 0.356675/0.067659 = 5.2717
    { values: { loss: 30, ret: 7 }, expect: { gain: 0.4285714, multiple: 1.4285714, years: 5.2717 }, tolerance: 0.0001 },
    // 50%: 1/0.5 - 1 = 1 (a 100% gain); ln 2 / ln 1.07 = 10.2448
    { values: { loss: 50, ret: 7 }, expect: { gain: 1, multiple: 2, years: 10.2448 }, tolerance: 0.0001 },
    // 20%: 1/0.8 - 1 = 0.25
    { values: { loss: 20, ret: 7 }, expect: { gain: 0.25 }, tolerance: 0.0001 },
    // 10%: 1/0.9 - 1 = 0.11111
    { values: { loss: 10, ret: 7 }, expect: { gain: 0.1111111 }, tolerance: 0.0001 },
  ],
});
