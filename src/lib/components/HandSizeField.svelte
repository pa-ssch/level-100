<script lang="ts">
	import { deckSize, type CardDeck } from '$lib/game/deck';
	import { clampHandSize } from '$lib/game/decks';
	import { RULESET_LIMITS } from '$lib/game/ruleset';
	import { t } from '$lib/i18n';

	let { value, deck, language, onchange }: { value: number; deck: CardDeck; language: string | undefined; onchange: (n: number) => void } =
		$props();

	let min = RULESET_LIMITS.handSize.min;
	let max = $derived(Math.min(RULESET_LIMITS.handSize.max, deckSize(deck)));
</script>

<div class="hand">
	<button type="button" class="icon-button" onclick={() => onchange(clampHandSize(value - 1, deck))} disabled={value <= min} aria-label="−"
		>−</button
	>
	<input
		type="number"
		inputmode="numeric"
		{min}
		{max}
		{value}
		aria-label={t(language, 'handSize')}
		onchange={(e) => {
			const n = Number((e.target as HTMLInputElement).value);
			onchange(clampHandSize(Number.isInteger(n) ? n : value, deck));
		}}
	/>
	<button type="button" class="icon-button" onclick={() => onchange(clampHandSize(value + 1, deck))} disabled={value >= max} aria-label="+"
		>+</button
	>
	<small class="unit">{t(language, 'handSizeHint')}</small>
</div>

<style lang="scss">
	.hand {
		display: flex;
		align-items: center;
		gap: 4px;

		input {
			width: 3.2em;
			text-align: center;
			font-weight: bold;
			font-size: 1.1em;
			-moz-appearance: textfield;
			appearance: textfield;

			&::-webkit-inner-spin-button,
			&::-webkit-outer-spin-button {
				appearance: none;
				margin: 0;
			}
		}

		.icon-button {
			font-family: inherit;
			font-weight: bold;
			width: 40px;
			height: 40px;
			justify-content: center;
			padding: 0;
			border: 2px solid var(--border);
		}

		.unit {
			margin-left: 6px;
			opacity: 0.7;
		}
	}
</style>
