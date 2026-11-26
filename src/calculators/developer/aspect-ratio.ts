import { defineCalculator } from '../../lib/types';
import { num, gcd } from '../../lib/math';

export default defineCalculator({
  slug: 'aspect-ratio',
  title: 'Aspect Ratio Calculator and Resizer',
  category: 'developer',
  description: 'Enter a width and height to get the simplified aspect ratio, then type a new width or height to resize an image or video without stretching it.',
  metaDescription: 'Aspect ratio calculator: find the simplified ratio of any width and height, then resize an image or video to a new width or height keeping the ratio.',
  updated: '2026-11-26',
  keywords: ['aspect ratio calculator', 'resize image keep aspect ratio', 'aspect ratio resizer', '16:9 calculator', 'image dimensions calculator', 'video resolution ratio'],
  inputs: [
    { id: 'w', label: 'Width', type: 'number', default: 1920, min: 1, step: 1, suffix: 'px', info: 'The original width in whole pixels (or any unit, as long as height uses the same one).' },
    { id: 'h', label: 'Height', type: 'number', default: 1080, min: 1, step: 1, suffix: 'px', info: 'The original height in whole pixels, in the same unit as the width.' },
    {
      id: 'mode', label: 'Resize by', type: 'select', default: 'width', segmented: true,
      options: [
        { value: 'width', label: 'New width' },
        { value: 'height', label: 'New height' },
      ],
      info: 'Pick which side you know. The other side is calculated so the ratio stays the same.',
    },
    { id: 'size', label: 'New size', type: 'number', default: 1280, min: 1, step: 1, suffix: 'px', info: 'The new width or height, depending on what you picked above. Results are rounded to whole pixels.' },
  ],
  outputs: [
    { id: 'ratio', label: 'Aspect ratio', format: 'text', primary: true, info: 'Width : height with both numbers divided by their greatest common divisor.' },
    { id: 'decimal', label: 'Decimal ratio', format: 'number', precision: 4, info: 'Width divided by height. 1.7778 means the image is about 1.78 times wider than it is tall.' },
    { id: 'newW', label: 'New width (px)', format: 'number', precision: 0, info: 'Rounded to the nearest whole pixel.' },
    { id: 'newH', label: 'New height (px)', format: 'number', precision: 0, info: 'Rounded to the nearest whole pixel.' },
  ],
  compute: (v) => {
    const w = num(v.w);
    const h = num(v.h);
    const s = num(v.size);
    if (w === null || h === null || w <= 0 || h <= 0 || !Number.isInteger(w) || !Number.isInteger(h)) {
      return { ratio: null, error: 'Enter the width and height as whole numbers greater than zero.' };
    }
    const g = gcd(w, h);
    const rw = w / g;
    const rh = h / g;
    const byWidth = v.mode !== 'height';
    let newW: number | null = null;
    let newH: number | null = null;
    let step = 'Enter a new size above to resize.';
    if (s !== null && s > 0) {
      if (byWidth) {
        newW = s;
        newH = Math.round((s * h) / w);
        step = `New height = ${s} × ${h} ÷ ${w} = ${(s * h / w).toFixed(2)}, rounded to ${newH}`;
      } else {
        newH = s;
        newW = Math.round((s * w) / h);
        step = `New width = ${s} × ${w} ÷ ${h} = ${(s * w / h).toFixed(2)}, rounded to ${newW}`;
      }
    }
    return {
      ratio: `${rw}:${rh}`,
      decimal: w / h,
      newW,
      newH,
      tone: 'ok',
      badge: `${rw}:${rh}`,
      steps: [
        `Greatest common divisor of ${w} and ${h} is ${g}`,
        `${w} ÷ ${g} = ${rw} and ${h} ÷ ${g} = ${rh}, so the ratio is ${rw}:${rh}`,
        step,
      ],
    };
  },
  content: {
    formula: ['ratio = (width ÷ g) : (height ÷ g), where g = gcd(width, height)', 'new height = new width × height ÷ width', 'new width = new height × width ÷ height'],
    body: [
      'An aspect ratio describes the shape of a rectangle: how wide it is compared with how tall. To simplify it, divide both numbers by their greatest common divisor. A 1920 × 1080 screen has a divisor of 120, so it simplifies to 16:9.',
      'To resize without stretching, keep the same ratio. If you know the new width, multiply it by the original height and divide by the original width. Going from 1920 × 1080 to a width of 1280 gives 1280 × 1080 ÷ 1920 = 720.',
      'Results are rounded to whole pixels, because images cannot have fractional pixels. When the exact answer is not a whole number the resized ratio is off by a tiny amount, which is invisible in practice.',
      'Some sizes do not reduce to a familiar ratio. 1366 × 768 simplifies to 683:384, which is a close cousin of 16:9 (the decimal is 1.7786 against 1.7778). Common ratios are 16:9 for video, 4:3 for older screens, 4:5 for portrait social posts and 1:1 for squares.',
      'This calculator runs entirely in your browser; nothing is uploaded.',
    ],
    faq: [
      { q: 'What is the aspect ratio of 1920 × 1080?', a: '16:9. The greatest common divisor of 1920 and 1080 is 120, so 1920 ÷ 120 = 16 and 1080 ÷ 120 = 9. The decimal ratio is 1.7778.' },
      { q: 'How do I resize 1920 × 1080 to a width of 1280?', a: 'Choose New width and enter 1280. The height is 1280 × 1080 ÷ 1920 = 720, so the result is 1280 × 720.' },
      { q: 'What is the aspect ratio of 1080 × 1350?', a: '4:5. The greatest common divisor is 270, so 1080 ÷ 270 = 4 and 1350 ÷ 270 = 5. This is the portrait shape often used for social posts.' },
      { q: 'Why must width and height be whole numbers?', a: 'The greatest common divisor is only defined for whole numbers, and pixel sizes are whole numbers anyway. The new size can be a decimal; the result is rounded to the nearest pixel.' },
    ],
    sources: [{ label: 'Wikipedia: Aspect ratio (image)', url: 'https://en.wikipedia.org/wiki/Aspect_ratio_(image)' }, { label: 'Wikipedia: Greatest common divisor', url: 'https://en.wikipedia.org/wiki/Greatest_common_divisor' }],
  },
  related: ['ratio', 'video-bitrate-size', 'download-time'],
  examples: [
    // gcd(1920,1080)=120 -> 16:9; 1280*1080/1920 = 720
    { values: { w: 1920, h: 1080, mode: 'width', size: 1280 }, expect: { ratio: '16:9', newW: 1280, newH: 720 } },
    // gcd(1080,1350)=270 -> 4:5; height 1350 -> width 1080
    { values: { w: 1080, h: 1350, mode: 'height', size: 675 }, expect: { ratio: '4:5', newW: 540, newH: 675 } },
    // gcd(1000,750)=250 -> 4:3; 640*750/1000 = 480
    { values: { w: 1000, h: 750, mode: 'width', size: 640 }, expect: { ratio: '4:3', decimal: 1.3333333333333333, newH: 480 } },
  ],
});
