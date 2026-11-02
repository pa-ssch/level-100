<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { addBlock, removeBlock } from '$lib/game/blocks';
	import { DECK_PRESETS, deckSize, type CardDeck } from '$lib/game/deck';
	import { estimateDifficulty } from '$lib/game/difficulty';
	import { createGame } from '$lib/game/game';
	import type { Requirement } from '$lib/game/requirements';
	import { RULESET_LIMITS, copyRuleset, createRuleset, validateRuleset, type Level, type Ruleset } from '$lib/game/ruleset';
	import { decodeRuleset } from '$lib/game/share';
	import { saveGame, saveRuleset } from '$lib/game/storage';
	import { href, rulesetLinks } from '$lib/links';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import BlockPicker from '$lib/components/BlockPicker.svelte';
	import DeckPicker from '$lib/components/DeckPicker.svelte';
	import LevelRow from '$lib/components/LevelRow.svelte';
	import MoreOptions from '$lib/components/MoreOptions.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import ShareDialog from '$lib/components/ShareDialog.svelte';

	let language = $derived(page.params.language);

	type View = { status: 'loading' } | { status: 'invalid' } | { status: 'ready'; ruleset: Ruleset };
	let view = $state<View>({ status: 'loading' });
	let nameError = $state(false);
	let pickerFor = $state<number | null>(null);
	let deckOpen = $state(false);
	let shareUrl = $state<string | null>(null);

	$effect(() => {
		if (!browser) return;
		const payload = page.url.searchParams.get('r');
		const copy = page.url.searchParams.get('copy') === '1';
		if (payload === null) {
			view = {
				status: 'ready',
				ruleset: createRuleset({ levels: [{ requirements: [{ kind: 'set', size: 3, count: 2 }], handSize: 10 }] })
			};
			return;
		}
		decodeRuleset(payload).then((ruleset) => {
			if (ruleset === null) view = { status: 'invalid' };
			else view = { status: 'ready', ruleset: copy ? copyRuleset(ruleset, t(language, 'copySuffix')) : ruleset };
		});
	});

	function setDeck(ruleset: Ruleset, deck: CardDeck) {
		ruleset.deck = deck;
		const handSize = JSON.stringify(deck) === JSON.stringify(DECK_PRESETS.poker) ? 7 : 10;
		for (const level of ruleset.levels) level.handSize = Math.min(handSize, deckSize(deck));
		deckOpen = false;
	}

	function addLevel(ruleset: Ruleset) {
		if (ruleset.levels.length >= RULESET_LIMITS.levels.max) return;
		const last = ruleset.levels[ruleset.levels.length - 1];
		ruleset.levels.push({ requirements: [], handSize: last?.handSize ?? 10 });
		pickerFor = ruleset.levels.length - 1;
	}

	function levelMenu(ruleset: Ruleset, i: number) {
		return [
			{
				label: t(language, 'duplicate'),
				onselect: () => ruleset.levels.splice(i + 1, 0, structuredClone($state.snapshot(ruleset.levels[i])) as Level),
				disabled: ruleset.levels.length >= RULESET_LIMITS.levels.max
			},
			{ label: t(language, 'moveUp'), onselect: () => move(ruleset, i, -1), disabled: i === 0 },
			{ label: t(language, 'moveDown'), onselect: () => move(ruleset, i, 1), disabled: i === ruleset.levels.length - 1 },
			{ label: t(language, 'removeLevel'), onselect: () => ruleset.levels.splice(i, 1), danger: true, disabled: ruleset.levels.length <= 1 }
		];
	}

	function move(ruleset: Ruleset, i: number, direction: -1 | 1) {
		const j = i + direction;
		if (j < 0 || j >= ruleset.levels.length) return;
		[ruleset.levels[i], ruleset.levels[j]] = [ruleset.levels[j], ruleset.levels[i]];
	}

	function sortByDifficulty(ruleset: Ruleset) {
		const deck = $state.snapshot(ruleset.deck);
		const scored = ($state.snapshot(ruleset.levels) as Level[]).map((level) => ({
			level,
			d: estimateDifficulty(deck, level.handSize, level.requirements).difficulty ?? 11
		}));
		ruleset.levels = scored.sort((a, b) => a.d - b.d).map((s) => s.level);
	}

	function pick(ruleset: Ruleset, i: number, r: Requirement) {
		ruleset.levels[i].requirements = addBlock($state.snapshot(ruleset.levels[i].requirements) as Requirement[], r);
	}

	/** Bereinigter Regelsatz oder null; leere Level werden entfernt, fehlender Name markiert. */
	function finalize(ruleset: Ruleset): Ruleset | null {
		const r = $state.snapshot(ruleset) as Ruleset;
		r.name = r.name.trim();
		r.levels = r.levels.filter((l) => l.requirements.length > 0);
		nameError = r.name.length === 0;
		if (nameError || r.levels.length === 0) return null;
		return validateRuleset(r);
	}

	async function play(ruleset: Ruleset) {
		const r = finalize(ruleset);
		if (!r) return;
		saveRuleset(r, { played: true });
		saveGame(createGame(r));
		await goto((await rulesetLinks(r, language, page.url.origin)).play);
	}

	async function save(ruleset: Ruleset) {
		const r = finalize(ruleset);
		if (!r) return;
		saveRuleset(r);
		await goto(href('/[[language=language]]/start', language));
	}

	async function share(ruleset: Ruleset) {
		const r = finalize(ruleset);
		if (!r) return;
		saveRuleset(r);
		shareUrl = (await rulesetLinks(r, language, page.url.origin)).share;
	}

	function deckLabel(deck: CardDeck): string {
		if (JSON.stringify(deck) === JSON.stringify(DECK_PRESETS.standard)) return t(language, 'deckStandard');
		if (JSON.stringify(deck) === JSON.stringify(DECK_PRESETS.poker)) return t(language, 'deckPoker');
		return `${t(language, 'deckCustom')} · ${t(language, 'cardCount', { n: deckSize(deck) })}`;
	}
</script>

<Seo title={t(language, 'editorTitle')} description={t(language, 'metaPrepare')} />

{#if view.status === 'invalid'}
	<h1>{t(language, 'editorTitle')}</h1>
	<p class="warn-text" role="alert">{t(language, 'invalidLink')}</p>
	<p><a href={href('/[[language=language]]/start', language)}>{t(language, 'toStart')}</a></p>
{:else if view.status === 'ready'}
	{@const ruleset = view.ruleset}
	<form
		onsubmit={(e) => {
			e.preventDefault();
			play(ruleset);
		}}
	>
		<label class="name">
			{t(language, 'name')}
			<input
				type="text"
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
		<p class="deck">
			{t(language, 'deckRow')}: <strong>{deckLabel(ruleset.deck)}</strong>
			<button type="button" class="secondary" onclick={() => (deckOpen = true)}>{t(language, 'change')}</button>
		</p>

		{#each ruleset.levels as level, i (i)}
			<LevelRow
				{level}
				index={i}
				deck={ruleset.deck}
				{language}
				editable
				menu={levelMenu(ruleset, i)}
				onaddblock={() => (pickerFor = i)}
				onremoveblock={(b) =>
					(ruleset.levels[i].requirements = removeBlock($state.snapshot(ruleset.levels[i].requirements) as Requirement[], b))}
			/>
		{/each}
		<button
			type="button"
			class="secondary add"
			onclick={() => addLevel(ruleset)}
			disabled={ruleset.levels.length >= RULESET_LIMITS.levels.max}><Icon name="plus" /> {t(language, 'addLevel')}</button
		>

		<MoreOptions {ruleset} {language} />

		<div class="actions">
			<button type="button" onclick={() => sortByDifficulty(ruleset)} disabled={ruleset.levels.length < 2}
				>{t(language, 'sortByDifficulty')}</button
			>
			<button type="button" onclick={() => share(ruleset)}><Icon name="qrcode" /> {t(language, 'share')}</button>
			<button type="button" onclick={() => save(ruleset)}>{t(language, 'done')}</button>
		</div>
		<div class="actions">
			<button type="submit" class="primary big"><Icon name="play" /> {t(language, 'play')}</button>
		</div>
	</form>

	{#if pickerFor !== null}
		{@const i = pickerFor}
		<BlockPicker deck={ruleset.deck} {language} onpick={(r) => pick(ruleset, i, r)} onclose={() => (pickerFor = null)} />
	{/if}
	{#if deckOpen}
		<Sheet title={t(language, 'deckQ')} {language} onclose={() => (deckOpen = false)}>
			<DeckPicker deck={ruleset.deck} {language} onchange={(d) => setDeck(ruleset, d)} />
		</Sheet>
	{/if}
{/if}

{#if shareUrl}
	<ShareDialog url={shareUrl} {language} onclose={() => (shareUrl = null)} />
{/if}

<style lang="scss">
	.name {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 12px 0;
		font-size: 0.9em;

		input {
			font-size: 1.2em;
			font-weight: bold;
		}
	}

	.deck {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		margin: 0 0 12px;
	}

	.add {
		width: 100%;
		justify-content: center;
		border-style: dashed;
		margin: 6px 0;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 12px 0;

		.big {
			flex: 1;
			justify-content: center;
			padding: 16px;
			font-size: 1.1em;
		}
	}
</style>
