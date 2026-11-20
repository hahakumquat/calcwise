import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const COINS = [
  { id: 'pennies', name: 'Pennies', one: 'penny', cents: 1, def: 100 },
  { id: 'nickels', name: 'Nickels', one: 'nickel', cents: 5, def: 30 },
  { id: 'dimes', name: 'Dimes', one: 'dime', cents: 10, def: 20 },
  { id: 'quarters', name: 'Quarters', one: 'quarter', cents: 25, def: 10 },
  { id: 'halves', name: 'Half dollars', one: 'half dollar', cents: 50, def: 0 },
  { id: 'dollars', name: 'Dollar coins', one: 'dollar coin', cents: 100, def: 0 },
];

export default defineCalculator({
  slug: 'coin-counter',
  title: 'Coin Counter',
  category: 'everyday',
  description: 'Count your coins: enter how many pennies, nickels, dimes, quarters, half dollars and dollar coins you have to get the total value in dollars.',
  keywords: ['coin counter', 'coin calculator', 'how much money in coins', 'count coins', 'coin jar total', 'change counter', 'piggy bank calculator'],
  updated: '2026-11-20',
  inputs: COINS.map((c) => ({
    id: c.id,
    label: `${c.name} (${c.cents < 100 ? `${c.cents}¢` : '$1.00'})`,
    type: 'number' as const,
    default: c.def,
    min: 0,
    step: 1,
    optional: true,
    info: `How many ${c.name.toLowerCase()} you have. Each is worth ${c.cents < 100 ? `${c.cents} cent${c.cents === 1 ? '' : 's'}` : '$1.00'}. Leave blank for none.`,
  })),
  outputs: [
    { id: 'total', label: 'Total value', format: 'currency', primary: true, info: 'The face value of all your coins added together.' },
    { id: 'coinCount', label: 'Total coins', format: 'integer', info: 'How many coins you entered in all.' },
    { id: 'cents', label: 'Total in cents', format: 'integer', info: 'The same total counted in whole cents.' },
    ...COINS.map((c) => ({ id: `value_${c.id}`, label: `${c.name} value`, format: 'currency' as const, info: `Number of ${c.name.toLowerCase()} × ${c.cents} cents.` })),
  ],
  compute: (v) => {
    const counts = COINS.map((c) => num(v[c.id]) ?? 0);
    if (counts.some((n) => n < 0)) return { total: null, error: 'Coin counts cannot be negative.' };
    if (counts.some((n) => !Number.isInteger(n))) return { total: null, error: 'Enter whole numbers of coins.' };
    const coinCount = counts.reduce((a, b) => a + b, 0);
    if (coinCount <= 0) return { total: null };

    // Integer cents avoid floating-point drift.
    const centsEach = counts.map((n, i) => n * COINS[i].cents);
    const cents = centsEach.reduce((a, b) => a + b, 0);
    const total = cents / 100;

    const out: Record<string, number | string | null | ChartSpec | string[] | undefined> = { total, coinCount, cents };
    COINS.forEach((c, i) => { out[`value_${c.id}`] = centsEach[i] / 100; });

    const slices = COINS.flatMap((c, i) => (centsEach[i] > 0 ? [{ label: c.name, value: centsEach[i] / 100 }] : []));
    const chart: ChartSpec = { type: 'donut', title: 'Where the value comes from', format: { format: 'currency' }, slices, centerValue: money(total, 2), centerLabel: 'total' };

    const steps = COINS.flatMap((c, i) => (counts[i] > 0 ? [`${counts[i]} ${counts[i] === 1 ? c.one : c.name.toLowerCase()} × ${c.cents}¢ = ${centsEach[i]}¢`] : []));
    steps.push(`Total = ${centsEach.filter((x) => x > 0).join(' + ')} = ${cents}¢ = ${money(total, 2)}`);

    return {
      ...out,
      tone: 'ok',
      badge: `${coinCount.toLocaleString('en-US')} ${coinCount === 1 ? 'coin' : 'coins'}, ${money(total, 2)}`,
      chart,
      note: 'Face value in US dollars only. This does not account for coin wrappers, bank fees, or the weight of the coins.',
      steps,
    };
  },
  content: {
    formula: [
      'Total cents = 1 × pennies + 5 × nickels + 10 × dimes + 25 × quarters + 50 × half dollars + 100 × dollar coins',
      'Total dollars = total cents ÷ 100',
    ],
    body: [
      'Enter how many of each US coin you have. The calculator multiplies each count by its face value, adds everything up in whole cents, and shows the total in dollars along with the number of coins and how much each type contributes.',
      'Counting in whole cents keeps the answer exact. Leave any coin blank if you have none. Only US face values are used, so the result is what the coins are worth, not what a coin-counting machine might pay after fees.',
    ],
    sections: [
      {
        heading: 'US coin values',
        paragraphs: [
          'A penny is 1 cent, a nickel 5 cents, a dime 10 cents, a quarter 25 cents, a half dollar 50 cents and a dollar coin 100 cents.',
        ],
      },
      {
        heading: 'Worked example',
        paragraphs: [
          'Say a jar holds 100 pennies, 30 nickels, 20 dimes and 10 quarters. That is 100 + 150 + 200 + 250 = 700 cents, or $7.00, from 160 coins.',
        ],
      },
    ],
    faq: [
      { q: 'How do I count the value of a jar of coins?', a: 'Sort the coins by type, count each pile, and enter the counts. For 100 pennies, 30 nickels, 20 dimes and 10 quarters the total is 700 cents, which is $7.00 from 160 coins.' },
      { q: 'How much is a roll of quarters worth?', a: 'A standard bank roll of quarters holds 40 coins. Enter 40 quarters and the total is $10.00.' },
      { q: 'Why does the calculator work in cents?', a: 'Adding whole cents avoids tiny rounding errors. It divides by 100 only at the end to show dollars.' },
      { q: 'Does it include the weight or condition of the coins?', a: 'No. It only uses face value: 1, 5, 10, 25, 50 and 100 cents. Rare or collectible coins can be worth more than face value.' },
      { q: 'Can I enter decimals?', a: 'No. Coin counts must be whole numbers of zero or more.' },
    ],
    sources: [{ label: 'United States Mint: coin specifications', url: 'https://www.usmint.gov/learn/coin-and-medal-programs/coin-specifications' }],
  },
  related: ['tip', 'sales-tax', 'savings-goal'],
  examples: [
    // 100×1 + 30×5 + 20×10 + 10×25 = 100 + 150 + 200 + 250 = 700 cents = $7.00; coins = 100+30+20+10 = 160.
    { values: { pennies: 100, nickels: 30, dimes: 20, quarters: 10, halves: 0, dollars: 0 }, expect: { total: 7, cents: 700, coinCount: 160, value_quarters: 2.5 } },
    // 1+5+10+25+50+100 = 191 cents = $1.91 from 6 coins.
    { values: { pennies: 1, nickels: 1, dimes: 1, quarters: 1, halves: 1, dollars: 1 }, expect: { total: 1.91, cents: 191, coinCount: 6 } },
    // 40 quarters = 1000 cents = $10.00.
    { values: { pennies: 0, nickels: 0, dimes: 0, quarters: 40, halves: 0, dollars: 0 }, expect: { total: 10, cents: 1000, coinCount: 40 } },
  ],
});
