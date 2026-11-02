<script lang="ts">
	import { DECK_LIMITS, deckSize, type CardDeck } from '$lib/game/deck';
	import { RULESET_LIMITS, type Ruleset } from '$lib/game/ruleset';
	import { t } from '$lib/i18n';

	let { ruleset, language, showDeck = false }: { ruleset: Ruleset; language: string | undefined; showDeck?: boolean } = $props();

	let handSize = $derived(ruleset.levels[0]?.handSize ?? 10);
	const hand = RULESET_LIMITS.handSize;

	function clamp(event: Event, min: number, max: number): number {
		const value = Number((event.target as HTMLInputElement).value);
		return Number.isInteger(value) ? Math.min(max, Math.max(min, value)) : min;
	}

	function setHandSize(event: Event) {
		const n = clamp(event, hand.min, Math.min(hand.max, deckSize(ruleset.deck)));
		for (const level of ruleset.levels) level.handSize = n;
	}

	function setDeck(patch: Partial<CardDeck>) {
		const deck = { ...ruleset.deck, ...patch };
		if (deck.maxValue < deck.minValue + 1) deck.maxValue = deck.minValue + 1;
		if (deck.maxValue - deck.minValue + 1 > DECK_LIMITS.maxValues) deck.maxValue = deck.minValue + DECK_LIMITS.maxValues - 1;
		ruleset.deck = deck;
		for (const level of ruleset.levels) {
			for (const r of level.requirements) {
				if (r.kind === 'set' && r.value !== undefined && (r.value < deck.minValue || r.value > deck.maxValue)) delete r.value;
			}
		}
	}
</script>

<details class="more">
	<summary>{showDeck ? t(language, 'moreOptions') : t(language, 'moreOptionsShort')}</summary>
	<div class="options">
		{#if showDeck}
			<fieldset>
				<legend>{t(language, 'deckCustom')}</legend>
				<div class="fields">
					<label
						>{t(language, 'minValue')}<input
							type="number"
							min={DECK_LIMITS.minValue.min}
							max={DECK_LIMITS.minValue.max}
							value={ruleset.deck.minValue}
							onchange={(e) => setDeck({ minValue: clamp(e, DECK_LIMITS.minValue.min, DECK_LIMITS.minValue.max) })}
						/></label
					>
					<label
						>{t(language, 'maxValue')}<input
							type="number"
							min={DECK_LIMITS.maxValue.min}
							max={DECK_LIMITS.maxValue.max}
							value={ruleset.deck.maxValue}
							onchange={(e) => setDeck({ maxValue: clamp(e, DECK_LIMITS.maxValue.min, DECK_LIMITS.maxValue.max) })}
						/></label
					>
					<label
						>{t(language, 'suits')}<input
							type="number"
							min={DECK_LIMITS.suits.min}
							max={DECK_LIMITS.suits.max}
							value={ruleset.deck.suits}
							onchange={(e) => setDeck({ suits: clamp(e, DECK_LIMITS.suits.min, DECK_LIMITS.suits.max) })}
						/></label
					>
					<label
						>{t(language, 'copies')}<input
							type="number"
							min={DECK_LIMITS.copies.min}
							max={DECK_LIMITS.copies.max}
							value={ruleset.deck.copies}
							onchange={(e) => setDeck({ copies: clamp(e, DECK_LIMITS.copies.min, DECK_LIMITS.copies.max) })}
						/></label
					>
					<label
						>{t(language, 'jokers')}<input
							type="number"
							min={DECK_LIMITS.jokers.min}
							max={DECK_LIMITS.jokers.max}
							value={ruleset.deck.jokers}
							onchange={(e) => setDeck({ jokers: clamp(e, DECK_LIMITS.jokers.min, DECK_LIMITS.jokers.max) })}
						/></label
					>
					<span class="total">{t(language, 'cardCount', { n: deckSize(ruleset.deck) })}</span>
				</div>
			</fieldset>
		{/if}
		<label class="inline">
			{t(language, 'handSize')}
			<input type="number" min={hand.min} max={hand.max} value={handSize} onchange={setHandSize} />
			<small>{t(language, 'handSizeHint')}</small>
		</label>
		<fieldset>
			<legend>{t(language, 'modeQ')}</legend>
			<label class="radio"><input type="radio" name="mode" value="fixed" bind:group={ruleset.mode} /> {t(language, 'modeFixed')}</label>
			<label class="radio"
				><input type="radio" name="mode" value="free" bind:group={ruleset.mode} />
				{t(language, 'modeFree')} <small>{t(language, 'modeFreeHint')}</small></label
			>
		</fieldset>
		<label class="radio"
			><input type="checkbox" bind:checked={ruleset.points} /> {t(language, 'pointsOpt')} <small>{t(language, 'pointsHint')}</small></label
		>
	</div>
</details>

<style lang="scss">
	.more {
		border: 1px dashed var(--border);
		border-radius: 10px;
		padding: 0 12px;
		margin: 12px 0;

		summary {
			cursor: pointer;
			padding: 10px 0;
			color: var(--foreground-accent);
		}
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 4px 0 12px;
	}

	fieldset {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 6px 12px 10px;
		margin: 0;
	}

	legend {
		font-size: 0.85em;
		padding: 0 4px;
	}

	.fields {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 14px;
		align-items: end;

		label {
			display: flex;
			flex-direction: column;
			gap: 3px;
			font-size: 0.8em;
		}

		input {
			width: 4.5em;
		}

		.total {
			padding-bottom: 8px;
			opacity: 0.8;
			font-size: 0.85em;
		}
	}

	.inline {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;

		input {
			width: 4.5em;
		}
	}

	.radio {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin: 6px 0;
		flex-wrap: wrap;
	}

	small {
		opacity: 0.75;
		font-size: 0.8em;
	}
</style>
