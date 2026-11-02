<script lang="ts">
	import { browser } from '$app/environment';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { addBlock, removeBlock } from '$lib/game/blocks';
	import type { CardDeck } from '$lib/game/deck';
	import { estimateDifficulty } from '$lib/game/difficulty';
	import { createGame } from '$lib/game/game';
	import type { Requirement } from '$lib/game/requirements';
	import { RULESET_LIMITS, copyRuleset, createRuleset, validateRuleset, type Level, type Ruleset } from '$lib/game/ruleset';
	import { decodeRuleset } from '$lib/game/share';
	import { loadRulesets, saveGame, saveRuleset } from '$lib/game/storage';
	import { href, rulesetLinks } from '$lib/links';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import BlockPicker from '$lib/components/BlockPicker.svelte';
	import DeckPicker from '$lib/components/DeckPicker.svelte';
	import LevelRow from '$lib/components/LevelRow.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Switch from '$lib/components/Switch.svelte';

	let language = $derived(page.params.language);

	type View = { status: 'loading' } | { status: 'invalid' } | { status: 'ready'; ruleset: Ruleset };
	let view = $state<View>({ status: 'loading' });
	let pickerFor = $state<number | null>(null);
	let dragIndex = $state<number | null>(null);

	// Regelsatz laden: ?id= aus dem eigenen Verlauf, ?r= aus einem Link, sonst neu.
	$effect(() => {
		if (!browser) return;
		const id = page.url.searchParams.get('id');
		const payload = page.url.searchParams.get('r');
		const copy = page.url.searchParams.get('copy') === '1';
		if (id) {
			const stored = loadRulesets().find((s) => s.ruleset.id === id);
			view = stored ? { status: 'ready', ruleset: stored.ruleset } : { status: 'invalid' };
			return;
		}
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

	/** Bereinigte Fassung für Speichern und Spielen: leere Level fallen weg, der Name darf leer sein. */
	function finalize(ruleset: Ruleset): Ruleset | null {
		const r = $state.snapshot(ruleset) as Ruleset;
		r.name = r.name.trim();
		r.levels = r.levels.filter((l) => l.requirements.length > 0);
		return r.levels.length === 0 ? null : validateRuleset(r);
	}

	// Automatisch speichern, sobald etwas geändert wurde (kein „Fertig“-Knopf nötig).
	let touched = false;
	let pending = false;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;
	function flush() {
		clearTimeout(saveTimer);
		if (!pending || view.status !== 'ready') return;
		pending = false;
		const r = finalize(view.ruleset);
		if (r) saveRuleset(r);
	}
	$effect(() => {
		if (view.status !== 'ready') return;
		const json = JSON.stringify(view.ruleset);
		if (!touched) {
			touched = true;
			void json;
			return;
		}
		pending = true;
		clearTimeout(saveTimer);
		saveTimer = setTimeout(flush, 300);
	});
	beforeNavigate(flush);

	function setDeck(ruleset: Ruleset, deck: CardDeck, handSize: number) {
		ruleset.deck = deck;
		for (const level of ruleset.levels) {
			level.handSize = handSize;
			for (const r of level.requirements) {
				if (r.kind === 'set' && r.value !== undefined && (r.value < deck.minValue || r.value > deck.maxValue)) delete r.value;
			}
		}
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
			{ label: t(language, 'moveUp'), onselect: () => move(ruleset, i, i - 1), disabled: i === 0 },
			{ label: t(language, 'moveDown'), onselect: () => move(ruleset, i, i + 1), disabled: i === ruleset.levels.length - 1 },
			{ label: t(language, 'removeLevel'), onselect: () => ruleset.levels.splice(i, 1), danger: true, disabled: ruleset.levels.length <= 1 }
		];
	}

	function move(ruleset: Ruleset, from: number, to: number) {
		if (to < 0 || to >= ruleset.levels.length || from === to) return;
		const [level] = ruleset.levels.splice(from, 1);
		ruleset.levels.splice(to, 0, level);
	}

	// Drag & Drop über den Griff: die Zeile unter dem Zeiger bestimmt die neue Position.
	function dragMove(ruleset: Ruleset, e: PointerEvent) {
		if (dragIndex === null) return;
		const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-level-index]');
		if (!target) return;
		const to = Number(target.getAttribute('data-level-index'));
		if (Number.isInteger(to) && to !== dragIndex) {
			move(ruleset, dragIndex, to);
			dragIndex = to;
		}
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

	async function play(ruleset: Ruleset) {
		const r = finalize(ruleset);
		if (!r) return;
		saveRuleset(r, { played: true });
		saveGame(createGame(r));
		await goto((await rulesetLinks(r, language, page.url.origin)).play);
	}
</script>

<Seo title={t(language, 'editorTitle')} description={t(language, 'metaPrepare')} />

{#if view.status === 'invalid'}
	<h1>{t(language, 'editorTitle')}</h1>
	<p class="warn-text" role="alert">{t(language, 'invalidLink')}</p>
	<p><a href={href('/[[language=language]]/start', language)}>{t(language, 'toStart')}</a></p>
{:else if view.status === 'ready'}
	{@const ruleset = view.ruleset}
	{@const playable = ruleset.levels.some((l) => l.requirements.length > 0)}
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
				maxlength={RULESET_LIMITS.name}
				placeholder={t(language, 'customName', { n: ruleset.levels.length })}
				bind:value={ruleset.name}
			/>
		</label>

		<h2 class="q">{t(language, 'deckQ')}</h2>
		<DeckPicker
			deck={ruleset.deck}
			{language}
			newDeckHref={href('/[[language=language]]/deck', language, { return: 'prepare', id: ruleset.id })}
			onchange={(d, h) => setDeck(ruleset, d, h)}
		/>

		<h2 class="q">{t(language, 'levels')}</h2>
		{#each ruleset.levels as level, i (i)}
			<LevelRow
				{level}
				index={i}
				deck={ruleset.deck}
				{language}
				editable
				dragging={dragIndex === i}
				menu={levelMenu(ruleset, i)}
				onaddblock={() => (pickerFor = i)}
				onremoveblock={(b) =>
					(ruleset.levels[i].requirements = removeBlock($state.snapshot(ruleset.levels[i].requirements) as Requirement[], b))}
				ondragstart={() => (dragIndex = i)}
				ondragmove={(e) => dragMove(ruleset, e)}
				ondragend={() => (dragIndex = null)}
			/>
		{/each}
		<div class="level-tools">
			<button
				type="button"
				class="secondary add"
				onclick={() => addLevel(ruleset)}
				disabled={ruleset.levels.length >= RULESET_LIMITS.levels.max}><Icon name="plus" /> {t(language, 'addLevel')}</button
			>
			<button type="button" class="secondary" onclick={() => sortByDifficulty(ruleset)} disabled={ruleset.levels.length < 2}
				>{t(language, 'sortByDifficulty')}</button
			>
		</div>

		<div class="toggles">
			<Switch
				id="mode"
				checked={ruleset.mode === 'free'}
				onLabel={t(language, 'orderToggleFree')}
				offLabel={t(language, 'orderToggle')}
				onchange={(v) => (ruleset.mode = v ? 'free' : 'fixed')}
			/>
			<Switch
				id="points"
				checked={ruleset.points}
				onLabel={t(language, 'pointsToggle')}
				offLabel={t(language, 'pointsToggleOff')}
				onchange={(v) => (ruleset.points = v)}
			/>
		</div>

		<div class="actions">
			<button type="submit" class="primary big" disabled={!playable}><Icon name="play" /> {t(language, 'play')}</button>
		</div>
	</form>

	{#if pickerFor !== null}
		{@const i = pickerFor}
		<BlockPicker deck={ruleset.deck} {language} onpick={(r) => pick(ruleset, i, r)} onclose={() => (pickerFor = null)} />
	{/if}
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

	.q {
		font-size: 0.95em;
		margin: 18px 0 6px;
	}

	.level-tools {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 6px 0;

		.add {
			flex: 1;
			justify-content: center;
			border-style: dashed;
		}
	}

	.toggles {
		margin: 16px 0 4px;
		border-top: 1px solid var(--border);
		padding-top: 8px;
	}

	.actions {
		display: flex;
		margin: 12px 0 24px;

		.big {
			flex: 1;
			justify-content: center;
			padding: 16px;
			font-size: 1.1em;
		}
	}
</style>
