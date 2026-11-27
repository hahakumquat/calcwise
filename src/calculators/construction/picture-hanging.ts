import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number) => String(+n.toFixed(2));

export default defineCalculator({
  slug: 'picture-hanging',
  title: 'Picture Hanging Calculator',
  category: 'construction',
  description: 'Space a row of frames evenly on a wall: get the gap, the left edge of each frame and the hook height from your frame size and hanging drop.',
  keywords: ['picture hanging calculator', 'gallery wall spacing', 'how to space picture frames', 'picture hook height', 'hang pictures evenly', 'frame spacing on wall'],
  inputs: [
    { id: 'wallWidth', label: 'Wall width', type: 'number', suffix: 'in', default: 120, min: 0, step: 0.5, info: 'The width of the wall space you want the row of frames to fill, in inches.' },
    { id: 'count', label: 'Number of frames', type: 'number', default: 3, min: 1, max: 50, step: 1, info: 'How many frames go in one row. They are assumed to be the same size.' },
    { id: 'frameWidth', label: 'Frame width', type: 'number', suffix: 'in', default: 20, min: 0, step: 0.25, info: 'The outside width of one frame, in inches.' },
    { id: 'frameHeight', label: 'Frame height', type: 'number', suffix: 'in', default: 24, min: 0, step: 0.25, info: 'The outside height of one frame, in inches.' },
    { id: 'centre', label: 'Centre height from floor', type: 'number', suffix: 'in', default: 57, min: 0, step: 0.5, help: '57 in is a common gallery convention. Change it to suit your room.', info: 'How high above the floor the middle of each frame should sit. 57 in is a commonly used gallery height, not a rule.' },
    { id: 'drop', label: 'Hanging drop', type: 'number', suffix: 'in', default: 3, min: 0, step: 0.25, info: 'The distance from the top of the frame down to the wire or hanger when it is pulled taut. Pull the wire up with a tape measure to find it.' },
  ],
  outputs: [
    { id: 'gap', label: 'Even gap', suffix: 'in', precision: 2, primary: true, info: 'The same space at both ends of the row and between each pair of frames: (wall width - frames × frame width) ÷ (frames + 1).' },
    { id: 'edges', label: 'Left edge of each frame', format: 'text', info: 'Distance from the left end of the wall to the left edge of each frame, in order, in inches.' },
    { id: 'hook', label: 'Hook height from floor', suffix: 'in', precision: 2, info: 'Where the nail or hook goes: centre height + half the frame height - hanging drop. The same for every frame.' },
  ],
  compute: (v) => {
    const W = num(v.wallWidth);
    const n = Math.floor(num(v.count) ?? 0);
    const fw = num(v.frameWidth);
    const fh = num(v.frameHeight);
    const centre = num(v.centre);
    const drop = num(v.drop) ?? 0;
    if (W === null || fw === null || fh === null || centre === null || n < 1) return { gap: null };
    if (W <= 0 || fw <= 0 || fh <= 0 || centre < 0 || drop < 0) return { gap: null };
    const gap = (W - n * fw) / (n + 1);
    if (gap < 0) {
      return { gap: null, error: `The frames are wider than the wall: ${n} × ${fmt(fw)} in is ${fmt(n * fw)} in, and the wall is ${fmt(W)} in. Use fewer or narrower frames, or a wider wall.` };
    }
    const edgeList = Array.from({ length: n }, (_, i) => gap * (i + 1) + fw * i);
    const hook = centre + fh / 2 - drop;
    const shown = edgeList.map(fmt);
    return {
      chart: {
        type: 'donut',
        title: 'How the wall width is used',
        slices: [
          { label: 'Frames', value: n * fw },
          { label: 'Gaps', value: gap * (n + 1) },
        ],
        format: { suffix: 'in' },
        centerValue: `${fmt(gap)} in`,
        centerLabel: 'each gap',
      },
      gap,
      edges: shown.join(', ') + ' in',
      hook,
      tone: gap < 2 ? 'warn' : 'good',
      badge: `${fmt(gap)} in gaps`,
      note: gap < 2 ? 'The gaps are very tight. Fewer or smaller frames may look better.' : 'Measure from the left end of the wall to the left edge of each frame.',
      steps: [
        `Gap = (${fmt(W)} - ${n} × ${fmt(fw)}) ÷ (${n} + 1) = ${fmt(gap)} in`,
        `Left edge of frame k = gap × k + frame width × (k - 1): ${shown.join(', ')} in`,
        `Hook height = ${fmt(centre)} + ${fmt(fh)} ÷ 2 - ${fmt(drop)} = ${fmt(hook)} in`,
      ],
    };
  },
  content: {
    formula: [
      'Gap = (wall width - frames × frame width) ÷ (frames + 1)',
      'Left edge of frame k = gap × k + frame width × (k - 1)',
      'Hook height = centre height + frame height ÷ 2 - hanging drop',
    ],
    body: [
      'To hang a row of frames evenly, leave the same space at both ends of the wall and between each pair of frames. That is one more gap than there are frames, so the leftover wall width is divided by the number of frames plus one. Measure from the left end of the wall to each frame’s left edge and mark it.',
      'The hook goes below the top of the frame, not at the top. Pull the wire or hanger taut and measure how far it sits below the frame top: that is the hanging drop. The hook height is the centre height plus half the frame height, minus that drop.',
      'The default centre height of 57 in is a common gallery convention, not a rule. Raise or lower it to suit your room and who looks at the wall most. This assumes frames of one size in a single row. Use a stud finder or the right anchor for heavy frames.',
    ],
    faq: [
      { q: 'How far apart should I hang frames on a 120 in wall?', a: 'With 3 frames 20 in wide, the frames take 60 in, so 60 in is left over. Divided by 4 gaps, each gap is 15 in. The left edges sit 15, 50 and 85 in from the left end of the wall.' },
      { q: 'Where does the hook go for a 24 in tall frame?', a: 'With the centre at 57 in and a 3 in hanging drop, the hook goes at 57 + 12 - 3 = 66 in from the floor.' },
      { q: 'What if the frames do not fit on the wall?', a: 'If the frames are wider together than the wall, the gap would be negative and the calculator shows an error. Use fewer frames, narrower frames or a wider wall.' },
      { q: 'Why is the centre height 57 in?', a: '57 in is a commonly used gallery convention for the middle of a picture. It is a starting point you can change in the centre height field.' },
      { q: 'How do I measure the hanging drop?', a: 'Pull the wire or hanger up tight as it would sit on the hook, then measure from the top of the frame down to the highest point of the wire.' },
    ],
    sources: [{ label: 'Standard spacing arithmetic; the 57 in centre height is a common convention, not a code or standard' }],
  },
  related: ['wall-stud-count', 'square-footage'],
  examples: [
    // 120 wide, 3 x 20: gap (120-60)/4 = 15; edges 15, 15*2+20=50, 15*3+40=85; hook 57+12-3=66
    { values: { wallWidth: 120, count: 3, frameWidth: 20, frameHeight: 24, centre: 57, drop: 3 }, expect: { gap: 15, edges: '15, 50, 85 in', hook: 66 } },
    // 110 wide, 4 x 15: gap (110-60)/5 = 10; edges 10, 35, 60, 85; hook 60+5-2=63
    { values: { wallWidth: 110, count: 4, frameWidth: 15, frameHeight: 10, centre: 60, drop: 2 }, expect: { gap: 10, edges: '10, 35, 60, 85 in', hook: 63 } },
  ],
});
