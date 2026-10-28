<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';
	import { fixedRouteLanguages, footerLabel, htmlLang, isLanguage, otherLanguage } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import './global.scss';

	let { children } = $props();

	// Beim Prerendern setzt hooks.server.ts das lang-Attribut; bei Client-Navigation muss es nachgezogen werden.
	$effect(() => {
		document.documentElement.lang = htmlLang(page.params.language ?? fixedRouteLanguages[page.route.id ?? '']);
	});

	// Link auf dieselbe Seite in der jeweils anderen Sprache.
	let languageSwitch = $derived.by(() => {
		const current = page.params.language;
		if (!isLanguage(current)) return undefined;
		const target = otherLanguage(current);
		return {
			label: target === 'de-DE' ? 'Deutsch' : 'English',
			hreflang: target,
			// Suchparameter gibt es erst im Browser; beim Prerendern ist der Zugriff darauf nicht erlaubt.
			// Der Pfad ist bereits aufgelöst (er stammt aus page.url), nur die Sprache wird getauscht.
			href: (page.url.pathname.replace(`/${current}`, `/${target}`) + (browser ? page.url.search : '')) as ResolvedPathname
		};
	});
</script>

<div class="page">
	<nav class="header">
		<a class="noselect" href={resolve('/')}>Level 100!</a>
		<!-- TODO (PLAN.md Phase 6): Zurück-Button auf prepare/play, Header wie bei YouTube Music -->
	</nav>

	<main class="content">
		{@render children()}
	</main>

	<footer class="footer">
		<div class="left">
			<a href={resolve('/about')}>{footerLabel(page.params.language, 'about')}</a>
			<a href={resolve('/imprint')}>{footerLabel(page.params.language, 'imprint')}</a>
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
		min-height: calc(100vh - 16px);
		grid-template-columns: auto;
		grid-template-rows: auto 1fr auto;
		margin: 8px;

		.header {
			border: 3px solid green;
			padding: 10px;
			font-size: 2em;
			font-weight: bold;
			text-align: center;
		}

		.footer {
			text-align: center;
			font-size: 0.75em;
			display: grid;
			justify-items: center;
			align-items: center;
			margin: 0 50px;
			grid-template-columns: 1fr 1fr;
			grid-template-areas: 'left right';

			.left,
			.right {
				display: flex;
				flex-direction: column;

				> * {
					margin: 10px;
				}
			}

			.left {
				grid-area: left;
			}

			.right {
				grid-area: right;
			}
		}
	}
</style>
