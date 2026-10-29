<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import { DECK_LIMITS, DECK_PRESETS, deckSize, type CardDeck } from '$lib/game/deck';
	import { RULESET_LIMITS, copyRuleset, createRuleset, validateRuleset, type Level, type Ruleset } from '$lib/game/ruleset';
	import { decodeRuleset, encodeRuleset } from '$lib/game/share';
	import { saveRuleset } from '$lib/game/storage';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import LevelEditor from '$lib/components/LevelEditor.svelte';
	import ShareDialog from '$lib/components/ShareDialog.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let language = $derived(page.params.language);

	type View = { status: 'loading' } | { status: 'invalid' } | { status: 'ready'; ruleset: Ruleset };
	let view = $state<View>({ status: 'loading' });
	let nameError = $state(false);
	let shareUrl = $state<string | null>(null);

	// Den Regelsatz aus ?r= laden (oder neu anlegen); Query-Parameter gibt es erst im Browser.
	$effect(() => {
		if (!browser) return;
		const payload = page.url.searchParams.get('r');
		const copy = page.url.searchParams.get('copy') === '1';
		if (payload === null) {
			view = { status: 'ready', ruleset: createRuleset() };
			return;
		}
		decodeRuleset(payload).then((ruleset) => {
			if (ruleset === null) view = { status: 'invalid' };
			else view = { status: 'ready', ruleset: copy ? copyRuleset(ruleset, t(language, 'copySuffix')) : ruleset };
		});
	});

	function presetOf(deck: CardDeck): 'standard' | 'poker' | 'custom' {
		for (const [name, preset] of Object.entries(DECK_PRESETS)) {
			if (JSON.stringify(preset) === JSON.stringify(deck)) return name as 'standard' | 'poker';
		}
		return 'custom';
	}

	function setDeck(ruleset: Ruleset, patch: Partial<CardDeck>) {
		const deck = { ...ruleset.deck, ...patch };
		// Wertebereich konsistent halten
		if (deck.maxValue < deck.minValue + 1) deck.maxValue = deck.minValue + 1;
		if (deck.maxValue - deck.minValue + 1 > DECK_LIMITS.maxValues) deck.maxValue = deck.minValue + DECK_LIMITS.maxValues - 1;
		ruleset.deck = deck;
		// Feste Werte in Anforderungen, die nicht mehr im Deck liegen, zurücksetzen
		for (const level of ruleset.levels) {
			for (const r of level.requirements) {
				if (r.kind === 'set' && r.value !== undefined && (r.value < deck.minValue || r.value > deck.maxValue)) delete r.value;
			}
		}
	}

	function clamp(event: Event, min: number, max: number): number {
		const value = Number((event.target as HTMLInputElement).value);
		return Number.isInteger(value) ? Math.min(max, Math.max(min, value)) : min;
	}

	function setLevel(ruleset: Ruleset, i: number, level: Level) {
		ruleset.levels[i] = level;
	}
	function removeLevel(ruleset: Ruleset, i: number) {
		if (ruleset.levels.length > RULESET_LIMITS.levels.min) ruleset.levels.splice(i, 1);
	}
	function moveLevel(ruleset: Ruleset, i: number, direction: -1 | 1) {
		const j = i + direction;
		if (j < 0 || j >= ruleset.levels.length) return;
		[ruleset.levels[i], ruleset.levels[j]] = [ruleset.levels[j], ruleset.levels[i]];
	}
	function addLevel(ruleset: Ruleset) {
		if (ruleset.levels.length >= RULESET_LIMITS.levels.max) return;
		const last = ruleset.levels[ruleset.levels.length - 1];
		ruleset.levels.push({ requirements: structuredClone($state.snapshot(last.requirements)), handSize: last.handSize });
	}

	/** Liefert den bereinigten Regelsatz oder null und markiert fehlende Pflichtfelder. */
	function finalize(ruleset: Ruleset): Ruleset | null {
		const snapshot = $state.snapshot(ruleset) as Ruleset;
		snapshot.name = snapshot.name.trim();
		nameError = snapshot.name.length === 0;
		if (nameError) return null;
		return validateRuleset(snapshot);
	}

	async function save(ruleset: Ruleset, andPlay: boolean) {
		const valid = finalize(ruleset);
		if (valid === null) return;
		saveRuleset(valid);
		if (andPlay) {
			const r = await encodeRuleset(valid);
			await goto((resolve('/[[language=language]]/play', { language }) + '?' + new URLSearchParams({ r })) as ResolvedPathname);
		} else {
			await goto(resolve('/[[language=language]]/start', { language }));
		}
	}

	async function share(ruleset: Ruleset) {
		const valid = finalize(ruleset);
		if (valid === null) return;
		saveRuleset(valid);
		const r = await encodeRuleset(valid);
		shareUrl = new URL(resolve('/[[language=language]]/play', { language }) + '?' + new URLSearchParams({ r }), page.url.origin).toString();
	}
</script>

<Seo title={t(language, 'prepareTitle')} description={t(language, 'metaPrepare')} />

<h1>{t(language, 'prepareTitle')}</h1>

{#if view.status === 'invalid'}
	<p class="warn-text" role="alert">{t(language, 'invalidLink')}</p>
	<p><a href={resolve('/[[language=language]]/start', { language })}>{t(language, 'toStart')}</a></p>
{:else if view.status === 'ready'}
	{@const ruleset = view.ruleset}
	<form
		onsubmit={(e) => {
			e.preventDefault();
			save(ruleset, true);
		}}
	>
		<label class="field">
			{t(language, 'name')}
			<input
				type="text"
				name="name"
				required
				maxlength={RULESET_LIMITS.name}
				placeholder={t(language, 'namePlaceholder')}
				bind:value={ruleset.name}
				aria-invalid={nameError}
				aria-describedby={nameError ? 'name-error' : undefined}
			/>
		</label>
		{#if nameError}
			<p id="name-error" class="warn-text" role="alert">{t(language, 'nameRequired')}</p>
		{/if}

		<fieldset>
			<legend>{t(language, 'deck')}</legend>
			<label class="field">
				{t(language, 'preset')}
				<select
					value={presetOf(ruleset.deck)}
					onchange={(e) => {
						const v = (e.target as HTMLSelectElement).value;
						if (v === 'standard' || v === 'poker') setDeck(ruleset, { ...DECK_PRESETS[v] });
					}}
				>
					<option value="standard">{t(language, 'presetStandard')}</option>
					<option value="poker">{t(language, 'presetPoker')}</option>
					<option value="custom">{t(language, 'presetCustom')}</option>
				</select>
			</label>
			<div class="deck-fields">
				<label>
					{t(language, 'minValue')}
					<input
						type="number"
						min={DECK_LIMITS.minValue.min}
						max={DECK_LIMITS.minValue.max}
						value={ruleset.deck.minValue}
						onchange={(e) => setDeck(ruleset, { minValue: clamp(e, DECK_LIMITS.minValue.min, DECK_LIMITS.minValue.max) })}
					/>
				</label>
				<label>
					{t(language, 'maxValue')}
					<input
						type="number"
						min={DECK_LIMITS.maxValue.min}
						max={DECK_LIMITS.maxValue.max}
						value={ruleset.deck.maxValue}
						onchange={(e) => setDeck(ruleset, { maxValue: clamp(e, DECK_LIMITS.maxValue.min, DECK_LIMITS.maxValue.max) })}
					/>
				</label>
				<label>
					{t(language, 'suits')}
					<input
						type="number"
						min={DECK_LIMITS.suits.min}
						max={DECK_LIMITS.suits.max}
						value={ruleset.deck.suits}
						onchange={(e) => setDeck(ruleset, { suits: clamp(e, DECK_LIMITS.suits.min, DECK_LIMITS.suits.max) })}
					/>
				</label>
				<label>
					{t(language, 'copies')}
					<input
						type="number"
						min={DECK_LIMITS.copies.min}
						max={DECK_LIMITS.copies.max}
						value={ruleset.deck.copies}
						onchange={(e) => setDeck(ruleset, { copies: clamp(e, DECK_LIMITS.copies.min, DECK_LIMITS.copies.max) })}
					/>
				</label>
				<label>
					{t(language, 'jokers')}
					<input
						type="number"
						min={DECK_LIMITS.jokers.min}
						max={DECK_LIMITS.jokers.max}
						value={ruleset.deck.jokers}
						onchange={(e) => setDeck(ruleset, { jokers: clamp(e, DECK_LIMITS.jokers.min, DECK_LIMITS.jokers.max) })}
					/>
				</label>
				<span class="total">{t(language, 'cardCount', { n: deckSize(ruleset.deck) })}</span>
			</div>
		</fieldset>

		<fieldset>
			<legend>{t(language, 'mode')}</legend>
			<label class="radio">
				<input type="radio" name="mode" value="fixed" bind:group={ruleset.mode} />
				<span><strong>{t(language, 'modeFixed')}</strong><br /><small>{t(language, 'modeFixedHint')}</small></span>
			</label>
			<label class="radio">
				<input type="radio" name="mode" value="free" bind:group={ruleset.mode} />
				<span><strong>{t(language, 'modeFree')}</strong><br /><small>{t(language, 'modeFreeHint')}</small></span>
			</label>
		</fieldset>

		<h2>{t(language, 'levels')}</h2>
		{#each ruleset.levels as level, i (i)}
			<LevelEditor
				{level}
				index={i}
				total={ruleset.levels.length}
				deck={ruleset.deck}
				{language}
				onchange={(l) => setLevel(ruleset, i, l)}
				onremove={() => removeLevel(ruleset, i)}
				onmove={(d) => moveLevel(ruleset, i, d)}
			/>
		{/each}
		<button type="button" class="secondary" onclick={() => addLevel(ruleset)} disabled={ruleset.levels.length >= RULESET_LIMITS.levels.max}>
			<Icon name="plus" />
			{t(language, 'addLevel')}
		</button>

		<div class="actions">
			<button type="submit" class="primary"><Icon name="play" /> {t(language, 'saveAndPlay')}</button>
			<button type="button" onclick={() => save(ruleset, false)}>{t(language, 'save')}</button>
			<button type="button" onclick={() => share(ruleset)}><Icon name="qrcode" /> {t(language, 'share')}</button>
		</div>
	</form>
{/if}

{#if shareUrl}
	<ShareDialog url={shareUrl} {language} onclose={() => (shareUrl = null)} />
{/if}

<style lang="scss">
	fieldset {
		border: 1px solid var(--border);
		border-radius: 10px;
		margin: 16px 0;
		padding: 8px 16px 16px;
	}

	legend {
		font-weight: bold;
		padding: 0 6px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 8px 0;
		max-width: 420px;
	}

	.deck-fields {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
		align-items: end;

		label {
			display: flex;
			flex-direction: column;
			gap: 4px;
			font-size: 0.85em;
		}

		input {
			width: 4.5em;
		}

		.total {
			padding-bottom: 8px;
			opacity: 0.8;
		}
	}

	.radio {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		margin: 8px 0;

		input {
			margin-top: 4px;
		}
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 24px 0 32px;
		position: sticky;
		bottom: 0;
		padding: 12px 0;
		background-color: var(--background);
	}
</style>
