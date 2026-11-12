import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'data',
  [
    { id: 'MB', name: 'Megabytes (MB)', info: 'Megabyte: 1,000,000 bytes (SI). Used for file sizes and download sizes.' },
    { id: 'b', name: 'Bits', info: 'The smallest unit of data, a single 0 or 1. Network speeds are quoted in bits per second.' },
    { id: 'B', name: 'Bytes', info: 'A byte is 8 bits — enough to store one plain-text character.' },
    { id: 'KB', name: 'Kilobytes (KB)', info: 'Kilobyte: 1,000 bytes in the SI (decimal) system.' },
    { id: 'GB', name: 'Gigabytes (GB)', precision: 8, info: 'Gigabyte: one billion bytes. Phone storage and data plans use GB.' },
    { id: 'TB', name: 'Terabytes (TB)', precision: 10, info: 'Terabyte: 10¹² bytes, or 1,000 GB. Hard drives are sold in TB.' },
    { id: 'KiB', name: 'Kibibytes (KiB)', info: 'Kibibyte: 1,024 bytes (binary). Often labelled “KB” by operating systems.' },
    { id: 'MiB', name: 'Mebibytes (MiB)', info: 'Mebibyte: 1,024 KiB = 1,048,576 bytes.' },
    { id: 'GiB', name: 'Gibibytes (GiB)', precision: 8, info: 'Gibibyte: 1,024 MiB, about 7.4% more than a GB. Windows shows these as “GB”.' },
    { id: 'TiB', name: 'Tebibytes (TiB)', precision: 10, info: 'Tebibyte: 1,024 GiB, about 10% more than a TB.' },
  ],
  'MB',
  { chartUnits: ['GB', 'GiB'], chartTitle: 'Decimal GB vs binary GiB' },
);

export default defineCalculator({
  slug: 'data-storage-converter',
  title: 'Data Storage Converter',
  category: 'conversion',
  description: 'Convert between bits, bytes, KB, MB, GB, TB and the binary units KiB, MiB, GiB and TiB.',
  keywords: ['gb to mb', 'mb to gb', 'bytes converter', 'gib vs gb', 'file size converter', 'tb to gb'],
  inputs: [{ id: 'value', label: 'Amount of data', type: 'number', unit: 'data', defaultUnit: 'GB', default: 1, min: 0, info: 'Enter an amount of data and pick its unit; every other unit updates instantly.' }],
  outputs: conv.outputs,
  compute: conv.compute,
  content: {
    formula: ['1 byte = 8 bits', 'Decimal (SI): 1 KB = 1,000 B, 1 MB = 1,000 KB, 1 GB = 1,000 MB', 'Binary (IEC): 1 KiB = 1,024 B, 1 MiB = 1,024 KiB, 1 GiB = 1,024 MiB'],
    body: [
      'Two systems of prefixes are in use. Storage makers, network speeds and the SI standard count in powers of 1,000: a kilobyte is 1,000 bytes and a gigabyte is a billion bytes. Operating systems and memory chips have long counted in powers of 1,024, now formally called kibibytes (KiB), mebibytes (MiB) and gibibytes (GiB).',
      'The gap grows with each step: a KiB is 2.4% bigger than a KB, but a TiB is almost 10% bigger than a TB. That is why a “1 TB” drive shows up as about 931 GB in Windows, which labels its binary units with the decimal names.',
      'Network speeds are quoted in bits per second, while file sizes are in bytes. Divide megabits by 8 to get megabytes: a 100 Mb/s connection moves at most 12.5 MB of data per second.',
    ],
    faq: [
      { q: 'Is a gigabyte 1,000 or 1,024 megabytes?', a: 'By the SI definition, 1,000 MB. The 1,024-based unit is properly called a gibibyte (GiB), equal to 1,024 MiB.' },
      { q: 'Why does my new hard drive show less space than advertised?', a: 'The drive is measured in decimal TB, but the operating system reports binary units. 1 TB = 10¹² bytes ≈ 0.909 TiB, displayed as “931 GB”.' },
    ],
  },
  related: ['time-converter', 'length-converter'],
  examples: [
    { values: { value: 1e9 }, expect: { MB: 1000, GB: 1, b: 8e9, GiB: 0.9313225746 }, tolerance: 1e-9 },
    { values: { value: 1e12 }, expect: { TiB: 0.9094947018, GiB: 931.3225746 }, tolerance: 1e-9 },
    { values: { value: 1048576 }, expect: { MiB: 1, KiB: 1024, MB: 1.048576 } },
  ],
});
