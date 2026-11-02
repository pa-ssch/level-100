<script lang="ts">
	import { untrack } from 'svelte';
	import type { ResolvedPathname } from '$app/types';
	import { DECK_PRESETS, type CardDeck } from '$lib/game/deck';
	import { defaultHandSize, presetOf, type SavedDeck } from '$lib/game/decks';
	import { loadDecks, removeDeck } from '$lib/game/storage';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';

	let {
		deck,
		language,
		newDeckHref,
		onchange
	}: { deck: CardDeck; language: string | undefined; newDeckHref: ResolvedPathname; onchange: (deck: CardDeck, handSize: number) => void } =
		$props();

	let saved = $state<SavedDeck[]>([]);
	let expanded = $state(false);
	let selected = $derived(presetOf(deck) ?? saved.find((d) => JSON.stringify(d.deck) === JSON.stringify(deck))?.id ?? 'custom');

	$effect(() => {
		const list = loadDecks();
		const current = JSON.stringify(deck);
		untrack(() => {
			saved = list;
			// Ein gespeichertes Deck, das gerade gewählt ist, soll sichtbar sein
			if (list.some((d) => JSON.stringify(d.deck) === current)) expanded = true;
		});
	});

	function remove(d: SavedDeck) {
		if (!confirm(t(language, 'deckDeleteConfirm', { name: d.name || t(language, 'deckCustom') }))) return;
		saved = removeDeck(d.id);
	}
</script>

<div class="decks" role="radiogroup" aria-label={t(language, 'deckQ')}>
	<button
		type="button"
		role="radio"
		aria-checked={selected === 'standard'}
		class:on={selected === 'standard'}
		onclick={() => onchange({ ...DECK_PRESETS.standard }, defaultHandSize(DECK_PRESETS.standard))}
	>
		<strong>{t(language, 'deckStandard')}</strong><small>{t(language, 'deckStandardHint')}</small>
	</button>
	<button
		type="button"
		role="radio"
		aria-checked={selected === 'poker'}
		class:on={selected === 'poker'}
		onclick={() => onchange({ ...DECK_PRESETS.poker }, defaultHandSize(DECK_PRESETS.poker))}
	>
		<strong>{t(language, 'deckPoker')}</strong><small>{t(language, 'deckPokerHint')}</small>
	</button>
	{#if selected === 'custom'}
		<button type="button" role="radio" aria-checked="true" class="on">
			<strong>{t(language, 'deckCustom')}</strong><small
				>{t(language, 'deckSummary', {
					min: deck.minValue,
					max: deck.maxValue,
					suits: deck.suits,
					copies: deck.copies,
					jokers: deck.jokers
				})}</small
			>
		</button>
	{/if}
	{#if expanded}
		{#each saved as d (d.id)}
			<div class="saved" class:on={selected === d.id}>
				<button type="button" role="radio" aria-checked={selected === d.id} onclick={() => onchange({ ...d.deck }, d.handSize)}>
					<strong>{d.name || t(language, 'deckCustom')}</strong><small
						>{t(language, 'deckSummary', {
							min: d.deck.minValue,
							max: d.deck.maxValue,
							suits: d.deck.suits,
							copies: d.deck.copies,
							jokers: d.deck.jokers
						})}</small
					>
				</button>
				<button
					type="button"
					class="icon-button"
					onclick={() => remove(d)}
					aria-label="{t(language, 'deckDelete')}: {d.name || t(language, 'deckCustom')}"
					title={t(language, 'deckDelete')}><Icon name="trash-can-outline" /></button
				>
			</div>
		{/each}
	{/if}
</div>
<div class="tools">
	{#if saved.length > 0}
		<button type="button" class="secondary" onclick={() => (expanded = !expanded)} aria-expanded={expanded}>
			<Icon name={expanded ? 'chevron-up' : 'chevron-down'} />
			{t(language, 'savedDecks')} ({saved.length})
		</button>
	{/if}
	<a class="new" href={newDeckHref}><Icon name="plus" /> {t(language, 'newDeck')}</a>
</div>

<style lang="scss">
	.decks {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 8px;

		button[role='radio'] {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 2px;
			padding: 12px 14px;
			text-align: left;
			width: 100%;
			height: 100%;
			box-sizing: border-box;

			&[aria-checked='true'] {
				border-color: var(--accent);
				background: var(--accent-soft);
			}

			small {
				opacity: 0.75;
				font-size: 0.8em;
			}
		}
	}

	.saved {
		display: flex;
		gap: 2px;
		align-items: stretch;

		button[role='radio'] {
			flex: 1;
			min-width: 0;
		}
	}

	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
		align-items: center;

		.new {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			border: 1px dashed var(--border);
			border-radius: 6px;
			padding: 6px 10px;
		}
	}
</style>
