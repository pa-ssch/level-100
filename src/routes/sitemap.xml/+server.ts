import { SITE_URL } from '$lib/site';

export const prerender = true;

const pages = [
	{ path: '/', alternates: false },
	{ path: '/de-DE/start', alternates: true },
	{ path: '/en-US/start', alternates: true },
	{ path: '/de-DE/prepare', alternates: true },
	{ path: '/en-US/prepare', alternates: true },
	{ path: '/about', alternates: false },
	{ path: '/imprint', alternates: false }
];

function alternatesFor(path: string): string {
	const rest = path.replace(/^\/(de-DE|en-US)/, '');
	return ['de-DE', 'en-US']
		.map((lang) => `<xhtml:link rel="alternate" hreflang="${lang.slice(0, 2)}" href="${SITE_URL}/${lang}${rest}"/>`)
		.join('');
}

export function GET() {
	const body =
		`<?xml version="1.0" encoding="UTF-8"?>` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">` +
		pages.map((p) => `<url><loc>${SITE_URL}${p.path}</loc>${p.alternates ? alternatesFor(p.path) : ''}</url>`).join('') +
		`</urlset>`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
