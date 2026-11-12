import { defineCalculator } from '../../lib/types';
import { charts, convertCase, str } from '../../lib/helpers/text';

export default defineCalculator({
  slug: 'case-converter',
  title: 'Case Converter',
  category: 'text',
  description: 'Convert text to UPPER, lower, Title or Sentence case, or to camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE.',
  keywords: ['uppercase', 'lowercase', 'title case', 'sentence case', 'camelcase', 'snake case', 'kebab case', 'change case'],
  popular: true,
  layout: 'wide',
  inputs: [
    {
      id: 'mode', info: 'The style to convert to. The first four keep your spaces and punctuation; the programming styles join words into identifiers.',
      label: 'Convert to',
      type: 'select',
      default: 'title',
      options: [
        { value: 'upper', label: 'UPPER CASE' },
        { value: 'lower', label: 'lower case' },
        { value: 'title', label: 'Title Case' },
        { value: 'sentence', label: 'Sentence case' },
        { value: 'camel', label: 'camelCase' },
        { value: 'pascal', label: 'PascalCase' },
        { value: 'snake', label: 'snake_case' },
        { value: 'kebab', label: 'kebab-case' },
        { value: 'constant', label: 'CONSTANT_CASE' },
      ],
    },
    { id: 'text', info: 'The text to convert. For the programming cases, each line is converted separately so you can rename a whole list.', label: 'Text', type: 'textarea', rows: 6, default: 'the quick brown fox jumps over the lazy dog' },
  ],
  outputs: [{ id: 'result', info: 'Your text in the chosen case, ready to copy.', label: 'Converted text', format: 'code', primary: true }],
  compute: (v) => {
    const text = str(v.text);
    const result = convertCase(text, str(v.mode) || 'title');
    const count = (s: string) => {
      let up = 0, low = 0;
      for (const ch of s) {
        if (ch !== ch.toLowerCase()) up++;
        else if (ch !== ch.toUpperCase()) low++;
      }
      return [up, low];
    };
    const [u1, l1] = count(text);
    const [u2, l2] = count(result);
    return {
      result,
      chart: charts({
        type: 'bar',
        title: 'Uppercase vs lowercase letters',
        categories: ['Before', 'After'],
        series: [
          { name: 'Uppercase', values: [u1, u2] },
          { name: 'Lowercase', values: [l1, l2] },
        ],
        stacked: true,
        format: { format: 'integer' },
      }),
    };
  },
  content: {
    body: [
      'The first four options change capitalisation but keep your spacing and punctuation. Title Case capitalises every word except short joining words such as "and", "of" and "the" (unless they start the text or follow a colon). Sentence case lowercases everything, then capitalises the first letter of each sentence and the pronoun "I" — proper nouns need a manual touch afterwards.',
      'The programming cases split each line into words at spaces, punctuation, underscores, hyphens and lower-to-upper transitions, so "user ID", "userId", "user-id" and "USER_ID" all become the same four results. Acronyms are kept together: "parseHTTPResponse" splits into parse, HTTP, Response. Each line is converted separately, which makes it easy to rename a whole list of variables at once.',
      'Conversion runs in your browser, so you can paste code or private text safely.',
    ],
    faq: [
      { q: 'What is the difference between camelCase and PascalCase?', a: 'Both join words without spaces and capitalise each word. camelCase keeps the very first letter lowercase (firstName); PascalCase capitalises it too (FirstName). JavaScript variables usually use camelCase, while classes and types use PascalCase.' },
      { q: 'When should I use snake_case or kebab-case?', a: 'snake_case is standard for Python variables and database columns. kebab-case is used in URLs, CSS class names and file names. CONSTANT_CASE is the convention for constants and environment variables.' },
      { q: 'Does it handle accented letters?', a: 'Yes. Upper- and lowercasing follow Unicode rules, so "é" becomes "É" and Greek or Cyrillic text converts correctly.' },
    ],
  },
  related: ['slug-generator', 'word-counter', 'find-and-replace', 'reverse-text'],
  examples: [
    { values: { mode: 'title', text: 'the lord of the rings: the return of the king' }, expect: { result: 'The Lord of the Rings: The Return of the King' } },
    { values: { mode: 'sentence', text: 'HELLO THERE. i AM HERE! ok?' }, expect: { result: 'Hello there. I am here! Ok?' } },
    { values: { mode: 'camel', text: 'user ID number' }, expect: { result: 'userIdNumber' } },
    { values: { mode: 'snake', text: 'parseHTTPResponse' }, expect: { result: 'parse_http_response' } },
    { values: { mode: 'pascal', text: 'background-color' }, expect: { result: 'BackgroundColor' } },
    { values: { mode: 'kebab', text: 'Hello World Again' }, expect: { result: 'hello-world-again' } },
    { values: { mode: 'constant', text: 'maxRetryCount' }, expect: { result: 'MAX_RETRY_COUNT' } },
    { values: { mode: 'upper', text: 'straße' }, expect: { result: 'STRASSE' } },
  ],
});
