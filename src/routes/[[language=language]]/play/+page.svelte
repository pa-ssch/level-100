<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { GAME_LIMITS, applyRound, createGame, currentLevel, isFinished, openLevels, restartGame, type Game } from '$lib/game/game';
	import { levelCards } from '$lib/game/requirements';
	import type { Ruleset } from '$lib/game/ruleset';
	import { decodeRuleset } from '$lib/game/share';
	import { loadGame, saveGame, saveRuleset } from '$lib/game/storage';
	import { href } from '$lib/links';
	import { describeLevel, displayName, t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import InviteDialog from '$lib/components/InviteDialog.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Sheet from '$lib/components/Sheet.svelte';

	let language = $derived(page.params.language);

	type View =
		| { status: 'loading' }
		| { status: 'none' }
		| { status: 'invalid' }
		| { status: 'join'; ruleset: Ruleset; again: boolean }
		| { status: 'playing'; game: Game };
	let view = $state<View>({ status: 'loading' });
	let error = $state<string | null>(null);
	let showAll = $state(false);
	let inviteOpen = $state(false);
	/** Punkteblatt: welches Level geschafft (null = keins) und Punkte. */
	let entry = $state<{ completed: number | null; points: number } | null>(null);

	$effect(() => {
		if (!browser) return;
		const payload = page.url.searchParams.get('r');
		const go = page.url.searchParams.get('go') === '1';
		if (payload === null) {
			view = { status: 'none' };
			return;
		}
		decodeRuleset(payload).then((ruleset) => {
			if (ruleset === null) {
				view = { status: 'invalid' };
				return;
			}
			saveRuleset(ruleset); // in den Verlauf aufnehmen
			const game = loadGame(ruleset.id);
			if (game && !isFinished(game)) view = { status: 'playing', game };
			else if (go) start(ruleset);
			else view = { status: 'join', ruleset, again: game !== null };
		});
	});

	function start(ruleset: Ruleset) {
		try {
			// Aus der Beitreten-Ansicht kommt der Regelsatz als $state-Proxy; structuredClone braucht ein normales Objekt.
			const plain = $state.snapshot(ruleset) as Ruleset;
			const game = createGame(plain);
			saveRuleset(plain, { played: true });
			saveGame(game);
			view = { status: 'playing', game };
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	/** Runde abschließen: bei Punkten erst das Punkteblatt, sonst sofort eintragen. */
	function finishRound(game: Game, completed: number | null) {
		if (game.ruleset.points) entry = { completed, points: 0 };
		else commit(game, { completed, points: 0 });
	}

	function commit(game: Game, round: { completed: number | null; points: number }) {
		try {
			const next = applyRound($state.snapshot(game) as Game, round);
			saveGame(next);
			view = { status: 'playing', game: next };
			entry = null;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	function again(game: Game) {
		const next = restartGame($state.snapshot(game) as Game);
		saveRuleset(next.ruleset, { played: true });
		saveGame(next);
		view = { status: 'playing', game: next };
	}

	let inviteUrl = $derived.by(() => {
		if (!browser) return '';
		const url = new URL(page.url);
		url.searchParams.delete('go');
		return url.toString();
	});
</script>

<Seo title={t(language, 'play')} description={t(language, 'metaPlay')} />

{#if view.status === 'none'}
	<h1>{t(language, 'play')}</h1>
	<p>{t(language, 'noGame')}</p>
	<p><a href={href('/[[language=language]]/start', language)}>{t(language, 'toStart')}</a></p>
{:else if view.status === 'invalid'}
	<h1>{t(language, 'play')}</h1>
	<p class="warn-text" role="alert">{t(language, 'invalidLink')}</p>
	<p><a href={href('/[[language=language]]/start', language)}>{t(language, 'toStart')}</a></p>
{:else if view.status === 'join'}
	{@const ruleset = view.ruleset}
	<h1>{displayName(language, ruleset.name, ruleset.levels.length)}</h1>
	<p class="meta">
		{t(language, 'levelCount', { n: ruleset.levels.length })} · {t(language, 'cardCount', { n: ruleset.levels[0].handSize })} · {t(
			language,
			'joinIntro'
		)}
	</p>
	<ol class="levels">
		{#each ruleset.levels.slice(0, 3) as level, i (i)}
			<li>{describeLevel(language, level.requirements)}</li>
		{/each}
	</ol>
	{#if ruleset.levels.length > 3}
		<p class="meta">{t(language, 'joinMore', { n: ruleset.levels.length - 3 })}</p>
	{/if}
	<div class="actions">
		<button type="button" class="primary big" onclick={() => start(ruleset)}
			><Icon name="play" /> {view.again ? t(language, 'playAgain') : t(language, 'joinPlay')}</button
		>
	</div>
	<p class="meta">{t(language, 'joinSaved')}</p>
{:else if view.status === 'playing'}
	{@const game = view.game}
	{@const ruleset = game.ruleset}
	{@const finished = isFinished(game)}
	{@const current = currentLevel(game)}
	{@const open = openLevels(game)}
	{@const free = ruleset.mode === 'free'}
	<header class="top">
		<h1>{displayName(language, ruleset.name, ruleset.levels.length)}</h1>
		<button
			type="button"
			class="icon-button"
			onclick={() => (inviteOpen = true)}
			aria-label={t(language, 'invite')}
			title={t(language, 'invite')}><Icon name="user-plus" /></button
		>
	</header>

	{#if !free}
		<div
			class="progress"
			role="img"
			aria-label={t(language, 'levelOf', { n: (current ?? ruleset.levels.length - 1) + 1, total: ruleset.levels.length })}
		>
			{#each game.done as done, i (i)}
				<i class:done class:now={i === current}></i>
			{/each}
		</div>
	{/if}
	<p class="meta center">
		{#if finished}{t(language, 'finishedStatus')}{:else if free}{t(language, 'levelCount', { n: open.length })}{:else}{t(
				language,
				'levelOf',
				{ n: (current ?? 0) + 1, total: ruleset.levels.length }
			)}{/if}
		{#if ruleset.points}· {t(language, 'pointsTotal', { n: game.points })}{/if}
	</p>

	{#if finished}
		<section class="hero finished" role="status">
			<div class="lvl">🎉</div>
			<div class="req">{t(language, 'finishedTitle')}</div>
			<div class="hand">
				{ruleset.points
					? t(language, 'finishedSummary', { rounds: game.rounds.length, points: game.points })
					: t(language, 'finishedSummaryNoPoints', { rounds: game.rounds.length })}
			</div>
		</section>
		<div class="actions">
			<button type="button" class="primary big" onclick={() => again(game)}><Icon name="rotate-right" /> {t(language, 'playAgain')}</button>
			<a class="button" href={href('/[[language=language]]/start', language)}>{t(language, 'toHistory')}</a>
		</div>
	{:else if !free && current !== null}
		{@const level = ruleset.levels[current]}
		<section class="hero">
			<div class="lvl">{t(language, 'yourLevel')}</div>
			<div class="req">{describeLevel(language, level.requirements)}</div>
			<div class="hand">
				{levelCards(level.requirements) > 0
					? t(language, 'handNeeded', { hand: level.handSize, need: levelCards(level.requirements) })
					: t(language, 'handOnly', { hand: level.handSize })}
			</div>
		</section>
		<div class="actions">
			<button type="button" class="primary big" onclick={() => finishRound(game, current)}
				><Icon name="check" /> {t(language, 'completed')}</button
			>
		</div>
		{#if ruleset.points}
			<div class="actions">
				<button type="button" class="secondary wide" onclick={() => finishRound(game, null)}>{t(language, 'notCompleted')}</button>
			</div>
		{/if}
		{#if current + 1 < ruleset.levels.length}
			<p class="meta center">{t(language, 'nextLevel', { d: describeLevel(language, ruleset.levels[current + 1].requirements) })}</p>
		{/if}
	{:else}
		<!-- Freie Reihenfolge: jedes offene Level ist eine Kachel; Antippen = geschafft. Erledigte bleiben als Fortschritt sichtbar. -->
		<p class="meta center">{t(language, 'whichLevel')}</p>
		<div class="tiles">
			{#each ruleset.levels as level, i (i)}
				<button type="button" class="tile" class:done={game.done[i]} disabled={game.done[i]} onclick={() => finishRound(game, i)}>
					{#if game.done[i]}<Icon name="check" />{/if}
					<span>{describeLevel(language, level.requirements)}</span>
				</button>
			{/each}
			{#if ruleset.points}
				<button type="button" class="tile none" onclick={() => finishRound(game, null)}>
					<span>{t(language, 'notCompleted')}</span>
				</button>
			{/if}
		</div>
	{/if}

	{#if !free}
		<p class="center">
			<button type="button" class="secondary" onclick={() => (showAll = !showAll)} aria-expanded={showAll}
				>{showAll ? t(language, 'hideAll') : t(language, 'showAll')}</button
			>
		</p>
		{#if showAll}
			<ol class="levels">
				{#each ruleset.levels as level, i (i)}
					<li class:done={game.done[i]}>
						{describeLevel(language, level.requirements)} <small>({t(language, 'cardCount', { n: level.handSize })})</small>
					</li>
				{/each}
			</ol>
		{/if}
	{/if}

	{#if entry}
		{@const draft = entry}
		<Sheet title={t(language, 'pointsSheet')} {language} onclose={() => (entry = null)}>
			<form
				class="points"
				onsubmit={(e) => {
					e.preventDefault();
					commit(game, { completed: draft.completed, points: draft.points });
				}}
			>
				<label>
					<span class="visually-hidden">{t(language, 'pointsSheet')}</span>
					<input
						type="number"
						inputmode="numeric"
						min={GAME_LIMITS.points.min}
						max={GAME_LIMITS.points.max}
						step="1"
						bind:value={draft.points}
					/>
				</label>
				<div class="quick">
					{#each [5, 10, 15, 20, 25] as n (n)}
						<button type="button" onclick={() => (draft.points = Math.min(GAME_LIMITS.points.max, (draft.points || 0) + n))}>+{n}</button>
					{/each}
					<button type="button" onclick={() => (draft.points = 0)}>0</button>
				</div>
				<button type="submit" class="primary big">{t(language, 'done')}</button>
			</form>
		</Sheet>
	{/if}
{/if}

{#if error}
	<p class="warn-text" role="alert">{t(language, 'unexpectedError')}: {error}</p>
{/if}
{#if inviteOpen && inviteUrl}
	<InviteDialog url={inviteUrl} {language} onclose={() => (inviteOpen = false)} />
{/if}

<style lang="scss">
	h1 {
		font-size: 1.4em;
		margin: 12px 0;
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.meta {
		opacity: 0.75;
		font-size: 0.9em;
		margin: 4px 0;
	}

	.center {
		text-align: center;
	}

	.progress {
		display: flex;
		gap: 4px;
		margin: 8px 0 4px;

		i {
			flex: 1;
			height: 8px;
			border-radius: 4px;
			background: var(--border);

			&.done {
				background: var(--accent);
			}

			&.now {
				background: var(--foreground);
			}
		}
	}

	.hero {
		border: 2px solid var(--accent);
		border-radius: 16px;
		padding: 20px 16px;
		text-align: center;
		background: var(--surface);
		margin: 12px 0;

		.lvl {
			font-size: 0.8em;
			text-transform: uppercase;
			letter-spacing: 0.1em;
			opacity: 0.7;
		}

		.req {
			font-size: 1.7em;
			font-weight: bold;
			line-height: 1.15;
			margin: 8px 0;
		}

		.hand {
			opacity: 0.75;
			font-size: 0.9em;
		}
	}

	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 10px;
		margin: 12px 0;

		.tile {
			flex-direction: column;
			justify-content: center;
			gap: 6px;
			min-height: 92px;
			padding: 14px 10px;
			text-align: center;
			font-weight: bold;
			border: 2px solid var(--accent);
			border-radius: 14px;
			font-size: 1.05em;

			&.done {
				border-color: var(--border);
				opacity: 0.45;
				text-decoration: line-through;
			}

			&.none {
				border-style: dashed;
				border-color: var(--border);
				font-weight: normal;
			}
		}
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 10px 0;

		.big {
			flex: 1;
			justify-content: center;
			padding: 18px;
			font-size: 1.15em;
		}

		.wide {
			flex: 1;
			justify-content: center;
		}

		.button {
			flex: 1;
			display: inline-flex;
			justify-content: center;
			align-items: center;
			border: 1px solid var(--border);
			border-radius: 6px;
			padding: 6px 10px;
		}
	}

	.levels {
		padding-left: 1.4em;

		li {
			margin: 4px 0;

			&.done {
				opacity: 0.5;
				text-decoration: line-through;
			}
		}
	}

	.points {
		display: flex;
		flex-direction: column;
		gap: 12px;

		input {
			width: 100%;
			box-sizing: border-box;
			font-size: 2em;
			font-weight: bold;
			text-align: center;
		}

		.quick {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 6px;

			button {
				justify-content: center;
				padding: 12px;
				font-weight: bold;
			}
		}

		.big {
			justify-content: center;
			padding: 14px;
		}
	}
</style>
