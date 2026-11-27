import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'breakeven-win-rate',
  title: 'Breakeven Win Rate Calculator',
  category: 'finance',
  description: 'Find the win rate you need to break even from your average win and average loss, and check the expected value per trade at your own win rate.',
  keywords: ['breakeven win rate calculator', 'break even win rate trading', 'win rate needed to break even', 'payoff ratio calculator', 'expected value per trade', 'risk reward breakeven'],
  updated: '2026-11-27',
  inputs: [
    { id: 'win', label: 'Average win', type: 'number', prefix: '$', default: 200, min: 0, step: 10, info: 'The average amount you make on a winning trade. Must be above 0.' },
    { id: 'loss', label: 'Average loss', type: 'number', prefix: '$', default: 100, min: 0, step: 10, info: 'The average amount you lose on a losing trade, entered as a positive number. Must be above 0.' },
    { id: 'rate', label: 'Your win rate (optional)', type: 'number', suffix: '%', default: 40, min: 0, max: 100, step: 1, optional: true, info: 'The share of trades that win, from 0 to 100. Leave blank to see only the break-even rate.' },
  ],
  outputs: [
    { id: 'breakeven', label: 'Break-even win rate', format: 'percent', precision: 2, primary: true, info: 'Average loss ÷ (average win + average loss). Win more often than this and the average trade makes money.' },
    { id: 'ratio', label: 'Payoff ratio (win ÷ loss)', format: 'number', precision: 2, info: 'Average win divided by average loss. A ratio of 2 means wins are twice the size of losses.' },
    { id: 'ev', label: 'Expected value per trade', format: 'currency', precision: 2, info: 'Win rate × average win − (1 − win rate) × average loss. Shown only when you enter a win rate.' },
  ],
  compute: (v) => {
    const win = num(v.win);
    const loss = num(v.loss);
    const rate = num(v.rate);
    if (win === null || loss === null) return { breakeven: null };
    if (win <= 0 || loss <= 0) return { breakeven: null, error: 'Average win and average loss must both be above 0. Enter the loss as a positive number.' };
    if (rate !== null && (rate < 0 || rate > 100)) return { breakeven: null, error: 'Win rate must be between 0 and 100.' };
    const ratio = win / loss;
    const breakeven = loss / (win + loss);
    const note = 'Ignores fees, commissions and slippage. This is arithmetic, not financial advice, and past results do not predict future ones.';
    const base = { breakeven, ratio, ev: null as number | null, note };
    const betSteps = [
      `Payoff ratio = ${money(win)} ÷ ${money(loss)} = ${+ratio.toFixed(2)}`,
      `Break-even win rate = ${money(loss)} ÷ (${money(win)} + ${money(loss)}) = ${pct(breakeven)}`,
    ];
    if (rate === null) {
      return {
        ...base,
        tone: 'ok',
        badge: `Need to win ${pct(breakeven)}`,
        chart: { type: 'bar', title: 'Win rate needed to break even', categories: ['Break-even'], series: [{ name: 'Win rate', values: [breakeven] }], format: { format: 'percent', precision: 1 } },
        steps: betSteps,
      };
    }
    const p = rate / 100;
    const ev = p * win - (1 - p) * loss;
    const above = p > breakeven + 1e-12;
    const below = p < breakeven - 1e-12;
    return {
      ...base,
      ev,
      tone: above ? 'good' : below ? 'bad' : 'warn',
      badge: above ? `Edge: ${money(ev)} per trade` : below ? `Losing ${money(-ev)} per trade` : 'Right at break-even',
      chart: { type: 'bar', title: 'Your win rate vs break-even', categories: ['Break-even', 'Your win rate'], series: [{ name: 'Win rate', values: [breakeven, p] }], format: { format: 'percent', precision: 1 }, highlight: 1 },
      steps: [
        ...betSteps,
        `Expected value = ${pct(p)} × ${money(win)} − ${pct(1 - p)} × ${money(loss)} = ${money(ev)} per trade`,
      ],
    };
  },
  content: {
    formula: [
      'Payoff ratio R = average win ÷ average loss',
      'Break-even win rate = average loss ÷ (average win + average loss) = 1 ÷ (1 + R)',
      'Expected value per trade = win rate × average win − (1 − win rate) × average loss',
    ],
    body: [
      'Your break-even win rate is the share of trades you must win for wins and losses to cancel out. It depends only on the size of your average win compared with your average loss: the bigger the wins relative to the losses, the less often you need to win.',
      'Enter your average win and average loss in dollars. Optionally add your actual win rate to see the expected value per trade, which is the average amount you would make or lose each trade if those numbers held.',
      'For example, a $200 average win against a $100 average loss gives a payoff ratio of 2 and a break-even win rate of 33.33%. At a 40% win rate, expected value is 0.40 × $200 − 0.60 × $100 = +$20 per trade. With equal $100 wins and losses you need 50%, and at 45% you lose $10 per trade. With a $150 win and $300 loss the ratio is 0.5, you need 66.67%, and at 70% you make +$15 per trade.',
      'This ignores fees, commissions and slippage, which raise the break-even rate in practice. It is arithmetic, not financial advice, and past results do not predict future ones. To size a trade from your risk, see the position size calculator, or the expected value calculator for outcomes beyond win and lose.',
    ],
    faq: [
      { q: 'What win rate do I need with a $200 win and $100 loss?', a: 'The break-even win rate is $100 ÷ $300 = 33.33%, and the payoff ratio is 2.' },
      { q: 'What is the expected value at a 40% win rate for that $200 / $100 case?', a: '0.40 × $200 − 0.60 × $100 = +$20.00 per trade.' },
      { q: 'What win rate do equal wins and losses need?', a: '50%. With $100 wins and $100 losses, a 45% win rate has an expected value of −$10.00 per trade.' },
      { q: 'What if my average loss is bigger than my average win?', a: 'You need to win more than half the time. With a $150 win and $300 loss the ratio is 0.50 and the break-even win rate is 66.67%; at 70% you make +$15.00 per trade.' },
      { q: 'Does this include fees and slippage?', a: 'No. Fees, commissions and slippage make real results worse than this arithmetic. Subtract them from your average win and add them to your average loss first.' },
      { q: 'Does a positive expected value guarantee profit?', a: 'No. It is an average over many trades based on the numbers you entered. It is not advice, and past results do not predict future ones.' },
    ],
    sources: [],
  },
  related: ['position-size-calculator', 'expected-value'],
  examples: [
    // R = 200/100 = 2; breakeven = 100/300 = 1/3; EV = .4*200 - .6*100 = 80 - 60 = 20
    { values: { win: 200, loss: 100, rate: 40 }, expect: { breakeven: 1 / 3, ratio: 2, ev: 20 }, tolerance: 1e-9 },
    // breakeven = 100/200 = .5; EV = .45*100 - .55*100 = -10
    { values: { win: 100, loss: 100, rate: 45 }, expect: { breakeven: 0.5, ratio: 1, ev: -10 }, tolerance: 1e-9 },
    // R = 150/300 = .5; breakeven = 300/450 = 2/3; EV = .7*150 - .3*300 = 105 - 90 = 15
    { values: { win: 150, loss: 300, rate: 70 }, expect: { breakeven: 2 / 3, ratio: 0.5, ev: 15 }, tolerance: 1e-9 },
    // blank win rate: break-even only
    { values: { win: 200, loss: 100 }, expect: { breakeven: 1 / 3, ratio: 2 }, tolerance: 1e-9 },
  ],
});
