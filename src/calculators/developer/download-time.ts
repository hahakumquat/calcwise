import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Bits per file-size unit: decimal (SI) units use powers of 1,000, binary (IEC) units powers of 1,024.
const SIZE_BITS: Record<string, number> = {
  MB: 8e6, GB: 8e9, TB: 8e12, MiB: 8 * 1024 ** 2, GiB: 8 * 1024 ** 3, TiB: 8 * 1024 ** 4,
};
// Bits per second for each speed unit.
const SPEED_BPS: Record<string, number> = { Mbps: 1e6, Gbps: 1e9, MBps: 8e6 };

function human(sec: number): string {
  const total = Math.round(sec);
  if (total < 60) return sec < 10 ? `${Math.round(sec * 10) / 10} s` : `${total} s`;
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d} d`);
  if (h) parts.push(`${h} h`);
  if (m) parts.push(`${m} min`);
  if (s && !d) parts.push(`${s} s`);
  return parts.join(' ');
}

export default defineCalculator({
  slug: 'download-time',
  title: 'Download Time Calculator',
  category: 'developer',
  description: 'Find how long a file takes to download or transfer from its size and your connection speed, with an efficiency setting for real-world overhead.',
  metaDescription: 'How long will a download take? Enter file size and connection speed (Mbps, Gbps or MB/s) to get the transfer time, with an overhead setting.',
  updated: '2026-11-20',
  keywords: ['download time calculator', 'file transfer time', 'how long to download', 'mbps to download time', 'upload time calculator', 'transfer time calculator'],
  inputs: [
    { id: 'size', label: 'File size', type: 'number', default: 5, min: 0, step: 0.1, info: 'The size of the file or total data to transfer. Pick the unit next to it.' },
    {
      id: 'sizeUnit', label: 'Size unit', type: 'select', default: 'GB',
      options: [
        { value: 'MB', label: 'MB (1,000,000 bytes)' },
        { value: 'GB', label: 'GB (10⁹ bytes)' },
        { value: 'TB', label: 'TB (10¹² bytes)' },
        { value: 'MiB', label: 'MiB (1,048,576 bytes)' },
        { value: 'GiB', label: 'GiB (1,073,741,824 bytes)' },
        { value: 'TiB', label: 'TiB (2⁴⁰ bytes)' },
      ],
      info: 'GB, MB and TB are decimal (powers of 1,000), as on drive labels and data plans. MiB, GiB and TiB are binary (powers of 1,024), which is what Windows labels “GB”.',
    },
    { id: 'speed', label: 'Connection speed', type: 'number', default: 100, min: 0, step: 1, info: 'Your download or upload speed. Internet plans are sold in megabits per second (Mbps); file managers often show megabytes per second (MB/s).' },
    {
      id: 'speedUnit', label: 'Speed unit', type: 'select', default: 'Mbps',
      options: [
        { value: 'Mbps', label: 'Mbps (megabits per second)' },
        { value: 'Gbps', label: 'Gbps (gigabits per second)' },
        { value: 'MBps', label: 'MB/s (megabytes per second)' },
      ],
      info: 'One byte is 8 bits, so 100 Mbps moves at most 12.5 MB each second.',
    },
    { id: 'efficiency', label: 'Efficiency', type: 'number', default: 100, min: 1, max: 100, step: 1, suffix: '%', info: 'The share of your rated speed you actually get. Protocol overhead, Wi-Fi and busy servers mean real transfers are often 80–95%. 100 gives the best-case time.' },
  ],
  outputs: [
    { id: 'time', label: 'Transfer time', format: 'text', primary: true, info: 'How long the transfer takes at the speed you entered, after the efficiency adjustment.' },
    { id: 'seconds', label: 'Total seconds', format: 'number', precision: 1, suffix: 's', info: 'The same time in seconds.' },
    { id: 'effective', label: 'Effective speed', format: 'number', precision: 2, suffix: 'MB/s', info: 'The speed you actually get, in megabytes per second, after the efficiency adjustment.' },
  ],
  compute: (v) => {
    const size = num(v.size);
    const speed = num(v.speed);
    const eff = num(v.efficiency) ?? 100;
    const bits = SIZE_BITS[String(v.sizeUnit ?? 'GB')];
    const bps = SPEED_BPS[String(v.speedUnit ?? 'Mbps')];
    if (size === null || speed === null || !bits || !bps) return { time: null };
    if (size < 0) return { time: null, error: 'File size cannot be negative.' };
    if (speed <= 0) return { time: null, error: 'Enter a speed above zero.' };
    if (eff <= 0 || eff > 100) return { time: null, error: 'Efficiency must be between 1 and 100%.' };
    const effBps = (speed * bps * eff) / 100;
    const seconds = (size * bits) / effBps;
    return {
      time: human(seconds),
      seconds,
      effective: effBps / 8e6,
      steps: [
        `${size} ${v.sizeUnit} = ${(size * bits).toLocaleString('en-US', { maximumFractionDigits: 0 })} bits`,
        `${speed} ${v.speedUnit} at ${eff}% = ${(effBps / 1e6).toLocaleString('en-US', { maximumFractionDigits: 2 })} Mbps`,
        `Time = bits ÷ bits per second = ${seconds.toLocaleString('en-US', { maximumFractionDigits: 1 })} s`,
      ],
    };
  },
  content: {
    formula: ['time (s) = file size in bits ÷ speed in bits per second', '1 byte = 8 bits', 'Decimal: 1 GB = 10⁹ bytes. Binary: 1 GiB = 2³⁰ bytes', 'real speed = rated speed × efficiency'],
    body: [
      'Internet speeds are quoted in bits per second while files are measured in bytes, and a byte is 8 bits. That is why a 100 Mbps connection tops out at 12.5 MB per second: a 5 GB file needs 40,000 megabits, which takes 400 seconds, or 6 minutes 40 seconds, at best.',
      'Size units matter too. A decimal GB is 1,000,000,000 bytes, while a binary GiB is 1,073,741,824 bytes, about 7.4% more. The same speed therefore takes longer for 1 GiB than for 1 GB.',
      'Real transfers rarely reach the rated speed. Protocol overhead, Wi-Fi signal, server limits and other devices on the network all take a share, so set the efficiency to 80–90% for a more realistic estimate. The result is an estimate, not a guarantee.',
    ],
    faq: [
      { q: 'How long does it take to download 5 GB at 100 Mbps?', a: 'At the full rated speed, 400 seconds (6 min 40 s). At 80% efficiency it takes 500 seconds (8 min 20 s).' },
      { q: 'Why is my download slower than my plan speed?', a: 'Plans list the maximum in megabits per second. Overhead, Wi-Fi, the server you download from and other devices share that bandwidth, so lower the efficiency setting to model it.' },
      { q: 'Is it Mbps or MB/s?', a: 'Mbps is megabits per second and MB/s is megabytes per second. Divide Mbps by 8 to get MB/s, so 100 Mbps is 12.5 MB/s at most.' },
    ],
  },
  related: ['data-storage-converter', 'time-converter', 'base64'],
  examples: [
    { values: { size: 5, sizeUnit: 'GB', speed: 100, speedUnit: 'Mbps', efficiency: 100 }, expect: { seconds: 400, time: '6 min 40 s', effective: 12.5 } },
    { values: { size: 1, sizeUnit: 'GiB', speed: 50, speedUnit: 'Mbps', efficiency: 100 }, expect: { seconds: 171.79869184, time: '2 min 52 s' }, tolerance: 1e-6 },
    { values: { size: 5, sizeUnit: 'GB', speed: 100, speedUnit: 'Mbps', efficiency: 80 }, expect: { seconds: 500, time: '8 min 20 s' } },
    { values: { size: 1, sizeUnit: 'TB', speed: 1, speedUnit: 'Gbps', efficiency: 100 }, expect: { seconds: 8000, time: '2 h 13 min 20 s' } },
  ],
});
