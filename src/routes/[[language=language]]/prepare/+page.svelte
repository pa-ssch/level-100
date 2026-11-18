<script lang="ts">
	import { browser } from '$app/env';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { levelProblem } from '#lib/game/blocks.ts';
	import type { CardDeck } from '#lib/game/deck.ts';
	import { handSizeAfterDeckChange } from '#lib/game/decks.ts';
	import { estimateDifficulty } from '#lib/game/difficulty.ts';
	import { createGame } from '#lib/game/game.ts';
	import type { Requirement } from '#lib/game/requirements.ts';
	import { RULESET_LIMITS, copyRuleset, createRuleset, validateRuleset, type Level, type Ruleset } from '#lib/game/ruleset.ts';
	import { decodeRuleset } from '#lib/game/share.ts';
	import { loadRulesets, saveGame, saveRuleset } from '#lib/game/storage.ts';
	import { href, rulesetLinks } from '#lib/links.ts';
	import { t } from '#lib/i18n.ts';
	import Icon from '#lib/Icon.svelte';
	import BlockPicker from '#lib/components/BlockPicker.svelte';
	import DeckPicker from '#lib/components/DeckPicker.svelte';
	import HandSizeField from '#lib/components/HandSizeField.svelte';
	import LevelRow from '#lib/components/LevelRow.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import Switch from '#lib/components/Switch.svelte';

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

	/** Handkarten gelten für alle Level; das Modell hält sie trotzdem je Level. */
	function setHandSize(ruleset: Ruleset, handSize: number) {
		for (const level of ruleset.levels) level.handSize = handSize;
	}

	function setDeck(ruleset: Ruleset, deck: CardDeck) {
		const handSize = handSizeAfterDeckChange(ruleset.levels[0]?.handSize ?? 10, $state.snapshot(ruleset.deck), deck);
		ruleset.deck = deck;
		setHandSize(ruleset, handSize);
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
			{ label: t(language, 'removeLevel'), onselect: () => ruleset.levels.splice(i, 1), danger: true, disabled: ruleset.levels.length <= 1 }
		];
	}

	function move(ruleset: Ruleset, from: number, to: number) {
		if (to < 0 || to >= ruleset.levels.length || from === to) return;
		const [level] = ruleset.levels.splice(from, 1);
		ruleset.levels.splice(to, 0, level);
	}

	/** Tastatur: Griff behält den Fokus, wenn die Zeile wandert. */
	function moveByKey(ruleset: Ruleset, from: number, delta: -1 | 1) {
		const to = from + delta;
		if (to < 0 || to >= ruleset.levels.length) return;
		move(ruleset, from, to);
		requestAnimationFrame(() => {
			document.querySelector<HTMLElement>(`[data-level-index="${to}"] .grip`)?.focus();
		});
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

	function setRequirements(ruleset: Ruleset, i: number, requirements: Requirement[]) {
		ruleset.levels[i].requirements = requirements;
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
	{@const handSize = ruleset.levels[0]?.handSize ?? 10}
	{@const broken = ruleset.levels.some((l) => levelProblem(ruleset.deck, l.handSize, l.requirements) !== null)}
	{@const playable = !broken && ruleset.levels.some((l) => l.requirements.length > 0)}
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
			onchange={(d) => setDeck(ruleset, d)}
		/>

		<h2 class="q">{t(language, 'handSizeQ')}</h2>

		<HandSizeField value={handSize} deck={ruleset.deck} {language} onchange={(n) => setHandSize(ruleset, n)} />

		<h2 class="q">{t(language, 'modeQ')}</h2>
		<Segmented
			label={t(language, 'modeQ')}
			options={[
				{ value: 'fixed', label: t(language, 'modeFixed') },
				{ value: 'free', label: t(language, 'modeFree') }
			]}
			value={ruleset.mode}
			onchange={(m) => (ruleset.mode = m)}
		/>
		<p class="hint">{ruleset.mode === 'free' ? t(language, 'orderHintFree') : t(language, 'orderHintFixed')}</p>

		<h2 class="q">{t(language, 'levels')}</h2>
		{#each ruleset.levels as level, i (i)}
			<LevelRow
				{level}
				index={i}
				deck={ruleset.deck}
				{language}
				numbered={ruleset.mode === 'fixed'}
				editable
				dragging={dragIndex === i}
				menu={levelMenu(ruleset, i)}
				onedit={() => (pickerFor = i)}
				ondragstart={() => (dragIndex = i)}
				ondragmove={(e) => dragMove(ruleset, e)}
				ondragend={() => (dragIndex = null)}
				onmove={(delta) => moveByKey(ruleset, i, delta)}
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
				id="points"
				checked={ruleset.points}
				onLabel={t(language, 'pointsToggle')}
				offLabel={t(language, 'pointsToggleOff')}
				onchange={(v) => (ruleset.points = v)}
			/>
			<p class="toggle-hint">{ruleset.points ? t(language, 'pointsHintOn') : t(language, 'pointsHintOff')}</p>
		</div>

		<div class="actions">
			<button type="submit" class="primary big" disabled={!playable}><Icon name="play" /> {t(language, 'play')}</button>
		</div>
		{#if broken}
			<p class="warn-text blocked" role="alert">{t(language, 'fixLevels')}</p>
		{/if}
	</form>

	{#if pickerFor !== null}
		{@const i = pickerFor}
		<BlockPicker
			title={ruleset.mode === 'fixed' ? t(language, 'blocksForLevel', { n: i + 1 }) : t(language, 'blockPick')}
			deck={ruleset.deck}
			{handSize}
			requirements={ruleset.levels[i].requirements}
			{language}
			onchange={(r) => setRequirements(ruleset, i, r)}
			onclose={() => (pickerFor = null)}
		/>
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

	.hint {
		margin: 8px 0 0;
		font-size: 0.9em;
		opacity: 0.75;
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

	.toggle-hint {
		margin: -6px 0 8px 54px;
		font-size: 0.9em;
		opacity: 0.75;
	}

	.toggles {
		margin: 16px 0 4px;
		border-top: 1px solid var(--border);
		padding-top: 8px;
	}

	.actions {
		display: flex;
		margin: 12px 0 8px;

		.big {
			flex: 1;
			justify-content: center;
			padding: 16px;
			font-size: 1.1em;
		}
	}

	.blocked {
		margin: 0 0 24px;
		text-align: center;
		font-size: 0.95em;
	}
</style>
