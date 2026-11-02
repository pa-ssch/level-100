<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { DECK_LIMITS, deckSize, type CardDeck } from '$lib/game/deck';
	import { DECK_NAME_LIMIT, createSavedDeck, defaultHandSize } from '$lib/game/decks';
	import { RULESET_LIMITS } from '$lib/game/ruleset';
	import { loadRulesets, saveDeck, saveRuleset } from '$lib/game/storage';
	import { href } from '$lib/links';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let language = $derived(page.params.language);
	let saved = $state(createSavedDeck());
	let handTouched = $state(false);

	function clamp(event: Event, min: number, max: number): number {
		const value = Number((event.target as HTMLInputElement).value);
		return Number.isInteger(value) ? Math.min(max, Math.max(min, value)) : min;
	}

	function setDeck(patch: Partial<CardDeck>) {
		const deck = { ...saved.deck, ...patch };
		if (deck.maxValue < deck.minValue + 1) deck.maxValue = deck.minValue + 1;
		if (deck.maxValue - deck.minValue + 1 > DECK_LIMITS.maxValues) deck.maxValue = deck.minValue + DECK_LIMITS.maxValues - 1;
		saved.deck = deck;
		if (!handTouched) saved.handSize = defaultHandSize(deck);
		else saved.handSize = Math.min(saved.handSize, deckSize(deck));
	}

	/** Zurück dorthin, wo das Deck gebraucht wird: Editor (per Spiel-ID) oder Zufallsspiel. */
	function save(event: Event) {
		event.preventDefault();
		if (!browser) return;
		const deck = { ...$state.snapshot(saved), name: saved.name.trim().slice(0, DECK_NAME_LIMIT) };
		saveDeck(deck);
		const back = page.url.searchParams.get('return');
		const id = page.url.searchParams.get('id');
		if (back === 'prepare' && id) {
			const stored = loadRulesets().find((s) => s.ruleset.id === id);
			if (stored) {
				const ruleset = stored.ruleset;
				ruleset.deck = { ...deck.deck };
				for (const level of ruleset.levels) level.handSize = deck.handSize;
				saveRuleset(ruleset);
			}
			goto(href('/[[language=language]]/prepare', language, { id }));
		} else {
			goto(href('/[[language=language]]/random', language, { deck: deck.id }));
		}
	}

	const hand = RULESET_LIMITS.handSize;
</script>

<Seo title={t(language, 'deckEditorTitle')} description={t(language, 'metaPrepare')} />

<h1>{t(language, 'deckEditorTitle')}</h1>
<form onsubmit={save}>
	<label class="field">
		{t(language, 'deckName')}
		<input type="text" maxlength={DECK_NAME_LIMIT} placeholder={t(language, 'deckNamePlaceholder')} bind:value={saved.name} />
	</label>
	<div class="fields">
		<label
			>{t(language, 'minValue')}<input
				type="number"
				min={DECK_LIMITS.minValue.min}
				max={DECK_LIMITS.minValue.max}
				value={saved.deck.minValue}
				onchange={(e) => setDeck({ minValue: clamp(e, DECK_LIMITS.minValue.min, DECK_LIMITS.minValue.max) })}
			/></label
		>
		<label
			>{t(language, 'maxValue')}<input
				type="number"
				min={DECK_LIMITS.maxValue.min}
				max={DECK_LIMITS.maxValue.max}
				value={saved.deck.maxValue}
				onchange={(e) => setDeck({ maxValue: clamp(e, DECK_LIMITS.maxValue.min, DECK_LIMITS.maxValue.max) })}
			/></label
		>
		<label
			>{t(language, 'suits')}<input
				type="number"
				min={DECK_LIMITS.suits.min}
				max={DECK_LIMITS.suits.max}
				value={saved.deck.suits}
				onchange={(e) => setDeck({ suits: clamp(e, DECK_LIMITS.suits.min, DECK_LIMITS.suits.max) })}
			/></label
		>
		<label
			>{t(language, 'copies')}<input
				type="number"
				min={DECK_LIMITS.copies.min}
				max={DECK_LIMITS.copies.max}
				value={saved.deck.copies}
				onchange={(e) => setDeck({ copies: clamp(e, DECK_LIMITS.copies.min, DECK_LIMITS.copies.max) })}
			/></label
		>
		<label
			>{t(language, 'jokers')}<input
				type="number"
				min={DECK_LIMITS.jokers.min}
				max={DECK_LIMITS.jokers.max}
				value={saved.deck.jokers}
				onchange={(e) => setDeck({ jokers: clamp(e, DECK_LIMITS.jokers.min, DECK_LIMITS.jokers.max) })}
			/></label
		>
	</div>
	<p class="total">{t(language, 'cardCount', { n: deckSize(saved.deck) })}</p>
	<label class="field hand">
		{t(language, 'handSize')}
		<input
			type="number"
			min={hand.min}
			max={Math.min(hand.max, deckSize(saved.deck))}
			value={saved.handSize}
			onchange={(e) => {
				handTouched = true;
				saved.handSize = clamp(e, hand.min, Math.min(hand.max, deckSize(saved.deck)));
			}}
		/>
		<small>{t(language, 'handSizeHint')}</small>
	</label>
	<div class="actions">
		<button type="submit" class="primary big"><Icon name="check" /> {t(language, 'deckSave')}</button>
	</div>
</form>

<style lang="scss">
	h1 {
		font-size: 1.4em;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 12px 0;
		max-width: 420px;
		font-size: 0.9em;

		&.hand {
			max-width: 220px;
		}

		small {
			opacity: 0.7;
		}
	}

	.fields {
		display: flex;
		flex-wrap: wrap;
		gap: 10px 16px;

		label {
			display: flex;
			flex-direction: column;
			gap: 4px;
			font-size: 0.85em;
		}

		input {
			width: 5em;
		}
	}

	.total {
		opacity: 0.8;
		margin: 8px 0;
	}

	.actions {
		margin: 20px 0;

		.big {
			width: 100%;
			justify-content: center;
			padding: 16px;
			font-size: 1.1em;
		}
	}
</style>
