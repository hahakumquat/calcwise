import { defineCalculator } from '../../lib/types';
import { bar, byteLength, charts, jsonErrorLocation, on, str } from '../../lib/helpers/text';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

function stats(v: Json): { keys: number; depth: number } {
  if (v === null || typeof v !== 'object') return { keys: 0, depth: 0 };
  const children = Array.isArray(v) ? v : Object.values(v);
  let keys = Array.isArray(v) ? 0 : children.length;
  let depth = 0;
  for (const c of children) {
    const s = stats(c);
    keys += s.keys;
    depth = Math.max(depth, s.depth);
  }
  return { keys, depth: depth + 1 };
}

function sortDeep(v: Json): Json {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === 'object') {
    const out: { [k: string]: Json } = {};
    for (const k of Object.keys(v).sort()) out[k] = sortDeep(v[k]);
    return out;
  }
  return v;
}

export default defineCalculator({
  slug: 'json-formatter',
  title: 'JSON Formatter & Validator',
  category: 'developer',
  description: 'Pretty-print, minify and validate JSON, with the exact line and column of any syntax error.',
  keywords: ['json beautifier', 'json validator', 'json pretty print', 'json minify', 'format json', 'json lint', 'json viewer'],
  popular: true,
  layout: 'wide',
  inputs: [
    {
      id: 'json', info: 'Paste JSON from an API response, log or config file. It is parsed locally in your browser and never uploaded.',
      label: 'JSON',
      type: 'textarea',
      mono: true,
      rows: 12,
      placeholder: 'Paste JSON here…',
      default: '{"name":"CalcWise","version":2,"tags":["tools","json"],"owner":{"team":"web","active":true},"stars":null}',
    },
    {
      id: 'indent', info: 'How to lay out the result: indented with 2 or 4 spaces or tabs, or minified onto a single line.',
      label: 'Output',
      type: 'select',
      default: '2',
      segmented: true,
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
        { value: 'tab', label: 'Tabs' },
        { value: 'min', label: 'Minified' },
      ],
    },
    { id: 'sortKeys', info: 'Reorder object keys A–Z at every level. Useful for comparing two JSON documents.', label: 'Sort keys alphabetically', type: 'toggle', default: false },
  ],
  outputs: [
    { id: 'formatted', info: 'Your JSON re-printed with the chosen layout. Values are unchanged.', label: 'Formatted JSON', format: 'code', primary: true },
    { id: 'bytes', info: 'Size of the formatted output in UTF-8 bytes.', label: 'Output size', format: 'integer', suffix: 'bytes' },
    { id: 'inputBytes', info: 'Size of what you pasted, in UTF-8 bytes. Compare with the output to see what minifying saves.', label: 'Input size', format: 'integer', suffix: 'bytes' },
    { id: 'keys', info: 'Total number of object keys at every nesting level.', label: 'Keys', format: 'integer', help: 'Total object keys at every level.' },
    { id: 'depth', info: 'How many objects or arrays are nested inside each other at the deepest point. A plain value has depth 0.', label: 'Max nesting depth', format: 'integer' },
  ],
  compute: (v) => {
    const text = str(v.json);
    if (!text.trim()) return { formatted: null, error: 'Paste some JSON to format.' };
    let data: Json;
    try {
      data = JSON.parse(text);
    } catch {
      return { formatted: null, error: jsonErrorLocation(text) };
    }
    if (on(v.sortKeys)) data = sortDeep(data);
    const ind = str(v.indent);
    const formatted = ind === 'min' ? JSON.stringify(data) : JSON.stringify(data, null, ind === 'tab' ? '\t' : Number(ind) || 2);
    const s = stats(data);
    const types = { Objects: 0, Arrays: 0, Strings: 0, Numbers: 0, Booleans: 0, Nulls: 0 };
    const walk = (x: Json) => {
      if (x === null) types.Nulls++;
      else if (Array.isArray(x)) (types.Arrays++, x.forEach(walk));
      else if (typeof x === 'object') (types.Objects++, Object.values(x).forEach(walk));
      else if (typeof x === 'string') types.Strings++;
      else if (typeof x === 'number') types.Numbers++;
      else types.Booleans++;
    };
    walk(data);
    return {
      formatted,
      bytes: byteLength(formatted),
      inputBytes: byteLength(text),
      keys: s.keys,
      depth: s.depth,
      note: 'Valid JSON',
      chart: charts(bar('Values by type', Object.keys(types), Object.values(types), { name: 'Count' })),
    };
  },
  content: {
    body: [
      'Paste JSON from an API response, log line or config file and get it back neatly indented, or squeezed onto one line for transport. The formatter parses your input with the browser\'s own strict JSON parser, so if it formats here, any standards-compliant program will accept it.',
      'When the input is not valid, you get the line and column of the first problem and the characters around it. The usual culprits are trailing commas after the last item, single quotes instead of double quotes, unquoted keys, comments, and missing commas between items — all fine in JavaScript, none allowed in JSON.',
      'Sorting keys makes two JSON documents easier to compare, because the same data always prints in the same order. The statistics show the total number of keys at every level and how deeply objects and arrays are nested.',
      'Your JSON never leaves your device: parsing and formatting run locally in your browser, which makes the tool safe for tokens, customer records and internal configs.',
    ],
    faq: [
      { q: 'Why is my JSON invalid when it works in JavaScript?', a: 'JSON is a strict subset of JavaScript object syntax. Keys and strings must use double quotes, trailing commas are forbidden, and comments, undefined, NaN and functions are not allowed.' },
      { q: 'Does formatting change my data?', a: 'No, with one caveat: integers larger than 2^53 (about 9 quadrillion) lose precision in JavaScript, so very long numeric IDs may be rounded. Store such IDs as strings.' },
      { q: 'Is 2-space or 4-space indentation better?', a: 'It is a style choice. Two spaces is the common default for JavaScript projects and keeps deep structures readable; four spaces is popular in Python and Java codebases.' },
    ],
  },
  related: ['json-to-csv', 'csv-to-json', 'jwt-decoder', 'base64'],
  examples: [
    { values: { json: '{"a":1,"b":[true,null]}', indent: '2', sortKeys: 'off' }, expect: { formatted: '{\n  "a": 1,\n  "b": [\n    true,\n    null\n  ]\n}', keys: 2, depth: 2, bytes: 45 } },
    { values: { json: '{ "b": 1,\n  "a": {"c": "é"} }', indent: 'min', sortKeys: 'on' }, expect: { formatted: '{"a":{"c":"é"},"b":1}', keys: 3, depth: 2, bytes: 22 } },
    { values: { json: '{\n  "a": 1,\n}', indent: '2', sortKeys: 'off' }, expect: { error: 'Invalid JSON at line 3, column 1: trailing comma before "}" (near "}")' } },
  ],
});
