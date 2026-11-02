<script lang="ts">
	import { DECK_PRESETS, type CardDeck } from '$lib/game/deck';
	import { t } from '$lib/i18n';

	let { deck, language, onchange }: { deck: CardDeck; language: string | undefined; onchange: (deck: CardDeck) => void } = $props();

	let selected = $derived.by(() => {
		for (const [name, preset] of Object.entries(DECK_PRESETS)) if (JSON.stringify(preset) === JSON.stringify(deck)) return name;
		return 'custom';
	});
</script>

<div class="decks" role="radiogroup" aria-label={t(language, 'deckQ')}>
	<button
		type="button"
		role="radio"
		aria-checked={selected === 'standard'}
		class:on={selected === 'standard'}
		onclick={() => onchange({ ...DECK_PRESETS.standard })}
	>
		<strong>{t(language, 'deckStandard')}</strong><small>{t(language, 'deckStandardHint')}</small>
	</button>
	<button
		type="button"
		role="radio"
		aria-checked={selected === 'poker'}
		class:on={selected === 'poker'}
		onclick={() => onchange({ ...DECK_PRESETS.poker })}
	>
		<strong>{t(language, 'deckPoker')}</strong><small>{t(language, 'deckPokerHint')}</small>
	</button>
	{#if selected === 'custom'}
		<button type="button" role="radio" aria-checked="true" class="on">
			<strong>{t(language, 'deckCustom')}</strong><small
				>{deck.minValue}–{deck.maxValue} · {deck.suits}× · {deck.copies}× · {deck.jokers} J</small
			>
		</button>
	{/if}
</div>

<style lang="scss">
	.decks {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 8px;

		button {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 2px;
			padding: 12px 14px;
			text-align: left;

			&.on {
				border-color: var(--accent);
				background: var(--accent-soft, rgba(76, 175, 80, 0.15));
			}

			small {
				opacity: 0.75;
				font-size: 0.8em;
			}
		}
	}
</style>
