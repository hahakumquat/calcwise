import type { UnitGroup } from './units';

export type CategoryId =
  | 'math'
  | 'statistics'
  | 'finance'
  | 'health'
  | 'physics'
  | 'chemistry'
  | 'construction'
  | 'conversion'
  | 'everyday'
  | 'sports'
  | 'food'
  | 'biology'
  | 'ecology'
  | 'text'
  | 'developer'
  | 'other';

interface BaseInput {
  /** Key used in `values` passed to compute() and in the shareable URL. */
  id: string;
  label: string;
  /** Short hint shown under the field. */
  help?: string;
  /** Tooltip shown from the ⓘ icon next to the label: what this field means and how to find the value. Required. */
  info?: string;
  /** Only show (and only pass a value for) this input when another select/toggle input has one of these values. Hidden inputs reach compute() as null. */
  showWhen?: ShowWhen;
}

export interface ShowWhen {
  input: string;
  is: string | string[];
}

export interface NumberInput extends BaseInput {
  type: 'number';
  /** If set, the user can pick a unit and compute() receives the value in the group's base unit. */
  unit?: UnitGroup;
  /** Unit id selected initially (must belong to `unit`). */
  defaultUnit?: string;
  /** Restrict the unit dropdown to these ids. */
  units?: string[];
  /** Initial value, in the default unit. Omit to start empty. */
  default?: number;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Decorations for plain numbers, e.g. '$' or '%'. */
  prefix?: string;
  suffix?: string;
  /** Optional inputs may be left blank; compute() receives null. */
  optional?: boolean;
}

export interface SelectInput extends BaseInput {
  type: 'select';
  options: { value: string; label: string }[];
  default?: string;
  /** Render as a segmented control instead of a dropdown (good for 2–4 options). */
  segmented?: boolean;
}

export interface ListInput extends BaseInput {
  type: 'list';
  /** Numbers separated by commas, spaces or new lines. compute() receives number[]. */
  default?: string;
  placeholder?: string;
}

export interface TextInput extends BaseInput {
  type: 'text';
  default?: string;
  placeholder?: string;
  optional?: boolean;
}

export interface DateInput extends BaseInput {
  type: 'date';
  /** ISO yyyy-mm-dd, or 'today'. compute() receives a yyyy-mm-dd string or null. */
  default?: string;
  optional?: boolean;
}

/** Multi-line text box for text and developer tools. compute() receives the raw string ('' when empty). */
export interface TextareaInput extends BaseInput {
  type: 'textarea';
  default?: string;
  placeholder?: string;
  /** Monospace font (code, JSON, Base64…). */
  mono?: boolean;
  /** Visible rows. Default 8. */
  rows?: number;
}

/** On/off switch. compute() receives the string 'on' or 'off'. */
export interface ToggleInput extends BaseInput {
  type: 'toggle';
  default?: boolean;
}

export type Input = NumberInput | SelectInput | ListInput | TextInput | DateInput | TextareaInput | ToggleInput;

/**
 * 'code' renders a monospace, scrollable, copyable block (multi-line output of text/dev tools).
 * 'text' renders a short string.
 */
export type OutputFormat = 'number' | 'integer' | 'currency' | 'percent' | 'text' | 'code';

export interface Output {
  id: string;
  label: string;
  /** compute() returns this value in the group's base unit; the user can switch display unit. */
  unit?: UnitGroup;
  defaultUnit?: string;
  units?: string[];
  format?: OutputFormat;
  /** Max fraction digits for number/currency/percent. Default 4 (2 for currency). */
  precision?: number;
  /** Plain-text suffix for unitless numbers, e.g. 'kg/m²' or 'years'. */
  suffix?: string;
  /** The headline result. Exactly one output should be primary. */
  primary?: boolean;
  help?: string;
  /** Tooltip shown from the ⓘ icon: what this result means and how to read it. Required. */
  info?: string;
  /** Only show this output when a select/toggle input has one of these values. Several outputs may be primary if their showWhen conditions never overlap. */
  showWhen?: ShowWhen;
}

/* ───────────── Charts ───────────── */

/** Number formatting for chart values/axes. */
export interface ChartFormat {
  format?: 'number' | 'integer' | 'currency' | 'percent';
  /** Values are in this group's BASE unit; the chart converts to the unit the user has selected. */
  unit?: UnitGroup;
  /** Plain suffix for unitless values, e.g. 'bpm'. */
  suffix?: string;
}

export interface LineChart {
  type: 'line' | 'area';
  title?: string;
  /** X values (numbers, or category labels). */
  x: (number | string)[];
  xLabel?: string;
  xFormat?: ChartFormat;
  yLabel?: string;
  yFormat?: ChartFormat;
  series: { name: string; values: (number | null)[] }[];
  /** Stack area series on top of each other (e.g. contributions + interest). */
  stacked?: boolean;
  /** Vertical marker lines at x positions. */
  markers?: { x: number | string; label: string }[];
}

export interface BarChart {
  type: 'bar';
  title?: string;
  categories: string[];
  series: { name: string; values: number[] }[];
  format?: ChartFormat;
  stacked?: boolean;
  /** Horizontal bars — good for many or long category labels. */
  horizontal?: boolean;
  /** Index of a category to emphasise (e.g. the user's result). */
  highlight?: number;
}

export interface DonutChart {
  type: 'donut';
  title?: string;
  slices: { label: string; value: number }[];
  format?: ChartFormat;
  centerLabel?: string;
  centerValue?: string;
}

/** A horizontal scale with coloured bands and a marker — BMI ranges, grades, strength meters. */
export interface ScaleChart {
  type: 'scale';
  title?: string;
  min: number;
  max: number;
  value: number;
  valueLabel?: string;
  bands: { from: number; to: number; label: string; tone?: 'good' | 'ok' | 'warn' | 'bad' | 'neutral' }[];
  format?: ChartFormat;
}

/** Normal (or Student t) curve with shaded regions — p-values, z-scores, confidence intervals. */
export interface DistributionChart {
  type: 'distribution';
  title?: string;
  mean: number;
  sd: number;
  /** Degrees of freedom: draws a t distribution instead of normal. */
  df?: number;
  /** Shaded x-ranges; omit from/to for an open tail. */
  shade?: { from?: number; to?: number; label?: string }[];
  markers?: { x: number; label: string }[];
  format?: ChartFormat;
}

export interface ScatterChart {
  type: 'scatter';
  title?: string;
  points: [number, number][];
  /** Optional fitted line y = slope·x + intercept. */
  line?: { slope: number; intercept: number; label?: string };
  xLabel?: string;
  yLabel?: string;
  xFormat?: ChartFormat;
  yFormat?: ChartFormat;
}

export type ChartSpec = LineChart | BarChart | DonutChart | ScaleChart | DistributionChart | ScatterChart;

export type Values = Record<string, number | string | number[] | null>;

export interface ComputeResult {
  /** Values keyed by output id. `percent` format expects a fraction (0.25 → 25%). */
  [outputId: string]: number | string | null | undefined | string[] | ChartSpec | ChartSpec[];
  /** Visualisation(s) of the result, drawn under the numbers. Return one for every calculator where a picture helps. */
  chart?: ChartSpec | ChartSpec[];
  /** Optional worked steps shown under the result. */
  steps?: string[];
  /** Optional one-line interpretation, e.g. "Healthy weight". */
  note?: string;
  /** Optional error message shown instead of results (e.g. "Invalid JSON at line 3"). */
  error?: string;
}

export interface Calculator {
  slug: string;
  title: string;
  category: CategoryId;
  /** One sentence for cards and <meta description>. */
  description: string;
  /** Search keywords / synonyms. */
  keywords?: string[];
  inputs: Input[];
  outputs: Output[];
  /** Pure function. Throw or return nulls when inputs are invalid. */
  compute: (values: Values) => ComputeResult;
  content?: {
    /** Formula(s), rendered monospace. */
    formula?: string[];
    /** Explanatory paragraphs (original writing). */
    body?: string[];
    faq?: { q: string; a: string }[];
  };
  /** Slugs of related calculators (any category). */
  related?: string[];
  /** Mark the most important calculators for the homepage. */
  popular?: boolean;
  /** 'wide' stacks inputs above outputs at full width — use for text/developer tools. */
  layout?: 'default' | 'wide';
  /** Output uses randomness (passwords, UUIDs): shows a "Regenerate" button. */
  random?: boolean;
  /** Example inputs and expected outputs, used by `npm test`. */
  examples?: { values: Values; expect: Record<string, number | string>; tolerance?: number }[];
}

export function defineCalculator(c: Calculator): Calculator {
  return c;
}
