<script lang="ts">
	import { page } from '$app/state';
	import { href } from '$lib/links';
	import { t } from '$lib/i18n';
	import Seo from '$lib/components/Seo.svelte';

	let language = $derived(page.params.language);
	const steps = ['how1', 'how2', 'how3', 'how4', 'how5'] as const;
</script>

<Seo title={t(language, 'howTitle')} description={t(language, 'metaStart')} />

<article class="how">
	<h1>{t(language, 'howTitle')}</h1>
	<ol>
		{#each steps as step (step)}
			<li>{t(language, step)}</li>
		{/each}
	</ol>
	<p class="actions"><a class="big" href={href('/[[language=language]]/start', language)}>{t(language, 'howOk')}</a></p>
</article>

<style lang="scss">
	.how {
		max-width: 36rem;
		margin: 0 auto;
	}

	h1 {
		text-align: center;
	}

	ol {
		padding-left: 1.4em;
		font-size: 1.1em;
		line-height: 1.45;
		display: flex;
		flex-direction: column;
		gap: 0.7em;

		li::marker {
			font-family: var(--font-hand);
			font-size: 1.3em;
		}
	}

	.actions {
		text-align: center;
		margin: 28px 0;

		.big {
			display: inline-block;
			border: 3px solid var(--border);
			border-radius: var(--sketch-a);
			box-shadow: 3px 3px 0 var(--border);
			padding: 12px 36px;
			font-family: var(--font-hand);
			font-size: 1.5em;
			transform: rotate(-0.6deg);

			&:active {
				transform: translate(2px, 2px);
				box-shadow: 1px 1px 0 var(--border);
			}
		}
	}
</style>
