import type { APIRoute } from 'astro';
import { CALCULATORS, CATEGORIES_WITH_CALCS } from '../lib/registry';
import { absUrl } from '../lib/paths';

export const GET: APIRoute = ({ site }) => {
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: '/' },
    { loc: '/categories' },
    ...CATEGORIES_WITH_CALCS.map((c) => ({ loc: `/${c.id}` })),
    ...CALCULATORS.map((c) => ({ loc: `/${c.category}/${c.slug}`, lastmod: c.updated })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${absUrl(u.loc, site)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
