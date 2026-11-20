import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'fence-calculator',
  title: 'Fence Calculator',
  category: 'construction',
  description: 'How many fence sections and posts do you need? Enter the run length and section width for counts, with an optional cost from your section and post prices.',
  keywords: ['fence calculator', 'how many fence posts do i need', 'fence panels calculator', 'fence cost calculator', 'fence sections and posts', 'fence post spacing'],
  inputs: [
    { id: 'length', label: 'Fence length', type: 'number', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', default: 30.48, min: 0, info: 'Total length of the fence line. For a closed loop, such as a pen or a yard, enter the full perimeter.' },
    { id: 'width', label: 'Section width (post to post)', type: 'number', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', default: 2.4384, min: 0, info: 'Length of one panel or the gap you leave between posts. Common panels are 6 or 8 ft wide. Measure centre to centre of the posts.' },
    { id: 'loop', label: 'Closed loop (fence returns to the start)', type: 'toggle', default: false, info: 'Off: an open run needs one more post than sections. On: the last section meets the first post, so posts equal sections.' },
    { id: 'sectionPrice', label: 'Price per section', type: 'number', prefix: '$', default: 60, min: 0, optional: true, placeholder: 'Optional', info: 'Cost of one panel or one span of rails and pickets. Leave blank to skip the cost.' },
    { id: 'postPrice', label: 'Price per post', type: 'number', prefix: '$', default: 15, min: 0, optional: true, placeholder: 'Optional', info: 'Cost of one post. Leave blank to skip the cost.' },
  ],
  outputs: [
    { id: 'sections', label: 'Sections', format: 'integer', primary: true, info: 'Length ÷ section width, rounded up so the whole line is covered.' },
    { id: 'posts', label: 'Posts', format: 'integer', info: 'Sections + 1 for an open run, or equal to sections for a closed loop. Add extras for gates and corners if your posts are different.' },
    { id: 'coverage', label: 'Length covered', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', precision: 1, info: 'Sections × section width. It is at least your fence length, and a cut panel can make up the difference.' },
    { id: 'cost', label: 'Material cost', format: 'currency', info: 'Sections × section price + posts × post price, before tax, gates, hardware and labour.' },
  ],
  compute: (v) => {
    const len = num(v.length), w = num(v.width);
    if (len === null || w === null || len <= 0 || w <= 0) return { sections: null };
    const sections = ceilSafe(len / w - 1e-9);
    const posts = v.loop === 'on' ? sections : sections + 1;
    const sp = num(v.sectionPrice), pp = num(v.postPrice);
    const cost = sp === null && pp === null ? null : sections * (sp ?? 0) + posts * (pp ?? 0);
    return {
      sections,
      posts,
      coverage: sections * w,
      cost,
      chart: {
        type: 'bar',
        title: 'What to buy',
        categories: ['Sections', 'Posts'],
        series: [{ name: 'Count', values: [sections, posts] }],
        format: { format: 'integer' },
      },
      steps: [
        `Sections = ${len.toFixed(2)} m ÷ ${w.toFixed(3)} m = ${(len / w).toFixed(2)} → round up to ${sections}`,
        v.loop === 'on' ? `Closed loop: posts = sections = ${posts}` : `Open run: posts = sections + 1 = ${posts}`,
      ],
    };
  },
  content: {
    formula: ['Sections = fence length ÷ section width, rounded up', 'Posts = sections + 1 (open run) or sections (closed loop)', 'Cost = sections × section price + posts × post price'],
    body: [
      'A fence is a row of sections held between posts. Divide the length by the width of one section and round up to get the number of sections. A 100 foot run with 8 foot panels is 12.5 sections, so you buy 13, and the last one is cut or placed a little short.',
      'Posts are where people miscount. An open run needs a post at both ends, so the post count is one more than the section count: 13 sections need 14 posts. A closed loop meets itself, so 13 sections need only 13 posts. At $60 a section and $15 a post, the open run costs $780 plus $210, or $990, and the closed loop costs $975.',
      'The calculator counts straight sections and ordinary posts. It does not add gates, extra corner posts, concrete, rails, hardware or labour, and local rules may limit height or require a permit, so check before you buy.',
    ],
    faq: [
      { q: 'How many posts do I need for 100 feet of fence with 8 foot sections?', a: '14 posts for an open run: 100 ÷ 8 = 12.5, rounded up to 13 sections, plus one. A closed loop of the same length needs 13.' },
      { q: 'Why is there one more post than sections?', a: 'Each section needs a post at both ends, and neighbouring sections share one. 13 sections have 12 shared posts plus 2 end posts, which is 14.' },
      { q: 'Does it include gates and corners?', a: 'No. A gate replaces a section and usually needs sturdier posts, and corners may need extra bracing. Add them to your own list.' },
      { q: 'What if the last section is shorter?', a: 'The count still rounds up. You buy a full panel and cut it, or use a custom narrow section, which may cost less than the full price.' },
    ],
  },
  related: ['gravel', 'concrete', 'tile'],
  examples: [
    // 100 ft = 30.48 m, 8 ft = 2.4384 m: 12.5 -> 13 sections, 14 posts, 13 x 60 + 14 x 15 = 990
    { values: { length: 30.48, width: 2.4384, loop: 'off', sectionPrice: 60, postPrice: 15 }, expect: { sections: 13, posts: 14, cost: 990, coverage: 13 * 2.4384 }, tolerance: 1e-6 },
    { values: { length: 30.48, width: 2.4384, loop: 'on', sectionPrice: 60, postPrice: 15 }, expect: { sections: 13, posts: 13, cost: 975 }, tolerance: 1e-6 },
    // exact fit: 96 ft / 8 ft = 12 sections, 13 posts, no price
    { values: { length: 29.2608, width: 2.4384, loop: 'off', sectionPrice: null, postPrice: null }, expect: { sections: 12, posts: 13 }, tolerance: 1e-6 },
  ],
});
