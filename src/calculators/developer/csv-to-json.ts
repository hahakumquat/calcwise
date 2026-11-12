import { defineCalculator } from '../../lib/types';
import { bar, charts, on, parseCsv, str } from '../../lib/helpers/text';

const DELIMS: Record<string, string> = { comma: ',', semicolon: ';', tab: '\t', pipe: '|' };

/** Picks the delimiter that appears most often (outside quotes) in the first line. */
function detect(text: string): string {
  const first = text.split(/\r?\n/)[0].replace(/"[^"]*"/g, '');
  let best = ',';
  let bestN = 0;
  for (const d of [',', ';', '\t', '|']) {
    const n = first.split(d).length - 1;
    if (n > bestN) [best, bestN] = [d, n];
  }
  return best;
}

function typed(s: string): unknown {
  const t = s.trim();
  if (t === '') return null;
  if (t === 'true' || t === 'false') return t === 'true';
  if (t === 'null') return null;
  // Keep leading-zero values like ZIP codes and phone numbers as strings.
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(t) && Number.isFinite(Number(t)) && Math.abs(Number(t)) <= Number.MAX_SAFE_INTEGER) return Number(t);
  return s;
}

export default defineCalculator({
  slug: 'csv-to-json',
  title: 'CSV to JSON Converter',
  category: 'developer',
  description: 'Convert CSV or TSV data into a JSON array, with quoted fields, auto-detected delimiters and optional number detection.',
  keywords: ['csv to json array', 'excel to json', 'tsv to json', 'spreadsheet to json', 'convert csv'],
  layout: 'wide',
  inputs: [
    {
      id: 'csv', info: 'Paste CSV or TSV, for example exported from Excel or Google Sheets. Quoted fields with commas or line breaks are handled.',
      label: 'CSV',
      type: 'textarea',
      mono: true,
      rows: 10,
      default: 'id,name,city,active\n1,Ada Lovelace,London,true\n2,"Hopper, Grace","New York",false\n3,"Alan ""The Prof"" Turing",Wilmslow,',
    },
    {
      id: 'delim', info: 'The column separator. Auto picks whichever of comma, semicolon, tab or pipe appears most in the first line.',
      label: 'Delimiter',
      type: 'select',
      default: 'auto',
      segmented: true,
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'comma', label: 'Comma' },
        { value: 'semicolon', label: 'Semicolon' },
        { value: 'tab', label: 'Tab' },
        { value: 'pipe', label: 'Pipe' },
      ],
    },
    { id: 'header', info: 'Use the first row as property names. When off, you get an array of arrays.', label: 'First row is a header', type: 'toggle', default: true },
    { id: 'types', info: 'Turn plain numbers into JSON numbers, true/false into booleans and empty cells into null. Leading-zero values stay strings.', label: 'Convert numbers, true/false and empty cells', type: 'toggle', default: true },
  ],
  outputs: [
    { id: 'json', info: 'Your data as pretty-printed JSON, ready to copy.', label: 'JSON', format: 'code', primary: true },
    { id: 'rows', info: 'Number of JSON records (data rows, excluding the header).', label: 'Records', format: 'integer' },
    { id: 'columns', info: 'The number of cells in the widest row.', label: 'Columns', format: 'integer' },
  ],
  compute: (v) => {
    const text = str(v.csv).replace(/^﻿/, '');
    if (!text.trim()) return { json: null, error: 'Paste some CSV to convert.' };
    const d = DELIMS[str(v.delim)] ?? detect(text);
    const { rows, error } = parseCsv(text, d);
    if (error) return { json: null, error };
    const conv = on(v.types) ? typed : (s: string) => s;
    const columns = Math.max(0, ...rows.map((r) => r.length));
    let out: unknown[];
    let chart;
    if (on(v.header)) {
      const [head = [], ...body] = rows;
      const keys = head.map((h, i) => h.trim() || `column${i + 1}`);
      for (let i = keys.length; i < columns; i++) keys.push(`column${i + 1}`);
      out = body.map((r) => Object.fromEntries(keys.map((k, i) => [k, i < r.length ? conv(r[i]) : null])));
      if (keys.length > 1) chart = bar('Filled cells per column', keys, keys.map((_, i) => body.filter((r) => (r[i] ?? '').trim() !== '').length), { name: 'Non-empty', horizontal: true });
    } else out = rows.map((r) => r.map(conv));
    return { json: JSON.stringify(out, null, 2), rows: out.length, columns, chart: charts(chart) };
  },
  content: {
    body: [
      'Each CSV row becomes a JSON object whose keys come from the header row. Quoted fields are handled properly: commas, line breaks and doubled quotes ("") inside quotes are part of the value, not separators. A byte-order mark from Excel exports is stripped automatically.',
      'Auto-detect picks whichever of comma, semicolon, tab or pipe appears most often in the first line. With type conversion on, plain numbers become JSON numbers, true and false become booleans, and empty cells become null. Numbers with leading zeros, like ZIP codes "02134", are kept as strings so they are not silently changed.',
      'Turn off the header option to get an array of arrays instead of objects. Parsing happens in your browser, so the file contents never leave your computer.',
    ],
    faq: [
      { q: 'What if rows have different numbers of columns?', a: 'Short rows get null for the missing fields. Extra cells beyond the header get generated names like column5, so no data is dropped.' },
      { q: 'Why is my whole row in one field?', a: 'The delimiter was probably detected wrongly — for example a semicolon-separated export with commas inside values. Pick the delimiter manually.' },
      { q: 'Can it handle large files?', a: 'Tens of thousands of rows convert in well under a second. Very large files (hundreds of megabytes) are better handled by a command-line tool.' },
    ],
  },
  related: ['json-to-csv', 'json-formatter'],
  examples: [
    {
      values: { csv: 'a,b\n1,"x, ""y"""\n007,', delim: 'auto', header: 'on', types: 'on' },
      expect: { json: '[\n  {\n    "a": 1,\n    "b": "x, \\"y\\""\n  },\n  {\n    "a": "007",\n    "b": null\n  }\n]', rows: 2, columns: 2 },
    },
    { values: { csv: 'x;y\r\n1;2', delim: 'auto', header: 'off', types: 'off' }, expect: { json: '[\n  [\n    "x",\n    "y"\n  ],\n  [\n    "1",\n    "2"\n  ]\n]', rows: 2 } },
    { values: { csv: 'a\n"open', delim: 'comma', header: 'on', types: 'on' }, expect: { error: 'Unclosed quoted field starting on line 2.' } },
  ],
});
