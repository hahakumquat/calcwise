import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'deck-boards',
  title: 'Deck Boards Calculator',
  category: 'construction',
  description: 'Count how many deck boards to buy from your deck size, board width, gap and board length, with a waste allowance added.',
  keywords: ['deck boards needed', 'how many deck boards', 'decking calculator', 'deck board count', 'composite decking', 'deck materials'],
  inputs: [
    { id: 'length', label: 'Deck length (along the boards)', type: 'number', suffix: 'ft', default: 12, min: 0, step: 0.1, info: 'The deck dimension the boards run along, in feet.' },
    { id: 'width', label: 'Deck width (across the boards)', type: 'number', suffix: 'ft', default: 10, min: 0, step: 0.1, info: 'The deck dimension that the rows of boards stack across, in feet.' },
    { id: 'boardWidth', label: 'Board width', type: 'number', suffix: 'in', default: 5.5, min: 0, step: 0.125, info: 'The actual width, not the nominal size. A "5/4x6" board is about 5.5 in wide, and a "2x6" is also about 5.5 in. Check the product label.' },
    { id: 'gap', label: 'Gap between boards', type: 'number', suffix: 'in', default: 0.125, min: 0, step: 0.0625, info: 'Spacing between neighbouring boards. 1/8 in (0.125) is common, but follow the maker’s instructions.' },
    { id: 'boardLength', label: 'Board length', type: 'number', suffix: 'ft', default: 12, min: 0, step: 1, info: 'The length of the boards you plan to buy, in feet. Common lengths are 8, 12, 16 and 20 ft.' },
    { id: 'waste', label: 'Waste allowance', type: 'number', suffix: '%', default: 10, min: 0, max: 100, info: 'Extra for cuts, end trimming and damaged boards. About 10% suits a straight layout, 15% or more suits diagonal patterns.' },
  ],
  outputs: [
    { id: 'boards', label: 'Boards to buy', format: 'integer', primary: true, info: 'Rows times boards per row, plus the waste allowance, rounded up to whole boards.' },
    { id: 'rows', label: 'Rows of boards', format: 'integer', info: 'Deck width divided by board width plus gap, rounded up.' },
    { id: 'perRow', label: 'Boards per row', format: 'integer', info: 'Deck length divided by board length, rounded up. More than 1 means joined boards, so plan the joints over joists.' },
    { id: 'beforeWaste', label: 'Boards before waste', format: 'integer', info: 'Rows times boards per row, with no waste allowance.' },
  ],
  compute: (v) => {
    const L = num(v.length);
    const W = num(v.width);
    const bw = num(v.boardWidth);
    const gap = num(v.gap) ?? 0;
    const bl = num(v.boardLength);
    const waste = num(v.waste) ?? 0;
    if (L === null || W === null || bw === null || bl === null) return { boards: null };
    if (L <= 0 || W <= 0 || bw <= 0 || bl <= 0 || gap < 0 || waste < 0) return { boards: null };
    const rows = ceilSafe((W * 12) / (bw + gap));
    const perRow = ceilSafe(L / bl);
    const base = rows * perRow;
    const boards = ceilSafe(base * (1 + waste / 100));
    return {
      chart: {
        type: 'donut',
        title: 'Where the boards go',
        slices: [
          { label: 'Boards for the deck', value: base },
          { label: 'Waste allowance', value: boards - base },
        ],
        centerValue: String(boards),
        centerLabel: 'boards',
      },
      boards,
      rows,
      perRow,
      beforeWaste: base,
      tone: 'ok',
      badge: `${boards} boards`,
      note: 'Check joist spacing, fixings and local building code separately.',
      steps: [
        `Rows = ceil(${+(W * 12).toFixed(2)} in ÷ (${bw} + ${gap}) in) = ${rows}`,
        `Boards per row = ceil(${L} ft ÷ ${bl} ft) = ${perRow}`,
        `Total = ceil(${rows} × ${perRow} × ${+(1 + waste / 100).toFixed(4)}) = ${boards} boards`,
      ],
    };
  },
  content: {
    formula: [
      'Rows = ceil(deck width in inches ÷ (board width + gap))',
      'Boards per row = ceil(deck length ÷ board length)',
      'Total = ceil(rows × boards per row × (1 + waste % ÷ 100))',
    ],
    body: [
      'Deck boards run in rows across the width of the deck. Each row takes up one board width plus the small gap left between boards, so dividing the deck width by that figure and rounding up gives the number of rows. If the deck is longer than your boards, each row needs more than one board.',
      'Use the actual width of the board, not the nominal size on the label. Many 6 in boards are really about 5.5 in wide, and that difference adds up to extra rows over a wide deck.',
      'This is a board count only. It does not cover joist spacing, the framing, fixings, fascia or railings, and it is not building-code advice. Check your plans, the board maker’s instructions and local code before you buy.',
    ],
    faq: [
      { q: 'How many boards does a 12 ft by 10 ft deck need?', a: 'With 5.5 in boards, a 0.125 in gap and 12 ft boards, 120 in ÷ 5.625 in is 21.33, so 22 rows. Each row is 1 board, and 22 × 1.10 is 24.2, so buy 25 boards.' },
      { q: 'How many boards does a 16 ft by 12 ft deck need?', a: 'With the same boards, 144 in ÷ 5.625 in is 25.6, so 26 rows. A 16 ft run needs 2 boards of 12 ft per row, so 52 boards, and 52 × 1.10 is 57.2, so buy 58.' },
      { q: 'Should I use nominal or actual board width?', a: 'Use the actual width. A board sold as 6 in is often about 5.5 in wide. Using the nominal size would undercount the rows.' },
      { q: 'How much waste should I allow?', a: 'The default is 10%, which suits a straight layout. Diagonal or patterned layouts usually need 15% or more. You can change it in the waste field.' },
      { q: 'Does this check joist spacing or building code?', a: 'No. It only counts boards. Joist spacing, board span limits, fixings and code rules depend on the product and your area, so check them separately.' },
    ],
    sources: [{ label: 'Standard layout arithmetic (rows = width ÷ (board width + gap), rounded up); actual board widths vary by product, so check the label' }],
  },
  related: ['flooring', 'square-footage'],
  examples: [
    // 12x10 ft: 120 in / 5.625 = 21.33 -> 22 rows; 12/12 = 1 per row; 22 x 1.1 = 24.2 -> 25
    { values: { length: 12, width: 10, boardWidth: 5.5, gap: 0.125, boardLength: 12, waste: 10 }, expect: { boards: 25, rows: 22, perRow: 1, beforeWaste: 22 } },
    // 16x12 ft: 144 / 5.625 = 25.6 -> 26 rows; 16/12 = 1.33 -> 2 per row; 52 x 1.1 = 57.2 -> 58
    { values: { length: 16, width: 12, boardWidth: 5.5, gap: 0.125, boardLength: 12, waste: 10 }, expect: { boards: 58, rows: 26, perRow: 2, beforeWaste: 52 } },
    // ceil boundary: 11.25 ft = 135 in / 5.625 = exactly 24 rows; 12/12 = 1; no waste -> 24
    { values: { length: 12, width: 11.25, boardWidth: 5.5, gap: 0.125, boardLength: 12, waste: 0 }, expect: { boards: 24, rows: 24 } },
  ],
});
