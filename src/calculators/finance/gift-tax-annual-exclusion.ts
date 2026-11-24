import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'gift-tax-annual-exclusion',
  title: 'Gift Tax Annual Exclusion: Room Left This Year',
  category: 'finance',
  description: 'See how much more you can give this year without filing a gift tax return. Enter the exclusion, recipients, gifts so far and a planned gift.',
  keywords: ['gift tax annual exclusion calculator', 'how much can I gift in 2026', 'gift tax limit per person', 'gift splitting married couple', 'do I need to file form 709'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'exclusion', label: 'Annual exclusion per recipient', type: 'number', prefix: '$', default: 19000, min: 0, step: 500, info: 'The IRS amount you can give each person per year with no gift tax return. Check the current figure on the IRS gift tax page.' },
    { id: 'recipients', label: 'Number of recipients', type: 'number', default: 3, min: 1, max: 100, step: 1, info: 'Children, grandchildren or anyone else receiving a gift from you.' },
    {
      id: 'donors',
      label: 'Giving as',
      type: 'select',
      segmented: true,
      default: '1',
      options: [
        { value: '1', label: 'One person' },
        { value: '2', label: 'Married, splitting' },
      ],
      info: 'Married couples who elect gift splitting can each use their own exclusion for every recipient. Splitting requires filing Form 709.',
    },
    { id: 'given', label: 'Already given this year', type: 'number', prefix: '$', default: 12000, min: 0, step: 500, info: 'Total gifts so far this year across all recipients, counted toward the exclusion. Do not include tuition or medical bills paid directly to the school or provider.' },
    { id: 'planned', label: 'Gift you plan to add', type: 'number', prefix: '$', default: 20000, min: 0, step: 500, info: 'The extra amount you are thinking of giving before Dec 31.' },
  ],
  outputs: [
    { id: 'after', label: 'Room left after your gift', format: 'currency', precision: 2, primary: true, info: 'Total room − gifts so far − planned gift, never below zero.' },
    { id: 'total', label: 'Total room this year', format: 'currency', precision: 2, info: 'Exclusion × recipients × donors.' },
    { id: 'now', label: 'Room left today', format: 'currency', precision: 2, info: 'Total room − gifts so far, never below zero.' },
    { id: 'over', label: 'Over the exclusion', format: 'currency', precision: 2, info: 'The part of the gifts above total room. It needs a Form 709 and counts against the lifetime exemption; it is usually not taxed now.' },
  ],
  compute: (v) => {
    const ex = num(v.exclusion);
    const n = num(v.recipients);
    const donors = v.donors === '2' ? 2 : 1;
    const given = num(v.given);
    const planned = num(v.planned);
    if ([ex, n, given, planned].some((x) => x === null)) return { after: null };
    if ([ex, given, planned].some((x) => (x as number) < 0) || n! < 1) return { after: null };
    const total = ex! * Math.floor(n!) * donors;
    const now = Math.max(0, total - given!);
    const after = Math.max(0, total - given! - planned!);
    const over = Math.max(0, given! + planned! - total);
    return {
      after,
      total,
      now,
      over,
      tone: over > 0 ? 'warn' : 'good',
      badge: over > 0 ? `${money(over)} over the exclusion` : `${money(after)} of room left`,
      note: over > 0
        ? `Your gifts add up to ${money(given! + planned!)} against ${money(total)} of room, so ${money(over)} is over. That does not usually mean tax now: you would file Form 709 and the excess counts against your lifetime exemption. This assumes the gifts are spread evenly; one recipient over the per-person limit is over even if others are under.`
        : `Your gifts add up to ${money(given! + planned!)} against ${money(total)} of room, leaving ${money(after)}. This assumes the gifts are spread evenly across recipients; each person has their own ${money(ex!)} limit${donors === 2 ? ' per spouse' : ''}.`,
      chart: {
        type: 'bar' as const,
        title: 'Gift room this year',
        categories: ['Gifts vs room'],
        series: [
          { name: 'Given so far', values: [Math.min(given!, total)] },
          { name: 'Planned (within room)', values: [Math.max(0, Math.min(planned!, total - given!))] },
          { name: 'Room left', values: [after] },
        ],
        format: CURRENCY,
        stacked: true,
      },
      steps: [
        `Total room = ${money(ex!)} × ${Math.floor(n!)} recipient${Math.floor(n!) === 1 ? '' : 's'} × ${donors} = ${money(total)}`,
        `Room today = ${money(total)} − ${money(given!)} = ${money(now)}`,
        `After the gift = ${money(now)} − ${money(planned!)} = ${money(after)}`,
        `Over the exclusion = ${money(over)}`,
      ],
    };
  },
  content: {
    formula: [
      'Total room = exclusion per recipient × recipients × donors (1, or 2 with gift splitting)',
      'Room left today = total room − gifts so far',
      'Room after the gift = total room − gifts so far − planned gift',
      'Over the exclusion = gifts above total room',
    ],
    body: [
      'You can give each person up to the annual exclusion every calendar year without filing a gift tax return. The clock resets on Jan 1, so unused room does not carry over. This calculator shows how much of this year is left.',
      'Example: with a $19,000 exclusion, 3 recipients and one donor, total room is $57,000. After $12,000 already given, $45,000 is left. A planned $20,000 gift leaves $25,000, and nothing is over.',
      'Going over the exclusion is usually not a tax bill. It means filing Form 709, and the excess reduces your lifetime exemption. The exclusion applies per recipient, so this tool assumes gifts are spread evenly. This is general information, not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is the annual gift tax exclusion?', a: 'The amount you can give each person in a calendar year without filing a gift tax return. The default here is $19,000; confirm the current figure on the IRS page linked below and edit it if it has changed.' },
      { q: 'What does gift splitting do?', a: 'A married couple can treat a gift from one spouse as made half by each, so two exclusions apply per recipient. The calculator doubles the room. Splitting requires filing Form 709.' },
      { q: 'Do tuition and medical payments count?', a: 'Not when you pay the school or provider directly. Leave those out of the gifts so far.' },
      { q: 'What if I go over?', a: 'The excess is reported on Form 709 and reduces your lifetime exemption. Tax is usually due only after the exemption is used up.' },
      { q: 'Why does an uneven split matter?', a: 'The limit is per recipient. Giving one person $30,000 and another $5,000 puts the first over even though the total is under the combined room.' },
    ],
    sources: [
      { label: 'IRS: Frequently asked questions on gift taxes', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-gift-taxes' },
    ],
  },
  related: ['gift-budget', 'donate-stock-vs-cash', '529-state-deduction', 'charitable-giving-tax-value'],
  examples: [
    // total 19000*3*1=57000; now 45000; after 25000; over 0
    { values: { exclusion: 19000, recipients: 3, donors: '1', given: 12000, planned: 20000 }, expect: { total: 57000, now: 45000, after: 25000, over: 0 } },
    // total 19000*2*1=38000; given 10000 + 40000 = 50000 -> over 12000; now 28000; after 0
    { values: { exclusion: 19000, recipients: 2, donors: '1', given: 10000, planned: 40000 }, expect: { total: 38000, now: 28000, after: 0, over: 12000 } },
    // splitting: 19000*2*2=76000; given 0 + 30000 -> after 46000
    { values: { exclusion: 19000, recipients: 2, donors: '2', given: 0, planned: 30000 }, expect: { total: 76000, now: 76000, after: 46000, over: 0 } },
  ],
});
