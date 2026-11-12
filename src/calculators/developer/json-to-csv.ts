import { defineCalculator } from '../../lib/types';
import { bar, charts, csvField, jsonErrorLocation, on, str } from '../../lib/helpers/text';

type Row = Record<string, unknown>;

function flatten(obj: Row, prefix = '', out: Row = {}): Row {
  for (const [k, val] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length) flatten(val as Row, key, out);
    else out[key] = val;
  }
  return out;
}

const cell = (val: unknown): string =>
  val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);

const DELIMS: Record<string, string> = { comma: ',', semicolon: ';', tab: '\t', pipe: '|' };

export default defineCalculator({
  slug: 'json-to-csv',
  title: 'JSON to CSV Converter',
  category: 'developer',
  description: 'Convert a JSON array of objects into CSV for Excel or Google Sheets, flattening nested fields into columns.',
  keywords: ['json to excel', 'json to spreadsheet', 'convert json', 'json array to csv', 'export json'],
  layout: 'wide',
  inputs: [
    {
      id: 'json', info: 'A JSON array of objects (one object per row). A single object, an array of arrays or a list of plain values also works.',
      label: 'JSON array',
      type: 'textarea',
      mono: true,
      rows: 10,
      default:
        '[\n  {"id": 1, "name": "Ada Lovelace", "address": {"city": "London"}, "tags": ["math", "code"]},\n  {"id": 2, "name": "Grace Hopper", "address": {"city": "New York"}, "note": "Said \\"debug\\", first"}\n]',
    },
    {
      id: 'delim', info: 'The character between columns. Use semicolon for spreadsheets set to a European locale, or tab to paste straight into a sheet.',
      label: 'Delimiter',
      type: 'select',
      default: 'comma',
      segmented: true,
      options: [
        { value: 'comma', label: 'Comma' },
        { value: 'semicolon', label: 'Semicolon' },
        { value: 'tab', label: 'Tab' },
        { value: 'pipe', label: 'Pipe' },
      ],
    },
    { id: 'flatten', info: 'Turn nested objects into dotted column names like address.city. When off, nested objects are written as JSON text in one cell.', label: 'Flatten nested objects (address.city)', type: 'toggle', default: true },
    { id: 'header', info: 'Put the column names on the first line of the CSV.', label: 'Include header row', type: 'toggle', default: true },
  ],
  outputs: [
    { id: 'csv', info: 'The CSV text. Cells containing the delimiter, quotes or line breaks are quoted as RFC 4180 requires.', label: 'CSV', format: 'code', primary: true },
    { id: 'rows', info: 'Number of data rows, not counting the header.', label: 'Data rows', format: 'integer' },
    { id: 'columns', info: 'Number of columns — every distinct key found in any object.', label: 'Columns', format: 'integer' },
  ],
  compute: (v) => {
    const text = str(v.json);
    if (!text.trim()) return { csv: null, error: 'Paste a JSON array to convert.' };
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return { csv: null, error: jsonErrorLocation(text) };
    }
    const d = DELIMS[str(v.delim)] ?? ',';
    const items = Array.isArray(data) ? data : [data];
    if (!items.length) return { csv: '', rows: 0, columns: 0 };
    let header: string[] = [];
    let body: string[][];
    if (items.every((x) => Array.isArray(x))) {
      // Array of arrays: already tabular.
      body = (items as unknown[][]).map((r) => r.map(cell));
      header = [];
    } else if (items.every((x) => x !== null && typeof x === 'object' && !Array.isArray(x))) {
      const rows = (items as Row[]).map((r) => (on(v.flatten) ? flatten(r) : r));
      const seen = new Set<string>();
      for (const r of rows) for (const k of Object.keys(r)) if (!seen.has(k)) (seen.add(k), header.push(k));
      body = rows.map((r) => header.map((k) => cell(r[k])));
    } else {
      body = items.map((x) => [cell(x)]);
      header = ['value'];
    }
    const lines = body.map((r) => r.map((c) => csvField(c, d)).join(d));
    if (on(v.header) && header.length) lines.unshift(header.map((c) => csvField(c, d)).join(d));
    const columns = header.length || Math.max(0, ...body.map((r) => r.length));
    const filled = header.map((_, i) => body.filter((r) => r[i] !== '').length);
    return {
      csv: lines.join('\r\n'),
      rows: body.length,
      columns,
      chart: header.length > 1 ? charts(bar('Filled cells per column', header, filled, { name: 'Non-empty', horizontal: true })) : undefined,
    };
  },
  content: {
    body: [
      'Give the converter a JSON array where each element is an object, and each object becomes one CSV row. Columns are the union of every key that appears, in the order they are first seen, so records with missing fields simply get empty cells instead of shifting columns.',
      'Nested objects are flattened into dot-separated column names — {"address": {"city": "London"}} becomes a column called address.city. Arrays and objects that cannot be flattened are written as compact JSON inside the cell, so no information is lost. Values containing the delimiter, quotes or line breaks are wrapped in double quotes, with inner quotes doubled, following RFC 4180.',
      'Choose semicolons if your spreadsheet uses a comma as the decimal separator (common in Europe), or tabs to paste straight into a sheet. Conversion runs entirely in your browser; your data is not uploaded.',
    ],
    faq: [
      { q: 'How do I open the CSV in Excel?', a: 'Copy the output into a text file saved with a .csv extension, then open it. If accented characters look wrong, use Data → From Text/CSV and choose UTF-8 encoding.' },
      { q: 'What if my JSON is a single object?', a: 'A single object is treated as a one-row table. A list of plain values becomes a single "value" column, and an array of arrays is written row by row without a header.' },
    ],
  },
  related: ['csv-to-json', 'json-formatter'],
  examples: [
    {
      values: { json: '[{"a":1,"b":{"c":"x,y"}},{"a":2,"d":[1,2]}]', delim: 'comma', flatten: 'on', header: 'on' },
      expect: { csv: 'a,b.c,d\r\n1,"x,y",\r\n2,,"[1,2]"', rows: 2, columns: 3 },
    },
    { values: { json: '[{"q":"say \\"hi\\""}]', delim: 'semicolon', flatten: 'off', header: 'off' }, expect: { csv: '"say ""hi"""', rows: 1 } },
    { values: { json: '[[1,2],[3,4]]', delim: 'tab', flatten: 'on', header: 'on' }, expect: { csv: '1\t2\r\n3\t4', columns: 2 } },
  ],
});
