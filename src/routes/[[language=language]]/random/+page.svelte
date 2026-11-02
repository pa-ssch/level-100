<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { DECK_PRESETS, deckSize, type CardDeck } from '$lib/game/deck';
	import { createGame } from '$lib/game/game';
	import {
		LEVELS_PER_DURATION,
		MINUTES_PER_LEVEL,
		candidateLevels,
		generateLevels,
		rerollLevel,
		type Candidate,
		type DifficultyPreset,
		type Duration
	} from '$lib/game/generator';
	import { RULESET_LIMITS, createRuleset, type Level, type Ruleset } from '$lib/game/ruleset';
	import { saveGame, saveRuleset } from '$lib/game/storage';
	import { href, rulesetLinks } from '$lib/links';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import DeckPicker from '$lib/components/DeckPicker.svelte';
	import LevelRow from '$lib/components/LevelRow.svelte';
	import MoreOptions from '$lib/components/MoreOptions.svelte';
	import Segmented from '$lib/components/Segmented.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import ShareDialog from '$lib/components/ShareDialog.svelte';

	let language = $derived(page.params.language);

	// Vorgaben; der Regelsatz hält Deck und die „Mehr“-Optionen, die Level kommen aus dem Generator.
	let ruleset = $state<Ruleset>(
		createRuleset({ name: '', levels: [{ requirements: [{ kind: 'set', size: 3, count: 2 }], handSize: 10 }] })
	);
	let duration = $state<Duration>('medium');
	let difficulty = $state<DifficultyPreset>('medium');
	let step = $state<'setup' | 'rolling' | 'preview'>('setup');
	let seed = $state(1);
	let candidates: Candidate[] = [];
	let candidateKey = '';
	let shareUrl = $state<string | null>(null);

	const durations: Duration[] = ['short', 'medium', 'long'];
	const difficulties: DifficultyPreset[] = ['easy', 'medium', 'hard'];
	const difficultyLabel: Record<DifficultyPreset, 'easy' | 'mediumDiff' | 'hard'> = { easy: 'easy', medium: 'mediumDiff', hard: 'hard' };

	function setDeck(deck: CardDeck) {
		ruleset.deck = deck;
		const handSize = JSON.stringify(deck) === JSON.stringify(DECK_PRESETS.poker) ? 7 : 10;
		for (const level of ruleset.levels) level.handSize = Math.min(handSize, deckSize(deck));
	}

	function ensureCandidates(): Candidate[] {
		const handSize = ruleset.levels[0].handSize;
		const key = JSON.stringify([ruleset.deck, handSize]);
		if (key !== candidateKey) {
			candidates = candidateLevels($state.snapshot(ruleset.deck), handSize);
			candidateKey = key;
		}
		return candidates;
	}

	function roll() {
		step = 'rolling';
		// Die Schätzung läuft synchron (etwa eine Sekunde); erst rendern, dann rechnen.
		setTimeout(() => {
			seed = Math.floor(Math.random() * 2 ** 31);
			const handSize = ruleset.levels[0].handSize;
			const levels = generateLevels(
				$state.snapshot(ruleset.deck),
				handSize,
				LEVELS_PER_DURATION[duration],
				difficulty,
				seed,
				ensureCandidates()
			);
			ruleset.levels = levels.length ? levels : ruleset.levels;
			ruleset.name = t(language, 'randomName', { difficulty: t(language, difficultyLabel[difficulty]), n: ruleset.levels.length });
			step = 'preview';
		}, 20);
	}

	function reroll(index: number) {
		const levels = $state.snapshot(ruleset.levels) as Level[];
		ruleset.levels[index] = rerollLevel(
			levels,
			index,
			$state.snapshot(ruleset.deck),
			Math.floor(Math.random() * 2 ** 31),
			ensureCandidates()
		);
	}

	function finalRuleset(): Ruleset {
		const r = $state.snapshot(ruleset) as Ruleset;
		r.name = r.name.trim().slice(0, RULESET_LIMITS.name) || t(language, 'unnamed');
		return r;
	}

	async function play() {
		const r = finalRuleset();
		saveRuleset(r, { played: true });
		saveGame(createGame(r));
		await goto((await rulesetLinks(r, language, page.url.origin)).play);
	}

	async function share() {
		const r = finalRuleset();
		saveRuleset(r);
		shareUrl = (await rulesetLinks(r, language, page.url.origin)).share;
	}

	async function adjust() {
		const r = finalRuleset();
		saveRuleset(r);
		await goto((await rulesetLinks(r, language, page.url.origin)).edit);
	}

	let minutes = $derived((d: Duration) => t(language, 'minutes', { m: LEVELS_PER_DURATION[d] * MINUTES_PER_LEVEL }));
</script>

<Seo title={t(language, 'randomScreen')} description={t(language, 'metaRandom')} />

{#if step !== 'preview'}
	<h1>{t(language, 'randomScreen')}</h1>

	<h2 class="q">{t(language, 'deckQ')}</h2>
	<DeckPicker deck={ruleset.deck} {language} onchange={setDeck} />

	<h2 class="q">{t(language, 'durationQ')}</h2>
	<Segmented
		label={t(language, 'durationQ')}
		options={durations.map((d) => ({
			value: d,
			label: t(language, d),
			hint: `${minutes(d)} · ${t(language, 'levelCount', { n: LEVELS_PER_DURATION[d] })}`
		}))}
		value={duration}
		onchange={(d) => (duration = d)}
	/>

	<h2 class="q">{t(language, 'difficultyQ')}</h2>
	<Segmented
		label={t(language, 'difficultyQ')}
		options={difficulties.map((d) => ({ value: d, label: t(language, difficultyLabel[d]) }))}
		value={difficulty}
		onchange={(d) => (difficulty = d)}
	/>
	<p class="hint">{t(language, 'sortedHint')}</p>

	<MoreOptions {ruleset} {language} showDeck />

	<div class="actions">
		<button type="button" class="primary big" onclick={roll} disabled={step === 'rolling' || !browser}>
			<Icon name="dice" />
			{step === 'rolling' ? t(language, 'rolling') : t(language, 'roll')}
		</button>
	</div>
{:else}
	<label class="name">
		<span class="visually-hidden">{t(language, 'name')}</span>
		<input type="text" maxlength={RULESET_LIMITS.name} bind:value={ruleset.name} />
		<small>{t(language, 'nameHint')}</small>
	</label>

	{#each ruleset.levels as level, i (i)}
		<LevelRow {level} index={i} deck={ruleset.deck} {language} onreroll={() => reroll(i)} />
	{/each}

	<div class="actions">
		<button type="button" onclick={roll}><Icon name="rotate-right" /> {t(language, 'rerollAll')}</button>
		<button type="button" onclick={adjust}><Icon name="pen" /> {t(language, 'adjust')}</button>
		<button type="button" onclick={share}><Icon name="qrcode" /> {t(language, 'share')}</button>
	</div>
	<div class="actions">
		<button type="button" class="primary big" onclick={play}><Icon name="play" /> {t(language, 'play')}</button>
	</div>
	<p class="hint">
		<a
			href={href('/[[language=language]]/random', language)}
			onclick={(e) => {
				e.preventDefault();
				step = 'setup';
			}}>{t(language, 'back')}</a
		>
	</p>
{/if}

{#if shareUrl}
	<ShareDialog url={shareUrl} {language} onclose={() => (shareUrl = null)} />
{/if}

<style lang="scss">
	h1 {
		font-size: 1.4em;
	}

	.q {
		font-size: 0.95em;
		margin: 18px 0 6px;
	}

	.hint {
		opacity: 0.7;
		font-size: 0.9em;
	}

	.name {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 8px 0 12px;

		input {
			font-size: 1.3em;
			font-weight: bold;
			border-color: transparent;
			background: none;
			padding-left: 0;

			&:focus {
				border-color: var(--border);
				background: var(--surface);
				padding-left: 10px;
			}
		}

		small {
			opacity: 0.6;
			font-size: 0.8em;
		}
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 16px 0;

		.big {
			flex: 1;
			justify-content: center;
			padding: 16px;
			font-size: 1.1em;
		}
	}
</style>
