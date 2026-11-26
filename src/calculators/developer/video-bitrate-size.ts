import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Decimal units: 1 MB = 1,000,000 bytes = 8,000 kilobits; 1 GB = 1,000 MB.
const KBIT_PER_MB = 8000;

function fmt(n: number, digits = 2): string {
  return Number(n.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits });
}

function sizeText(mb: number): string {
  return mb >= 1000 ? `${fmt(mb / 1000)} GB` : `${fmt(mb)} MB`;
}

export default defineCalculator({
  slug: 'video-bitrate-size',
  title: 'Video Bitrate to File Size Calculator',
  category: 'developer',
  description: 'Find a video file size from its video and audio bitrate and duration, or the maximum bitrate that fits a target size.',
  metaDescription: 'Turn video and audio bitrate (kbps) and duration into file size in MB or GB, or find the max bitrate that fits a target size. Overhead not included.',
  updated: '2026-11-26',
  keywords: ['video bitrate to file size', 'video file size calculator', 'bitrate calculator', 'video size from bitrate', 'target file size bitrate', 'kbps to MB'],
  inputs: [
    {
      id: 'mode', label: 'I want to find', type: 'select', default: 'size',
      options: [
        { value: 'size', label: 'File size from bitrate' },
        { value: 'bitrate', label: 'Max bitrate for a target size' },
      ],
      info: 'Pick file size to see how big a video will be at a given bitrate, or max bitrate to see how much bitrate fits inside a file size limit.',
    },
    { id: 'video', label: 'Video bitrate', type: 'number', default: 8000, min: 0, step: 100, suffix: 'kbps', showWhen: { input: 'mode', is: 'size' }, info: 'The video stream bitrate in kilobits per second. 8,000 kbps (8 Mbps) is typical for 1080p; 35,000 to 45,000 kbps for 4K.' },
    { id: 'audio', label: 'Audio bitrate', type: 'number', default: 128, min: 0, step: 16, suffix: 'kbps', info: 'The audio stream bitrate in kilobits per second. 128 to 192 kbps is common for stereo AAC. Use 0 for a silent video.' },
    { id: 'minutes', label: 'Duration', type: 'number', default: 10, min: 0, step: 0.5, suffix: 'min', info: 'Length of the video in minutes. Use decimals for seconds, for example 1.5 for 1 minute 30 seconds.' },
    { id: 'target', label: 'Target file size', type: 'number', default: 300, min: 0, step: 10, showWhen: { input: 'mode', is: 'bitrate' }, info: 'The largest file you can have, such as an upload or email limit. Pick the unit next to it.' },
    {
      id: 'targetUnit', label: 'Size unit', type: 'select', default: 'MB', showWhen: { input: 'mode', is: 'bitrate' },
      options: [
        { value: 'MB', label: 'MB (1,000,000 bytes)' },
        { value: 'GB', label: 'GB (1,000 MB)' },
      ],
      info: 'Decimal units, as used by upload limits and storage labels. 1 MB is 8,000 kilobits.',
    },
  ],
  outputs: [
    { id: 'size', label: 'File size', format: 'text', primary: true, showWhen: { input: 'mode', is: 'size' }, info: 'Estimated size of the video and audio streams together, in decimal MB or GB.' },
    { id: 'sizeMB', label: 'Size in MB', format: 'number', precision: 2, suffix: 'MB', showWhen: { input: 'mode', is: 'size' }, info: 'The same size in megabytes (1 MB = 1,000,000 bytes).' },
    { id: 'totalKbps', label: 'Total bitrate', format: 'number', precision: 0, suffix: 'kbps', showWhen: { input: 'mode', is: 'size' }, info: 'Video plus audio bitrate.' },
    { id: 'maxTotal', label: 'Max total bitrate', format: 'number', precision: 0, suffix: 'kbps', primary: true, showWhen: { input: 'mode', is: 'bitrate' }, info: 'The highest combined video and audio bitrate that keeps the file at or under the target size.' },
    { id: 'maxVideo', label: 'Max video bitrate', format: 'number', precision: 0, suffix: 'kbps', showWhen: { input: 'mode', is: 'bitrate' }, info: 'The total bitrate minus the audio bitrate you entered: what is left for the video stream.' },
    { id: 'perMinute', label: 'Size per minute', format: 'number', precision: 2, suffix: 'MB/min', info: 'Megabytes used by each minute of video at this bitrate.' },
  ],
  compute: (v) => {
    const mode = String(v.mode ?? 'size');
    const audio = num(v.audio) ?? 0;
    const minutes = num(v.minutes);
    if (minutes === null) return { size: null, maxTotal: null };
    if (audio < 0) return { size: null, maxTotal: null, error: 'Audio bitrate cannot be negative.' };
    if (minutes <= 0) return { size: null, maxTotal: null, error: 'Enter a duration above zero.' };
    const seconds = minutes * 60;

    if (mode === 'bitrate') {
      const target = num(v.target);
      if (target === null) return { maxTotal: null };
      if (target <= 0) return { maxTotal: null, error: 'Enter a target size above zero.' };
      const targetMB = String(v.targetUnit ?? 'MB') === 'GB' ? target * 1000 : target;
      const totalKbps = (targetMB * KBIT_PER_MB) / seconds;
      const videoKbps = totalKbps - audio;
      if (videoKbps <= 0) {
        return { maxTotal: null, error: `The audio alone needs more than ${fmt(totalKbps, 0)} kbps. Lower the audio bitrate, shorten the video or raise the target size.` };
      }
      return {
        maxTotal: totalKbps,
        maxVideo: videoKbps,
        perMinute: targetMB / minutes,
        tone: 'ok',
        badge: 'Estimate',
        note: 'Container overhead (muxing, metadata) is not included, so aim a few percent under this.',
        steps: [
          `${fmt(targetMB, 2)} MB × 8,000 kilobits per MB = ${fmt(targetMB * KBIT_PER_MB, 0)} kilobits`,
          `${fmt(minutes, 2)} min = ${fmt(seconds, 0)} s, so total bitrate = ${fmt(targetMB * KBIT_PER_MB, 0)} ÷ ${fmt(seconds, 0)} = ${fmt(totalKbps, 1)} kbps`,
          `Video bitrate = ${fmt(totalKbps, 1)} − ${fmt(audio, 0)} audio = ${fmt(videoKbps, 1)} kbps`,
        ],
      };
    }

    const video = num(v.video);
    if (video === null) return { size: null };
    if (video < 0) return { size: null, error: 'Video bitrate cannot be negative.' };
    const total = video + audio;
    const mb = (total * seconds) / KBIT_PER_MB;
    return {
      size: sizeText(mb),
      sizeMB: mb,
      totalKbps: total,
      perMinute: mb / minutes,
      tone: 'ok',
      badge: 'Estimate',
      note: 'Container overhead (muxing, metadata) is not included, so the real file is usually a little larger.',
      steps: [
        `Total bitrate = ${fmt(video, 0)} + ${fmt(audio, 0)} = ${fmt(total, 0)} kbps`,
        `Duration = ${fmt(minutes, 2)} min = ${fmt(seconds, 0)} s`,
        `Size = ${fmt(total, 0)} × ${fmt(seconds, 0)} ÷ 8,000 = ${fmt(mb, 2)} MB`,
      ],
    };
  },
  content: {
    formula: [
      'size (MB) = (video kbps + audio kbps) × seconds ÷ 8,000',
      'max total kbps = target size (MB) × 8,000 ÷ seconds',
      '1 MB = 1,000,000 bytes = 8,000 kilobits; 1 GB = 1,000 MB',
    ],
    body: [
      'A bitrate is the number of kilobits a video or audio stream uses every second. Multiply the combined bitrate by the duration in seconds to get the total kilobits, then divide by 8,000 to turn kilobits into decimal megabytes. For example, 8,000 kbps of video plus 128 kbps of audio for 10 minutes (600 seconds) is 8,128 × 600 ÷ 8,000 = 609.6 MB.',
      'To work the other way, start from a size limit. A 300 MB cap on a 10-minute video allows 300 × 8,000 ÷ 600 = 4,000 kbps in total. Subtract the audio bitrate to find what is left for the video stream.',
      'This is an estimate for constant bitrate. Variable bitrate encoders hover around the average you set but can drift. The container (MP4, MKV, MOV) adds a small overhead for headers, indexes and metadata that is not included here, so leave a few percent of headroom when you must stay under a limit.',
    ],
    faq: [
      { q: 'How big is a 10-minute video at 8,000 kbps?', a: 'With 128 kbps of audio, the total is 8,128 kbps. Over 600 seconds that is 8,128 × 600 ÷ 8,000 = 609.6 MB, or about 60.96 MB per minute, before container overhead.' },
      { q: 'What bitrate do I need to fit a 300 MB file for 10 minutes?', a: 'The total bitrate can be at most 300 × 8,000 ÷ 600 = 4,000 kbps. With 128 kbps of audio, that leaves 3,872 kbps for the video.' },
      { q: 'Does this include container overhead?', a: 'No. MP4 and MKV headers and metadata add a small amount on top, so the finished file is usually slightly larger than the estimate. Aim a few percent under a hard size limit.' },
      { q: 'Why 8,000 kilobits per megabyte?', a: 'A byte is 8 bits and a decimal megabyte is 1,000,000 bytes, which is 8,000,000 bits or 8,000 kilobits. This uses decimal units, not the binary MiB used by some operating systems.' },
    ],
  },
  related: ['download-time', 'data-storage-converter', 'time-converter'],
  examples: [
    // (8000 + 128) × 600 ÷ 8000 = 609.6 MB; 609.6 ÷ 10 = 60.96 MB/min
    { values: { mode: 'size', video: 8000, audio: 128, minutes: 10 }, expect: { size: '609.6 MB', sizeMB: 609.6, totalKbps: 8128, perMinute: 60.96 } },
    // (5000 + 192) × 5400 ÷ 8000 = 5192 × 0.675 = 3504.6 MB = 3.5 GB (3.5046 rounded to 2 dp); 3504.6 ÷ 90 = 38.94 MB/min
    { values: { mode: 'size', video: 5000, audio: 192, minutes: 90 }, expect: { size: '3.5 GB', sizeMB: 3504.6, perMinute: 38.94 }, tolerance: 1e-9 },
    // 300 × 8000 ÷ 600 = 4000 kbps total; minus 128 audio = 3872 video; 300 ÷ 10 = 30 MB/min
    { values: { mode: 'bitrate', audio: 128, minutes: 10, target: 300, targetUnit: 'MB' }, expect: { maxTotal: 4000, maxVideo: 3872, perMinute: 30 } },
    // 2 GB = 2000 MB; 80 min = 4800 s; 2000 × 8000 ÷ 4800 = 3333.333 kbps; minus 192 = 3141.333
    { values: { mode: 'bitrate', audio: 192, minutes: 80, target: 2, targetUnit: 'GB' }, expect: { maxTotal: 3333.3333333, maxVideo: 3141.3333333, perMinute: 25 }, tolerance: 1e-6 },
  ],
});
