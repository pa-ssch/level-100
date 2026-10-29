<script lang="ts">
	import { page } from '$app/state';
	import { SITE_NAME, SITE_URL } from '$lib/site';
	import { htmlLang, isLanguage } from '$lib/i18n';

	let { title, description }: { title: string; description: string } = $props();

	// canonical ohne Query (Share-Links sind nicht indexierbar, der Inhalt steckt im Link)
	let path = $derived(page.url.pathname.replace(/\/$/, '') || '/');
	let canonical = $derived(SITE_URL + path);
	let language = $derived(page.params.language);
	let locale = $derived(isLanguage(language) ? language.replace('-', '_') : 'en_US');
	let alternates = $derived.by(() => {
		if (!isLanguage(language)) return [];
		const rest = path.replace(/^\/(de-DE|en-US)/, '');
		return [
			{ hreflang: 'de', href: `${SITE_URL}/de-DE${rest}` },
			{ hreflang: 'en', href: `${SITE_URL}/en-US${rest}` },
			{ hreflang: 'x-default', href: `${SITE_URL}/en-US${rest}` }
		];
	});
	let fullTitle = $derived(title === SITE_NAME ? title : `${title} – ${SITE_NAME}`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#each alternates as alt (alt.hreflang)}
		<link rel="alternate" hreflang={alt.hreflang} href={alt.href} />
	{/each}
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={locale} />
	<meta property="og:image" content="{SITE_URL}/icons/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Level 100 – {description}" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="{SITE_URL}/icons/og-image.png" />
	<meta name="application-name" content={SITE_NAME} />
	<meta name="apple-mobile-web-app-title" content={SITE_NAME} />
	<meta name="content-language" content={htmlLang(language)} />
</svelte:head>
