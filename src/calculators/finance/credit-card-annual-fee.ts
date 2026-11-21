import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'credit-card-annual-fee',
  title: 'Credit Card Annual Fee Break-Even',
  category: 'finance',
  description: 'Is a card with an annual fee worth it? Compare its rewards and perks minus the fee against a no-fee card, and see the yearly spend where it breaks even.',
  keywords: ['credit card annual fee worth it', 'annual fee break-even', 'rewards card vs no fee card', 'is my annual fee worth it', 'credit card rewards calculator', 'annual fee calculator'],
  updated: '2026-11-21',
  inputs: [
    { id: 'fee', label: 'Annual fee', type: 'number', prefix: '$', default: 95, min: 0, step: 5, info: 'What the card charges each year.' },
    { id: 'spend', label: 'Yearly spend on the card', type: 'number', prefix: '$', default: 12000, min: 0, step: 500, info: 'How much you put on this card in a year.' },
    { id: 'rate', label: 'Rewards rate (as value)', type: 'number', suffix: '%', default: 2, min: 0, step: 0.1, info: 'What each dollar of spend is worth back to you in cash terms, not points. Use your own estimate.' },
    { id: 'baseRate', label: 'No-fee card rewards rate', type: 'number', suffix: '%', default: 1, min: 0, step: 0.1, info: 'The value rate of the card you would use instead.' },
    { id: 'perks', label: 'Other yearly perks you would use', type: 'number', prefix: '$', default: 0, min: 0, step: 10, optional: true, info: 'Optional. Credits or benefits you would really use anyway. Leave at 0 if unsure. A first-year bonus can be spread in here for year one.' },
  ],
  outputs: [
    { id: 'advantage', label: 'Annual-fee card vs no-fee card', format: 'currency', primary: true, info: 'Net value of the fee card minus the value of the no-fee card. Positive means the fee card wins.' },
    { id: 'net', label: 'Net value of the fee card', format: 'currency', info: 'Spend × rate + perks − fee.' },
    { id: 'alt', label: 'Value of the no-fee card', format: 'currency', info: 'Spend × no-fee rate.' },
    { id: 'breakeven', label: 'Break-even yearly spend', format: 'currency', info: '(Fee − perks) ÷ (rate − no-fee rate). Above this spend the fee card comes out ahead.' },
  ],
  compute: (v) => {
    const fee = num(v.fee), spend = num(v.spend), rate = num(v.rate), base = num(v.baseRate);
    const perks = num(v.perks) ?? 0;
    if (fee === null || spend === null || rate === null || base === null) return { advantage: null, note: 'Enter the fee, your spend and both rewards rates.' };
    if (fee < 0 || spend < 0 || rate < 0 || base < 0 || perks < 0) return { advantage: null, error: 'Values cannot be negative.' };
    const r = rate / 100, b = base / 100;
    const net = spend * r + perks - fee;
    const alt = spend * b;
    const adv = net - alt;
    const diff = r - b;
    let be: number | null;
    let beNote: string;
    if (fee - perks <= 0) { be = 0; beNote = 'Your perks cover the fee, so the card wins on perks alone as long as its rate is not below the no-fee rate.'; if (diff < 0) { be = null; beNote = 'The no-fee card earns more per dollar, so the fee card only wins at low spend.'; } }
    else if (diff <= 0) { be = null; beNote = 'The fee card pays no more per dollar than the no-fee card, so it never breaks even.'; }
    else { be = (fee - perks) / diff; beNote = `The fee card comes out ahead once you spend more than ${usd(be)} a year on it.`; }
    const top = Math.max(spend, be ?? 0, 1000) * 1.5;
    const x = Array.from({ length: 11 }, (_, i) => Math.round((top * i) / 10));
    return {
      advantage: adv,
      net,
      alt,
      breakeven: be,
      tone: adv > 0 ? 'good' : adv === 0 ? 'ok' : 'warn',
      badge: adv > 0 ? 'Fee is worth it' : adv === 0 ? 'Even' : 'No-fee card wins',
      chart: {
        type: 'line',
        title: 'Yearly value by amount spent',
        x,
        xLabel: 'Yearly spend',
        xFormat: { format: 'currency' },
        yFormat: { format: 'currency' },
        series: [
          { name: 'Annual-fee card (after fee)', values: x.map((s) => s * r + perks - fee) },
          { name: 'No-fee card', values: x.map((s) => s * b) },
        ],
      },
      steps: [
        `Fee card = ${usd(spend)} × ${rate}% + ${usd(perks)} perks − ${usd(fee)} fee = ${usd(net)}`,
        `No-fee card = ${usd(spend)} × ${base}% = ${usd(alt)}`,
        `Difference = ${usd(net)} − ${usd(alt)} = ${usd(adv)}`,
        be === null ? 'Break-even: none, because the rates do not favour the fee card.' : `Break-even spend = (${usd(fee)} − ${usd(perks)}) ÷ (${rate}% − ${base}%) = ${usd(be)}`,
      ],
      note: `${beNote} Rewards rates are your own estimates of value, not points.`,
    };
  },
  content: {
    formula: [
      'Net value of the fee card = spend × rewards rate + perks − annual fee',
      'No-fee card value = spend × no-fee rate',
      'Difference = fee card net value − no-fee card value',
      'Break-even spend = (fee − perks) ÷ (rewards rate − no-fee rate)',
    ],
    body: [
      'An annual fee only makes sense if the card gives you back more than a free card would. This calculator puts the two side by side: what the fee card earns in rewards and perks, minus its fee, against what a no-fee card would earn on the same spending.',
      'Enter rewards as a value rate, meaning what a dollar of spend is worth to you in cash. If points are worth about a cent each and you earn two per dollar, that is 2%. Only count perks you would really use. A credit you never claim is worth nothing.',
      'The break-even spend is the yearly amount where both cards are equal. Spend more and the fee card wins. If its rate is not higher than the no-fee card, extra spending never makes up the fee, so there is no break-even.',
      'This ignores interest, since carrying a balance usually costs more than any rewards. It also ignores category caps, sign-up bonuses beyond what you enter as perks, and tax. If you carry a balance, see the credit card payoff calculator.',
    ],
    faq: [
      { q: 'Is a $95 fee worth it at $12,000 a year and 2% rewards?', a: 'Against a 1% no-fee card, yes by a little. The fee card gives $12,000 × 2% − $95 = $145, the no-fee card gives $120, so you are $25 ahead with no extra perks.' },
      { q: 'What is the break-even spend in that case?', a: '$95 ÷ (2% − 1%) = $9,500 a year. Spend less than that and the no-fee card wins.' },
      { q: 'How do perks change the answer?', a: 'Perks you would really use reduce the fee you have to earn back. With $50 of perks, the break-even drops to ($95 − $50) ÷ 1% = $4,500 a year.' },
      { q: 'What if the no-fee card earns the same or more?', a: 'Then the fee card never breaks even, because each dollar earns no extra and you still pay the fee. The calculator says so instead of giving a number.' },
    ],
    sources: [
      { label: 'Annual fee (Investopedia)', url: 'https://www.investopedia.com/terms/a/annual-fee.asp' },
    ],
  },
  related: ['credit-card-payoff', 'cost-per-use', 'foreign-transaction-fee', 'apr'],
  examples: [
    // 12000 x 0.02 = 240; net 240 - 95 = 145; alt 12000 x 0.01 = 120; adv 25; BE 95 / 0.01 = 9500
    { values: { fee: 95, spend: 12000, rate: 2, baseRate: 1, perks: 0 }, expect: { advantage: 25, net: 145, alt: 120, breakeven: 9500 }, tolerance: 1e-6 },
    // net 240 + 50 - 95 = 195; adv 75; BE (95 - 50) / 0.01 = 4500
    { values: { fee: 95, spend: 12000, rate: 2, baseRate: 1, perks: 50 }, expect: { advantage: 75, net: 195, alt: 120, breakeven: 4500 }, tolerance: 1e-6 },
    // spend 5000: 100 - 95 = 5; alt 50; adv -45; BE 9500
    { values: { fee: 95, spend: 5000, rate: 2, baseRate: 1, perks: 0 }, expect: { advantage: -45, net: 5, alt: 50, breakeven: 9500 }, tolerance: 1e-6 },
  ],
});
