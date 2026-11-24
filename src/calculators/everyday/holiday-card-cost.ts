import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'holiday-card-cost',
  title: 'Holiday Card Cost Calculator',
  category: 'everyday',
  description: 'Add up the printing, envelope, extras and postage for your holiday cards, then see how much you save by trimming the mailing list.',
  keywords: ['holiday card cost calculator', 'christmas card cost', 'how much do holiday cards cost', 'christmas card postage cost', 'photo card cost', 'card mailing budget'],
  updated: '2026-11-24',
  inputs: [
    { id: 'cards', label: 'Cards you plan to send', type: 'number', default: 60, min: 0, step: 1, info: 'The length of your mailing list.' },
    { id: 'card', label: 'Card and envelope price', type: 'number', prefix: '$', default: 1.5, min: 0, step: 0.01, info: 'Price of one card with its envelope. For a pack, divide the pack price by the number of cards.' },
    { id: 'extras', label: 'Extras per card', type: 'number', prefix: '$', default: 0.4, min: 0, step: 0.01, info: 'Photo print, stickers, return-address labels, anything added to each card.' },
    { id: 'postage', label: 'Postage per card', type: 'number', prefix: '$', default: 0.78, min: 0, step: 0.01, info: 'Enter the current stamp price from your post office. 0.78 is only an example.' },
    { id: 'drop', label: 'Cards you could drop', type: 'number', default: 10, min: 0, step: 1, info: 'How many people you could trim from the list.' },
  ],
  outputs: [
    { id: 'total', label: 'Total cost', format: 'currency', primary: true, info: 'Cards × cost per card.' },
    { id: 'each', label: 'Cost per card', format: 'currency', info: 'Card + extras + postage.' },
    { id: 'saved', label: 'Saved by trimming the list', format: 'currency', info: 'Cards dropped × cost per card.' },
  ],
  compute: (v) => {
    const cards = num(v.cards), card = num(v.card), extras = num(v.extras), postage = num(v.postage), drop = num(v.drop);
    if ([cards, card, extras, postage, drop].some((x) => x === null)) return { total: null };
    if ([cards, card, extras, postage, drop].some((x) => (x as number) < 0)) return { total: null, error: 'Values cannot be negative.' };
    if ((drop as number) > (cards as number)) return { total: null, error: 'You cannot drop more cards than you plan to send.' };
    const each = (card as number) + (extras as number) + (postage as number);
    const total = (cards as number) * each;
    const saved = (drop as number) * each;
    return {
      total, each, saved,
      tone: 'ok',
      badge: `${usd(each)} per card`,
      chart: {
        type: 'bar',
        title: 'Where the money goes',
        categories: ['Cards', 'Extras', 'Postage'],
        series: [{ name: 'Cost', values: [(cards as number) * (card as number), (cards as number) * (extras as number), (cards as number) * (postage as number)] }],
        format: { format: 'currency' },
      },
      steps: [
        `Per card: ${usd(card as number)} + ${usd(extras as number)} + ${usd(postage as number)} = ${usd(each)}`,
        `Total: ${cards} cards × ${usd(each)} = ${usd(total)}`,
        `Trim ${drop}: ${drop} × ${usd(each)} = ${usd(saved)} saved`,
      ],
      note: 'Arithmetic on the prices you enter. Check the current stamp price at your post office.',
    };
  },
  content: {
    formula: [
      'Cost per card = card and envelope + extras + postage',
      'Total = cards × cost per card',
      'Saved by trimming = cards dropped × cost per card',
    ],
    body: [
      'Holiday cards look cheap one at a time, but the list adds up: printing, envelope, a photo or sticker, and a stamp on every one. This calculator totals the lot and shows what a shorter list would save.',
      'Postage is an input because stamp prices change. Enter the current rate from your post office; the 0.78 default is only an example.',
      'It is arithmetic only. It does not look up prices or shipping deadlines.',
    ],
    faq: [
      { q: 'What is the cost in the example?', a: 'Each card costs $1.50 + $0.40 + $0.78 = $2.68. For 60 cards that is $160.80, and dropping 10 cards saves $26.80.' },
      { q: 'How do I price a pack of cards?', a: 'Divide the pack price by the number of cards in it and enter that as the card and envelope price.' },
      { q: 'What is the current stamp price?', a: 'This calculator does not know it. Check your post office and enter it as the postage per card.' },
      { q: 'Does it include shipping for gifts?', a: 'No. It covers only the cards. For gifts and other seasonal costs, see the related calculators.' },
    ],
    sources: [],
  },
  related: ['holiday-spending-total', 'gift-budget', 'wrapping-paper'],
  examples: [
    // each 1.5+0.4+0.78 = 2.68; total 60*2.68 = 160.8; saved 26.8
    { values: { cards: 60, card: 1.5, extras: 0.4, postage: 0.78, drop: 10 }, expect: { each: 2.68, total: 160.8, saved: 26.8 }, tolerance: 0.001 },
    // each 1+0+0.5 = 1.5; 100*1.5 = 150; drop 20 -> 30
    { values: { cards: 100, card: 1, extras: 0, postage: 0.5, drop: 20 }, expect: { each: 1.5, total: 150, saved: 30 }, tolerance: 0.001 },
    { values: { cards: 0, card: 1, extras: 1, postage: 1, drop: 0 }, expect: { total: 0, saved: 0 }, tolerance: 0.001 },
  ],
});
