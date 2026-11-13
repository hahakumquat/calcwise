import type { APIRoute } from 'astro';
import { CALCULATORS, CATEGORIES_WITH_CALCS, calcUrl } from '../lib/registry';

export const GET: APIRoute = ({ site }) => {
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: '/' },
    { loc: '/categories' },
    ...CATEGORIES_WITH_CALCS.map((c) => ({ loc: `/${c.id}` })),
    ...CALCULATORS.map((c) => ({ loc: calcUrl(c), lastmod: c.updated })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u.loc, site).href}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
