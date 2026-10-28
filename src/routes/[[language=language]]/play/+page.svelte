<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { GAME_LIMITS, applyRound, createGame, isFinished, openLevels, type Game } from '$lib/game/game';
	import type { Ruleset } from '$lib/game/ruleset';
	import { decodeRuleset } from '$lib/game/share';
	import { loadGame, saveGame, saveRuleset } from '$lib/game/storage';
	import { describeLevel, t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import ShareDialog from '$lib/components/ShareDialog.svelte';

	let language = $derived(page.params.language);

	type View =
		| { status: 'loading' }
		| { status: 'none' }
		| { status: 'invalid' }
		| { status: 'resume'; ruleset: Ruleset; game: Game }
		| { status: 'setup'; ruleset: Ruleset }
		| { status: 'playing'; game: Game };
	let view = $state<View>({ status: 'loading' });
	let playerNames = $state<string[]>(['', '']);
	let showAllLevels = $state(false);
	let shareOpen = $state(false);

	// Rundeneingabe: je Spieler das erfüllte Level (oder -1) und die Punkte
	let entry = $state<{ completed: number; points: number }[]>([]);

	$effect(() => {
		if (!browser) return;
		const payload = page.url.searchParams.get('r');
		if (payload === null) {
			// Ohne Link: ein laufendes Spiel fortsetzen, sonst Hinweis
			const game = loadGame();
			view = game && !isFinished(game) ? { status: 'playing', game } : { status: 'none' };
			return;
		}
		decodeRuleset(payload).then((ruleset) => {
			if (ruleset === null) {
				view = { status: 'invalid' };
				return;
			}
			saveRuleset(ruleset); // in den Verlauf aufnehmen
			const game = loadGame();
			if (game && game.ruleset.id === ruleset.id && !isFinished(game)) view = { status: 'resume', ruleset, game };
			else view = { status: 'setup', ruleset };
		});
	});

	function startGame(ruleset: Ruleset) {
		const names = playerNames.map((n, i) => n.trim().slice(0, GAME_LIMITS.playerName) || t(language, 'player', { n: i + 1 }));
		// Der Regelsatz liegt in einem $state-Proxy; structuredClone im Modell braucht ein normales Objekt.
		const game = createGame($state.snapshot(ruleset) as Ruleset, names);
		saveGame(game);
		setPlaying(game);
	}

	function setPlaying(game: Game) {
		entry = game.players.map(() => ({ completed: -1, points: 0 }));
		view = { status: 'playing', game };
	}

	function submitRound(game: Game) {
		const round = {
			results: entry.map((e) => ({ completed: e.completed >= 0 ? e.completed : null, points: Number.isFinite(e.points) ? e.points : 0 }))
		};
		const next = applyRound(game, round);
		saveGame(next);
		setPlaying(next);
	}

	function restart(ruleset: Ruleset, confirmFirst: boolean) {
		if (confirmFirst && !confirm(t(language, 'newGameConfirm'))) return;
		saveGame(null);
		playerNames = ['', ''];
		view = { status: 'setup', ruleset };
	}

	let shareUrl = $derived(browser ? page.url.toString() : '');
</script>

<svelte:head>
	<title>{t(language, 'playTitle')} – Level 100</title>
	<meta name="description" content="Track levels and scores for everyone at the table. Open a shared ruleset link to play along." />
</svelte:head>

{#if view.status === 'none'}
	<h1>{t(language, 'playTitle')}</h1>
	<p>{t(language, 'noGame')}</p>
	<p><a href={resolve('/[[language=language]]/start', { language })}>{t(language, 'toStart')}</a></p>
{:else if view.status === 'invalid'}
	<h1>{t(language, 'playTitle')}</h1>
	<p class="warn-text" role="alert">{t(language, 'invalidLink')}</p>
	<p><a href={resolve('/[[language=language]]/start', { language })}>{t(language, 'toStart')}</a></p>
{:else if view.status === 'resume'}
	{@const { ruleset, game } = view}
	<h1>{ruleset.name}</h1>
	<p>{t(language, 'continueGame')}</p>
	<div class="actions">
		<button type="button" class="primary" onclick={() => setPlaying(game)}><Icon name="play" /> {t(language, 'continue')}</button>
		<button type="button" onclick={() => restart(ruleset, false)}>{t(language, 'restart')}</button>
	</div>
{:else if view.status === 'setup'}
	{@const ruleset = view.ruleset}
	<h1>{ruleset.name}</h1>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			startGame(ruleset);
		}}
	>
		<h2><Icon name="users" /> {t(language, 'players')}</h2>
		{#each playerNames as name, i (i)}
			<div class="player-row">
				<label>
					<span class="visually-hidden">{t(language, 'playerName')} {i + 1}{name ? `: ${name}` : ''}</span>
					<input
						type="text"
						maxlength={GAME_LIMITS.playerName}
						placeholder={t(language, 'player', { n: i + 1 })}
						bind:value={playerNames[i]}
					/>
				</label>
				<button
					type="button"
					class="icon-button"
					onclick={() => playerNames.splice(i, 1)}
					disabled={playerNames.length <= GAME_LIMITS.players.min}
					aria-label="{t(language, 'removePlayer')} {i + 1}"
					title={t(language, 'removePlayer')}><Icon name="xmark" /></button
				>
			</div>
		{/each}
		<button type="button" class="secondary" onclick={() => playerNames.push('')} disabled={playerNames.length >= GAME_LIMITS.players.max}>
			<Icon name="plus" />
			{t(language, 'addPlayer')}
		</button>
		<div class="actions">
			<button type="submit" class="primary"><Icon name="play" /> {t(language, 'startGame')}</button>
			<button type="button" onclick={() => (shareOpen = true)}><Icon name="qrcode" /> {t(language, 'invite')}</button>
		</div>
	</form>
{:else if view.status === 'playing'}
	{@const game = view.game}
	{@const ruleset = game.ruleset}
	{@const finished = isFinished(game)}
	<h1>{ruleset.name}</h1>

	{#if finished}
		{@const winner = game.players.find((p) => p.done.every(Boolean))}
		<p class="finished" role="status">{t(language, 'finished', { name: winner?.name ?? '' })}</p>
	{/if}

	<table class="players">
		<thead>
			<tr>
				<th>{t(language, 'players')}</th>
				<th>{t(language, 'currentLevel')}</th>
				<th class="num">{t(language, 'points')}</th>
			</tr>
		</thead>
		<tbody>
			{#each game.players as player, i (i)}
				{@const open = openLevels(game, player)}
				<tr>
					<th scope="row">{player.name}</th>
					<td>
						{#if open.length === 0}
							<strong>{t(language, 'allDone')}</strong>
						{:else if ruleset.mode === 'fixed'}
							<strong>{t(language, 'level', { n: open[0] + 1 })}</strong>: {describeLevel(language, ruleset.levels[open[0]].requirements)}
							<small>({t(language, 'cardCount', { n: ruleset.levels[open[0]].handSize })})</small>
						{:else}
							<ul class="open">
								{#each open as index (index)}
									<li>
										<strong>{t(language, 'level', { n: index + 1 })}</strong>: {describeLevel(language, ruleset.levels[index].requirements)}
									</li>
								{/each}
							</ul>
						{/if}
					</td>
					<td class="num">{player.points}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if !finished}
		<form
			class="round"
			onsubmit={(e) => {
				e.preventDefault();
				submitRound(game);
			}}
		>
			<h2>{t(language, 'round', { n: game.rounds.length + 1 })}</h2>
			{#each game.players as player, i (i)}
				{@const open = openLevels(game, player)}
				<div class="round-row">
					<span class="name">{player.name}</span>
					{#if ruleset.mode === 'fixed'}
						<label class="checkbox">
							<input
								type="checkbox"
								checked={entry[i]?.completed === open[0]}
								disabled={open.length === 0}
								onchange={(e) => (entry[i].completed = (e.target as HTMLInputElement).checked ? open[0] : -1)}
							/>
							{t(language, 'completed')}
						</label>
					{:else}
						<label>
							{t(language, 'completedWhich')}
							<select
								value={String(entry[i]?.completed ?? -1)}
								onchange={(e) => (entry[i].completed = Number((e.target as HTMLSelectElement).value))}
							>
								<option value="-1">{t(language, 'none')}</option>
								{#each open as index (index)}
									<option value={String(index)}>{t(language, 'level', { n: index + 1 })}</option>
								{/each}
							</select>
						</label>
					{/if}
					<label>
						{t(language, 'roundPoints')}
						<input type="number" min={GAME_LIMITS.points.min} max={GAME_LIMITS.points.max} step="1" bind:value={entry[i].points} />
					</label>
				</div>
			{/each}
			<div class="actions">
				<button type="submit" class="primary">{t(language, 'submitRound')}</button>
			</div>
		</form>
	{/if}

	<div class="actions secondary-actions">
		<button type="button" class="secondary" onclick={() => (showAllLevels = !showAllLevels)} aria-expanded={showAllLevels}>
			{showAllLevels ? t(language, 'hideLevels') : t(language, 'showAllLevels')}
		</button>
		<button type="button" class="secondary" onclick={() => (shareOpen = true)}><Icon name="qrcode" /> {t(language, 'invite')}</button>
		<button type="button" class="secondary" onclick={() => restart(ruleset, !finished)}
			><Icon name="plus" /> {t(language, 'newGame')}</button
		>
	</div>

	{#if showAllLevels}
		<ol class="all-levels">
			{#each ruleset.levels as level, i (i)}
				<li>{describeLevel(language, level.requirements)} <small>({t(language, 'cardCount', { n: level.handSize })})</small></li>
			{/each}
		</ol>
	{/if}

	{#if game.rounds.length > 0}
		<details class="history">
			<summary>{t(language, 'rounds')}: {game.rounds.length}</summary>
			<table>
				<thead>
					<tr>
						<th></th>
						{#each game.players as player, i (i)}<th>{player.name}</th>{/each}
					</tr>
				</thead>
				<tbody>
					{#each game.rounds as round, r (r)}
						<tr>
							<th scope="row">{t(language, 'round', { n: r + 1 })}</th>
							{#each round.results as result, i (i)}
								<td class="num">{result.points}{result.completed !== null ? ' ✓' : ''}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</details>
	{/if}
{/if}

{#if shareOpen && shareUrl}
	<ShareDialog url={shareUrl} {language} onclose={() => (shareOpen = false)} />
{/if}

<style lang="scss">
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 16px 0;
	}

	.player-row {
		display: flex;
		gap: 8px;
		align-items: center;
		margin: 6px 0;

		label {
			flex: 1 1 auto;
		}

		input {
			width: 100%;
			box-sizing: border-box;
		}
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin: 12px 0;

		th,
		td {
			text-align: left;
			padding: 8px 6px;
			border-bottom: 1px solid var(--border);
			vertical-align: top;
		}

		.num {
			text-align: right;
			white-space: nowrap;
		}
	}

	.open {
		margin: 0;
		padding-left: 1.2em;
	}

	.finished {
		font-size: 1.2em;
		font-weight: bold;
		color: var(--accent);
	}

	.round {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 8px 16px 4px;
		margin: 16px 0;

		h2 {
			margin: 8px 0;
		}
	}

	.round-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
		align-items: center;
		padding: 8px 0;
		border-top: 1px solid var(--border);

		.name {
			flex: 1 1 120px;
			font-weight: bold;
		}

		label {
			display: flex;
			gap: 8px;
			align-items: center;
			font-size: 0.9em;
		}

		input[type='number'] {
			width: 5em;
		}
	}

	.all-levels li {
		margin: 4px 0;
	}

	.history {
		margin: 16px 0 32px;
	}
</style>
