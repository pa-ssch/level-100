<script lang="ts">
	import { page } from '$app/state';
	import { href } from '$lib/links';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let language = $derived(page.params.language);
</script>

<Seo title={t(language, 'newGame')} description={t(language, 'metaNew')} />

<h1>{t(language, 'newTitle')}</h1>
<div class="choices">
	<a class="choice" href={href('/[[language=language]]/random', language)}>
		<Icon name="dice" />
		<span><strong>{t(language, 'randomTitle')}</strong><small>{t(language, 'randomHint')}</small></span>
	</a>
	<a class="choice" href={href('/[[language=language]]/prepare', language)}>
		<Icon name="pen" />
		<span><strong>{t(language, 'customTitle')}</strong><small>{t(language, 'customHint')}</small></span>
	</a>
</div>

<style lang="scss">
	h1 {
		font-size: 1.4em;
	}

	.choices {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 520px;
	}

	.choice {
		display: flex;
		align-items: center;
		gap: 14px;
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 12px;
		padding: 16px;
		font-size: 1.3em;

		span {
			display: flex;
			flex-direction: column;
			gap: 2px;
			font-size: 0.8em;
		}

		small {
			font-size: 0.8em;
			opacity: 0.75;
		}

		&:hover {
			border-color: var(--foreground);
		}
	}
</style>
