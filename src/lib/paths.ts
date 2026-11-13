/**
 * Site-relative URLs that respect Astro's `base` (e.g. "/calcwise" on GitHub Pages).
 * Page URLs always end in "/" to match the static directory output; file URLs (with an extension) do not.
 */
const env = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
const BASE = (env?.BASE_URL ?? '/').replace(/\/+$/, '');

export function path(p: string): string {
  const clean = p.startsWith('/') ? p : `/${p}`;
  const isFile = /\.[a-z0-9]+$/i.test(clean);
  const withSlash = isFile || clean.endsWith('/') ? clean : `${clean}/`;
  return `${BASE}${withSlash}`;
}

/** Absolute URL for canonical links, JSON-LD and the sitemap. */
export const absUrl = (p: string, site: URL | undefined) => new URL(path(p), site ?? 'https://cappycalc.com').href;
