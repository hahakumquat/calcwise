import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (n: number) => '$' + fmt(n, 2);

export default defineCalculator({
  slug: 'textbook-cost',
  title: 'Textbook Rent vs Buy Calculator',
  category: 'other',
  description: 'Compare renting, buying and reselling your textbooks. See the net cost of each option, the cheapest one, and the resale price where buying beats renting.',
  keywords: ['textbook rent vs buy', 'rent or buy textbooks', 'textbook buyback calculator', 'used textbook vs rental', 'cheapest way to get textbooks', 'textbook resale value'],
  updated: '2026-11-22',
  inputs: [
    { id: 'buy', label: 'Price to buy new', type: 'number', prefix: '$', default: 180, min: 0, step: 5, info: 'The full price of a new copy for the term, per book.' },
    { id: 'rent', label: 'Rental price for the term', type: 'number', prefix: '$', default: 70, min: 0, step: 5, info: 'What the rental costs for the whole term, per book.' },
    { id: 'used', label: 'Price to buy used', type: 'number', prefix: '$', min: 0, step: 5, optional: true, info: 'Optional. Leave blank to skip the used option.' },
    { id: 'resale', label: 'Expected resale after the term', type: 'number', prefix: '$', default: 60, min: 0, step: 5, info: 'What a buyback or resale would pay you for a bought copy, per book. Use 0 if you would keep it. It is a guess, so try a low number too.' },
    { id: 'books', label: 'Number of books', type: 'number', default: 1, min: 1, max: 50, step: 1, optional: true, info: 'Optional. Defaults to 1. Every cost is multiplied by this.' },
  ],
  outputs: [
    { id: 'cheapest', label: 'Cheapest net cost', format: 'currency', primary: true, info: 'The lowest net cost of the options you entered.' },
    { id: 'best', label: 'Cheapest option', format: 'text', info: 'Which option has the lowest net cost. Ties go to buying new, then renting, then used.' },
    { id: 'savings', label: 'Saved vs the priciest option', format: 'currency', info: 'Highest net cost minus lowest net cost.' },
    { id: 'buyNet', label: 'Net cost of buying new', format: 'currency', info: '(Buy price − resale) × books.' },
    { id: 'rentNet', label: 'Net cost of renting', format: 'currency', info: 'Rental price × books.' },
    { id: 'usedNet', label: 'Net cost of buying used', format: 'currency', info: '(Used price − resale) × books. Only shown when you enter a used price.' },
    { id: 'breakEven', label: 'Break-even resale price', format: 'currency', info: 'Buy price − rental price, per book. If you can resell for more than this, buying new beats renting.' },
  ],
  compute: (v) => {
    const buy = num(v.buy);
    const rent = num(v.rent);
    const used = num(v.used);
    const resale = num(v.resale);
    const booksIn = num(v.books);
    const books = booksIn === null ? 1 : booksIn;
    if (buy === null || rent === null || resale === null || buy < 0 || rent < 0 || resale < 0 || books < 1) return { cheapest: null };
    if (used !== null && used < 0) return { cheapest: null };
    if (resale > buy) return { cheapest: null, error: 'Resale price cannot be higher than the price you paid.' };
    if (used !== null && resale > used) return { cheapest: null, error: 'Resale price cannot be higher than the used price. Lower it, or clear the used price.' };
    const buyNet = (buy - resale) * books;
    const rentNet = rent * books;
    const usedNet = used === null ? null : (used - resale) * books;
    const opts: { name: string; net: number }[] = [
      { name: 'Buy new', net: buyNet },
      { name: 'Rent', net: rentNet },
    ];
    if (usedNet !== null) opts.push({ name: 'Buy used', net: usedNet });
    let best = opts[0];
    let worst = opts[0];
    for (const o of opts) {
      if (o.net < best.net) best = o;
      if (o.net > worst.net) worst = o;
    }
    const savings = worst.net - best.net;
    const breakEven = buy - rent;
    const steps = [
      `Buy new: (${usd(buy)} − ${usd(resale)}) × ${fmt(books)} = ${usd(buyNet)}`,
      `Rent: ${usd(rent)} × ${fmt(books)} = ${usd(rentNet)}`,
    ];
    if (usedNet !== null) steps.push(`Buy used: (${usd(used as number)} − ${usd(resale)}) × ${fmt(books)} = ${usd(usedNet)}`);
    steps.push(`Break-even resale: ${usd(buy)} − ${usd(rent)} = ${usd(breakEven)}`);
    return {
      cheapest: best.net,
      best: best.name,
      savings,
      buyNet,
      rentNet,
      usedNet,
      breakEven,
      chart: {
        type: 'bar',
        title: 'Net cost of each option',
        categories: opts.map((o) => o.name),
        format: { format: 'currency' },
        series: [{ name: 'Net cost', values: opts.map((o) => o.net) }],
        highlight: opts.indexOf(best),
      },
      steps,
      tone: 'good',
      badge: `${best.name} wins`,
      note: savings > 0
        ? `${best.name} is cheapest at ${usd(best.net)}, which is ${usd(savings)} less than ${worst.name.toLowerCase()}.`
        : `All options cost the same, ${usd(best.net)}.`,
    };
  },
  content: {
    formula: [
      'Net cost of buying = (buy price − resale price) × books',
      'Net cost of renting = rental price × books',
      'Net cost of buying used = (used price − resale price) × books',
      'Break-even resale price = buy price − rental price',
    ],
    body: [
      'Buying a textbook is not a one-way payment if you can sell it back. What the book really costs you is the price you paid minus what you get when you resell it. Renting has no resale, so its cost is just the rental fee.',
      'Enter the price new, the rental price for the term and what you expect a buyback to pay. Add a used price if you have one, and the number of books if you want the total for the term.',
      'The break-even resale price shows how much you would need to get back for buying new to match renting. If you expect to resell for more than that, buying is cheaper; for less, renting wins.',
    ],
    sections: [
      {
        heading: 'What the calculator cannot know',
        paragraphs: [
          'Resale is a guess. Buyback offers depend on the shop, the edition and the condition of your copy, and a new edition can leave an old one worth nothing, so try a low resale number as well as a hopeful one.',
          'Rentals have risks too. Late returns, missed deadlines, damage or highlighting can add fees, and a book you fail to return may be charged at a much higher price. None of these are included here, so add them to the rental price if they apply to you.',
          'The same resale price is used for the new and the used copy. All the numbers are the ones you enter, and everything runs in your browser.',
        ],
      },
    ],
    faq: [
      { q: 'How do you work out the net cost of buying a textbook?', a: 'Subtract the resale price from the buy price, then multiply by the number of books. A $180.00 book that resells for $60.00 nets out at $120.00.' },
      { q: 'Is it cheaper to rent or buy a $180 book that rents for $70?', a: 'With a $60.00 resale, buying costs $120.00 net and renting costs $70.00, so renting is cheapest and saves $50.00. Buying only wins if you resell for more than $110.00.' },
      { q: 'What is the break-even resale price?', a: 'It is the buy price minus the rental price. For a $180.00 book that rents for $70.00 it is $110.00: resell for exactly that and buying costs the same as renting.' },
      { q: 'How does a used copy compare?', a: 'Its net cost is the used price minus the resale price. A $120.00 used copy that resells for $60.00 costs $60.00 net, which beats renting at $70.00 and buying new at $120.00.' },
      { q: 'What if I need several books?', a: 'Every net cost is multiplied by the number of books. Two books at $200.00 new that resell for $100.00 each cost $200.00 net, against $160.00 to rent them at $80.00 each.' },
    ],
  },
  related: ['cost-per-class', 'gpa', 'rent-vs-buy', 'credits-to-graduate'],
  examples: [
    // buy net 180-60 = 120; rent 70; used net 120-60 = 60; cheapest 60 (used); priciest 120; saves 60; break-even 180-70 = 110
    { values: { buy: 180, rent: 70, used: 120, resale: 60, books: 1 }, expect: { cheapest: 60, best: 'Buy used', savings: 60, buyNet: 120, rentNet: 70, usedNet: 60, breakEven: 110 }, tolerance: 1e-9 },
    // 2 books: buy net (200-100)*2 = 200; rent 80*2 = 160; used net (140-100)*2 = 80; cheapest 80; priciest 200; saves 120; break-even 200-80 = 120
    { values: { buy: 200, rent: 80, used: 140, resale: 100, books: 2 }, expect: { cheapest: 80, best: 'Buy used', savings: 120, buyNet: 200, rentNet: 160, usedNet: 80, breakEven: 120 }, tolerance: 1e-9 },
    // no used: buy net 180-60 = 120; rent 70; cheapest rent 70; saves 120-70 = 50; break-even 110
    { values: { buy: 180, rent: 70, used: null, resale: 60, books: 1 }, expect: { cheapest: 70, best: 'Rent', savings: 50, buyNet: 120, rentNet: 70, breakEven: 110 }, tolerance: 1e-9 },
    // high resale: buy net 180-120 = 60; rent 70; buying wins, saves 10; break-even 110
    { values: { buy: 180, rent: 70, used: null, resale: 120, books: 1 }, expect: { cheapest: 60, best: 'Buy new', savings: 10, buyNet: 60, rentNet: 70, breakEven: 110 }, tolerance: 1e-9 },
  ],
});
