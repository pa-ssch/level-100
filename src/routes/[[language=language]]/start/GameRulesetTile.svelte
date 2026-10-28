<script lang="ts">
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import { deckSize } from '$lib/game/deck';
	import type { StoredRuleset } from '$lib/game/storage';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';

	let {
		stored,
		playHref,
		editHref,
		copyHref,
		onshare,
		ondelete,
		onfavorite
	}: {
		stored: StoredRuleset;
		playHref: ResolvedPathname;
		editHref: ResolvedPathname;
		copyHref: ResolvedPathname;
		onshare: () => void;
		ondelete: () => void;
		onfavorite: () => void;
	} = $props();

	let language = $derived(page.params.language);
	let ruleset = $derived(stored.ruleset);
	let name = $derived(ruleset.name.trim() || t(language, 'unnamed'));
</script>

<article class="ruleset" class:favorite={stored.favorite}>
	<a class="main" href={playHref}>
		<h3>{name}</h3>
		<p class="meta">
			{t(language, 'levelCount', { n: ruleset.levels.length })} · {t(language, 'cardCount', { n: deckSize(ruleset.deck) })}
		</p>
	</a>
	<div class="actions">
		<a class="icon-button" href={playHref} aria-label="{t(language, 'play')}: {name}" title={t(language, 'play')}><Icon name="play" /></a>
		<a class="icon-button" href={editHref} aria-label="{t(language, 'edit')}: {name}" title={t(language, 'edit')}
			><Icon name="pen-to-square" /></a
		>
		<a class="icon-button" href={copyHref} aria-label="{t(language, 'copy')}: {name}" title={t(language, 'copy')}><Icon name="clone" /></a>
		<button type="button" class="icon-button" onclick={onshare} aria-label="{t(language, 'share')}: {name}" title={t(language, 'share')}
			><Icon name="qrcode" /></button
		>
		<button
			type="button"
			class="icon-button"
			onclick={onfavorite}
			aria-pressed={stored.favorite}
			aria-label="{t(language, stored.favorite ? 'unfavorite' : 'favorite')}: {name}"
			title={t(language, stored.favorite ? 'unfavorite' : 'favorite')}
		>
			<Icon name={stored.favorite ? 'star' : 'star-outline'} />
		</button>
		<button type="button" class="icon-button" onclick={ondelete} aria-label="{t(language, 'delete')}: {name}" title={t(language, 'delete')}
			><Icon name="trash" /></button
		>
	</div>
</article>

<style lang="scss">
	.ruleset {
		border: 1px solid var(--border);
		border-radius: 10px;
		margin: 10px 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 12px;
		padding: 4px 8px 4px 16px;

		&:hover {
			border-color: var(--foreground);
		}

		&.favorite {
			border-color: var(--accent);
		}
	}

	.main {
		flex: 1 1 200px;
		min-width: 0;

		h3 {
			margin: 8px 0 2px;
		}

		.meta {
			margin: 0 0 8px;
			font-size: 0.85em;
			opacity: 0.8;
		}
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
	}

	.icon-button {
		display: inline-flex;
		padding: 8px;
		font-size: 1.3em;
	}
</style>
