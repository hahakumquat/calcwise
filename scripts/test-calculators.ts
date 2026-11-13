/**
 * Validates every calculator definition and runs its `examples`.
 * Usage: npm test            (all)
 *        npm test -- finance (only files whose path contains "finance")
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Calculator } from '../src/lib/types';
import { UNIT_GROUPS, toBase, defaultUnitFor } from '../src/lib/units';
import { CATEGORIES } from '../src/lib/categories';
import { renderChart, toChartList } from '../src/lib/chart';

const root = join(import.meta.dirname, '../src/calculators');
const filter = process.argv[2];
const files = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(join(root, d.name)).filter((f) => f.endsWith('.ts')).map((f) => join(root, d.name, f)))
  .filter((f) => !filter || f.includes(filter));

const catIds = new Set(CATEGORIES.map((c) => c.id));
const slugs = new Map<string, string>();
let failures = 0;
let passed = 0;
const fail = (file: string, msg: string) => {
  failures++;
  console.error(`✗ ${file.replace(root + '/', '')}: ${msg}`);
};

for (const file of files) {
  const mod = await import(pathToFileURL(file).href);
  const c: Calculator = mod.default;
  const rel = file.replace(root + '/', '');
  if (!c?.slug) {
    fail(file, 'no default export from defineCalculator()');
    continue;
  }
  const [dir, name] = rel.split('/');
  if (c.category !== dir) fail(file, `category "${c.category}" doesn't match folder "${dir}"`);
  if (name !== `${c.slug}.ts`) fail(file, `file name should be ${c.slug}.ts`);
  if (!catIds.has(c.category)) fail(file, `unknown category ${c.category}`);
  if (slugs.has(c.slug)) fail(file, `duplicate slug (also in ${slugs.get(c.slug)})`);
  slugs.set(c.slug, rel);
  const prim = c.outputs.filter((o) => o.primary);
  if (prim.length === 0) fail(file, 'one output must be primary');
  if (prim.length > 1 && prim.some((o) => !o.showWhen)) fail(file, 'several primary outputs are only allowed when each has showWhen');
  const ids = new Set<string>();
  const controls = new Map(c.inputs.filter((i) => i.type === 'select' || i.type === 'toggle').map((i) => [i.id, i]));
  for (const io of [...c.inputs, ...c.outputs]) {
    if (ids.has(io.id)) fail(file, `duplicate input/output id ${io.id}`);
    ids.add(io.id);
    if (['error', 'note', 'steps', 'chart', 'tone', 'badge'].includes(io.id)) fail(file, `"${io.id}" is reserved and can't be an input/output id`);
    if (!io.info || io.info.trim().length < 12) fail(file, `${io.id}: add an \`info\` tooltip (one or two plain sentences)`);
    if (io.showWhen) {
      const ctl = controls.get(io.showWhen.input);
      if (!ctl) fail(file, `${io.id}: showWhen.input "${io.showWhen.input}" must be a select or toggle input`);
      else {
        const valid = ctl.type === 'toggle' ? ['on', 'off'] : (ctl as { options: { value: string }[] }).options.map((o) => o.value);
        for (const v of Array.isArray(io.showWhen.is) ? io.showWhen.is : [io.showWhen.is])
          if (!valid.includes(v)) fail(file, `${io.id}: showWhen value "${v}" is not an option of ${ctl.id}`);
      }
    }
    if ('unit' in io && io.unit) {
      const g = UNIT_GROUPS[io.unit];
      if (!g) fail(file, `${io.id}: unknown unit group ${io.unit}`);
      for (const u of [...(io.units ?? []), ...(io.defaultUnit ? [io.defaultUnit] : [])])
        if (!g.units.some((x) => x.id === u)) fail(file, `${io.id}: unit ${u} not in ${io.unit}`);
    }
  }
  // Default inputs must compute without throwing.
  const defaults: Record<string, unknown> = {};
  for (const i of c.inputs) {
    if (i.type === 'number') {
      defaults[i.id] =
        i.default === undefined ? null : i.unit ? toBase(i.unit, defaultUnitFor(i.unit, i.defaultUnit, i.units), i.default) : i.default;
    } else if (i.type === 'list') {
      defaults[i.id] = (i.default ?? '').split(/[\s,;]+/).filter(Boolean).map(Number);
    } else if (i.type === 'select') {
      defaults[i.id] = i.default ?? i.options[0]?.value;
    } else if (i.type === 'date') {
      defaults[i.id] = i.default === 'today' ? new Date().toISOString().slice(0, 10) : (i.default ?? null);
    } else if (i.type === 'textarea') {
      defaults[i.id] = i.default ?? '';
    } else if (i.type === 'toggle') {
      defaults[i.id] = i.default ? 'on' : 'off';
    } else defaults[i.id] = i.default ?? null;
  }
  try {
    const r = c.compute(defaults as never);
    const primary = c.outputs.find((o) => o.primary && (!o.showWhen || [o.showWhen.is].flat().includes(String(defaults[o.showWhen.input]))));
    if (primary && r[primary.id] === undefined) fail(file, `compute() with defaults returned no value for primary output "${primary.id}"`);
    const charts = toChartList(r.chart as never);
    if (c.category !== 'developer' && charts.length === 0) fail(file, 'compute() should return a `chart` for the default inputs');
    for (const ch of charts) if (!renderChart(ch).html) fail(file, `chart "${ch.type}" rendered empty with default inputs`);
  } catch (e) {
    fail(file, `compute() threw with default inputs: ${(e as Error).message}`);
  }
  if (!c.examples?.length) fail(file, 'add at least one example');
  for (const [i, ex] of (c.examples ?? []).entries()) {
    try {
      const r = c.compute(ex.values);
      for (const [k, want] of Object.entries(ex.expect)) {
        const got = r[k];
        const tol = ex.tolerance ?? 1e-6;
        const ok =
          typeof want === 'number'
            ? typeof got === 'number' && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want))
            : got === want;
        if (!ok) fail(file, `example ${i + 1}: ${k} expected ${want}, got ${JSON.stringify(got)}`);
      }
    } catch (e) {
      fail(file, `example ${i + 1} threw: ${(e as Error).message}`);
    }
  }
  passed++;
}

console.log(`\n${passed} calculators checked, ${failures} problem(s).`);
process.exit(failures ? 1 : 0);
