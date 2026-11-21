import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'party-seating',
  title: 'Party Seating Calculator',
  category: 'everyday',
  description: 'Work out how many tables and chairs you need for a party: enter guests, seats per table and any spare seats, and see the total and how many sit empty.',
  keywords: ['party seating calculator', 'how many tables for guests', 'tables and chairs needed', 'event seating calculator', 'how many chairs for a party', 'dinner party tables'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'guests', label: 'Guests who will sit', type: 'number', default: 40, min: 1, max: 5000, step: 1, info: 'Everyone who needs a seat, including children and yourself.' },
    { id: 'perTable', label: 'Seats per table', type: 'number', default: 8, min: 1, max: 50, step: 1, info: 'How many people one table seats comfortably. A common round table seats 8 and a 6 ft rectangle about 6, but check yours.' },
    { id: 'spare', label: 'Spare seats (your choice)', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, optional: true, info: 'Extra seating for late additions. 10% is a common choice, not a rule. Set 0 for none.' },
  ],
  outputs: [
    { id: 'tables', label: 'Tables needed', format: 'number', primary: true, info: 'Seats needed ÷ seats per table, rounded up.' },
    { id: 'chairs', label: 'Chairs needed', format: 'number', info: 'Guests plus spare seats, rounded up.' },
    { id: 'capacity', label: 'Total seats at those tables', format: 'number', info: 'Tables × seats per table.' },
    { id: 'empty', label: 'Empty seats', format: 'number', info: 'Total seats minus guests.' },
  ],
  compute: (v) => {
    const guests = num(v.guests);
    const perTable = num(v.perTable);
    const spare = num(v.spare) ?? 0;
    if (guests === null || perTable === null) return { tables: null };
    if (guests < 1 || perTable < 1 || spare < 0 || spare > 100) return { tables: null };
    const g = Math.round(guests);
    const p = Math.round(perTable);
    const chairs = Math.ceil(g * (1 + spare / 100) - 1e-9);
    const tables = Math.ceil(chairs / p - 1e-9);
    const capacity = tables * p;
    const empty = capacity - g;
    return {
      tables,
      chairs,
      capacity,
      empty,
      tone: 'good',
      badge: `${tables} ${tables === 1 ? 'table' : 'tables'}, ${chairs} chairs`,
      note: `${g} guests plus ${spare}% spare is ${chairs} seats. At ${p} per table that is ${tables} ${tables === 1 ? 'table' : 'tables'}, which seat ${capacity} and leave ${empty} empty.`,
      chart: {
        type: 'bar',
        title: 'Seats',
        categories: ['Guests', 'Chairs needed', 'Seats at tables'],
        series: [{ name: 'Seats', values: [g, chairs, capacity] }],
        format: { format: 'number' },
        highlight: 1,
      },
      steps: [
        `Seats needed = ${g} × (1 + ${spare}%) = ${chairs} (rounded up)`,
        `Tables = ${chairs} ÷ ${p} = ${tables} (rounded up)`,
        `Seats at tables = ${tables} × ${p} = ${capacity}; empty = ${capacity} − ${g} = ${empty}`,
      ],
    };
  },
  content: {
    formula: [
      'Seats needed = guests × (1 + spare %), rounded up',
      'Tables = seats needed ÷ seats per table, rounded up',
      'Empty seats = tables × seats per table − guests',
    ],
    body: [
      'Count everyone who needs a seat, add a little spare room, then divide by how many people one table holds. Always round up: you cannot rent 4.4 tables.',
      'The spare percentage is your own choice. The 10% default covers a few late additions; use 0 for a fixed guest list. Seats per table depends on the table and how much elbow room you want, so check the rental listing.',
      'This is arithmetic only. It does not account for buffet lines, dance floors or room size, and everything runs in your browser.',
    ],
    faq: [
      { q: 'How many tables do I need for 40 guests?', a: 'With 8 seats per table and 10% spare, you need 44 seats, which is 6 tables (48 seats, 8 empty). With no spare it would be 5 tables.' },
      { q: 'How many chairs do I need?', a: 'Guests plus spare seats, rounded up. For 40 guests and 10% spare that is 44 chairs.' },
      { q: 'Why do tables seat more than chairs needed?', a: 'Tables come in whole units. 44 chairs at 8 per table needs 5.5 tables, so you round up to 6 and get 48 seats.' },
      { q: 'How many people fit at a table?', a: 'It varies. A round table often seats 8 and a 6 ft rectangle about 6, but follow the rental company or manufacturer guidance for yours.' },
    ],
    sources: [],
  },
  related: ['party-food-quantity', 'party-drinks', 'dinner-timeline', 'holiday-spending-total'],
  examples: [
    // 40 * 1.1 = 44 chairs; 44/8 = 5.5 -> 6 tables; 48 seats; 8 empty.
    { values: { guests: 40, perTable: 8, spare: 10 }, expect: { tables: 6, chairs: 44, capacity: 48, empty: 8 }, tolerance: 1e-6 },
    // 40 guests, no spare: 40/8 = 5 tables; 0 empty.
    { values: { guests: 40, perTable: 8, spare: 0 }, expect: { tables: 5, chairs: 40, capacity: 40, empty: 0 }, tolerance: 1e-6 },
    // 25 * 1.2 = 30 chairs; 30/6 = 5 tables; 30 seats.
    { values: { guests: 25, perTable: 6, spare: 20 }, expect: { tables: 5, chairs: 30, capacity: 30, empty: 5 }, tolerance: 1e-6 },
  ],
});
