<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';
	import { fixedRouteLanguages, htmlLang, isLanguage, otherLanguage, t } from '#lib/i18n.ts';
	import { saveLanguage } from '#lib/game/storage.ts';
	import Icon from '#lib/Icon.svelte';
	import './global.scss';

	let { children } = $props();

	let language = $derived(page.params.language);

	// Beim Prerendern setzt hooks.server.ts das lang-Attribut; bei Client-Navigation muss es nachgezogen werden.
	$effect(() => {
		document.documentElement.lang = htmlLang(language ?? fixedRouteLanguages[page.route.id ?? '']);
	});

	// Gewählte Sprache merken, damit „/“ beim nächsten Besuch direkt dorthin führt.
	$effect(() => {
		if (isLanguage(language)) saveLanguage(language);
	});

	// Link auf dieselbe Seite in der jeweils anderen Sprache.
	let languageSwitch = $derived.by(() => {
		const current = language;
		if (!isLanguage(current)) return undefined;
		const target = otherLanguage(current);
		return {
			label: target === 'de-DE' ? 'Deutsch' : 'English',
			hreflang: target,
			// Der Pfad ist bereits aufgelöst (er stammt aus page.url), nur die Sprache wird getauscht.
			href: (page.url.pathname.replace(`/${current}`, `/${target}`) + (browser ? page.url.search : '')) as ResolvedPathname
		};
	});

	let showBack = $derived(page.route.id !== '/' && !page.route.id?.endsWith('/start'));
	let startHref = $derived(isLanguage(language) ? resolve('/[[language=language]]/start', { language }) : resolve('/'));
</script>

<div class="page">
	<nav class="header" aria-label={t(language, 'appName')}>
		{#if showBack}
			<a class="back" href={startHref} aria-label={t(language, 'back')} title={t(language, 'back')}><Icon name="arrow-left" /></a>
		{/if}
		<a class="brand noselect" href={startHref}>Level 100</a>
	</nav>

	<main class="content">
		{@render children()}
	</main>

	<footer class="footer">
		<div class="left">
			<a href={resolve('about')}>{t(language, 'about')}</a>
			<a href={resolve('imprint')}>{t(language, 'imprint')}</a>
		</div>
		<div class="right">
			{#if languageSwitch}
				<a href={languageSwitch.href} hreflang={languageSwitch.hreflang}><Icon name="language" /> {languageSwitch.label}</a>
			{/if}
		</div>
	</footer>
</div>

<style lang="scss">
	.page {
		display: grid;
		min-height: 100vh;
		min-height: 100dvh;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto 1fr auto;

		.header {
			position: relative;
			padding: 12px 16px 6px;
			font-family: var(--font-hand);
			font-size: 1.9em;
			text-align: center;

			.brand {
				text-decoration: underline wavy;
				text-underline-offset: 0.2em;
				text-decoration-thickness: 2px;
				letter-spacing: 0.05em;
			}

			.back {
				position: absolute;
				left: 16px;
				top: 50%;
				transform: translateY(-50%);
			}
		}

		.content {
			padding: 0 16px;
			max-width: 900px;
			width: 100%;
			box-sizing: border-box;
			justify-self: center;
		}

		.footer {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			gap: 8px 16px;
			padding: 16px;
			font-size: 0.85em;
			opacity: 0.65;

			.left,
			.right {
				display: flex;
				flex-wrap: wrap;
				gap: 16px;
			}
		}
	}
</style>
