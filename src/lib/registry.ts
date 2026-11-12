import type { Calculator, CategoryId } from './types';
import { CATEGORIES } from './categories';

// Every file in src/calculators/<category>/<slug>.ts is picked up automatically.
const modules = import.meta.glob<{ default: Calculator }>('../calculators/*/*.ts', { eager: true });

export const CALCULATORS: Calculator[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.title.localeCompare(b.title));

export const BY_SLUG = new Map(CALCULATORS.map((c) => [c.slug, c]));

if (BY_SLUG.size !== CALCULATORS.length) {
  const seen = new Set<string>();
  const dupes = CALCULATORS.filter((c) => (seen.has(c.slug) ? true : (seen.add(c.slug), false))).map((c) => c.slug);
  throw new Error(`Duplicate calculator slugs: ${dupes.join(', ')}`);
}

export function byCategory(id: CategoryId): Calculator[] {
  return CALCULATORS.filter((c) => c.category === id);
}

export const CATEGORIES_WITH_CALCS = CATEGORIES.filter((c) => byCategory(c.id).length > 0);

export function calcUrl(c: Pick<Calculator, 'category' | 'slug'>): string {
  return `/${c.category}/${c.slug}`;
}

export function related(c: Calculator, n = 6): Calculator[] {
  const explicit = (c.related ?? []).map((s) => BY_SLUG.get(s)).filter((x): x is Calculator => !!x);
  const sameCat = byCategory(c.category).filter((x) => x.slug !== c.slug && !explicit.includes(x));
  return [...explicit, ...sameCat].slice(0, n);
}
