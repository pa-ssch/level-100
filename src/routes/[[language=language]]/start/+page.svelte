<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { currentLevel, isFinished, type Game } from '$lib/game/game';
	import type { Ruleset } from '$lib/game/ruleset';
	import { loadGames, loadRulesets, removeRuleset, toggleFavorite, type StoredRuleset } from '$lib/game/storage';
	import { href, rulesetLinks, type RulesetLinks } from '$lib/links';
	import { displayName, t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import JoinDialog from '$lib/components/JoinDialog.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import InviteDialog from '$lib/components/InviteDialog.svelte';
	import { goto } from '$app/navigation';

	let language = $derived(page.params.language);
	let rulesets = $state<StoredRuleset[]>([]);
	let games = $state<Game[]>([]);
	let links = $state<Record<string, RulesetLinks>>({});
	let loaded = $state(false);
	let shareUrl = $state<string | null>(null);
	let joinOpen = $state(false);

	async function reload() {
		const list = loadRulesets();
		games = loadGames();
		const next: typeof links = {};
		for (const { ruleset } of list) next[ruleset.id] = await rulesetLinks(ruleset, language, page.url.origin);
		links = next;
		rulesets = list;
		loaded = true;
	}

	$effect(() => {
		if (browser) reload();
	});

	let running = $derived(rulesets.filter((s) => games.some((g) => g.ruleset.id === s.ruleset.id && !isFinished(g))));
	let rest = $derived(rulesets.filter((s) => !running.includes(s)));

	function gameOf(ruleset: Ruleset): Game | undefined {
		return games.find((g) => g.ruleset.id === ruleset.id);
	}

	function status(stored: StoredRuleset): string {
		const game = gameOf(stored.ruleset);
		if (game && !isFinished(game))
			return t(language, 'runningStatus', { n: (currentLevel(game) ?? 0) + 1, total: game.ruleset.levels.length });
		return stored.plays > 0 ? t(language, 'playsCount', { n: stored.plays }) : t(language, 'notPlayed');
	}

	function name(ruleset: Ruleset): string {
		return displayName(language, ruleset.name, ruleset.levels.length);
	}

	function remove(ruleset: Ruleset) {
		if (confirm(t(language, 'deleteConfirm', { name: name(ruleset) }))) {
			removeRuleset(ruleset.id);
			reload();
		}
	}

	function menuFor(stored: StoredRuleset) {
		const l = links[stored.ruleset.id];
		return [
			{ label: t(language, 'edit'), onselect: () => goto(href('/[[language=language]]/prepare', language, { id: stored.ruleset.id })) },
			{ label: t(language, 'share'), onselect: () => (shareUrl = l.share) },
			{ label: t(language, 'duplicate'), onselect: () => goto(l.duplicate) },
			{ label: t(language, 'delete'), onselect: () => remove(stored.ruleset), danger: true }
		];
	}
</script>

<Seo title="Level 100" description={t(language, 'metaStart')} />

{#snippet tile(stored: StoredRuleset)}
	{@const l = links[stored.ruleset.id]}
	{@const game = gameOf(stored.ruleset)}
	{@const live = game !== undefined && !isFinished(game)}
	<article class="tile" class:favorite={stored.favorite}>
		<a class="main" href={l.play}>
			<strong>{name(stored.ruleset)}</strong>
			<span class="meta"
				>{live ? status(stored) : `${t(language, 'levelCount', { n: stored.ruleset.levels.length })} · ${status(stored)}`}</span
			>
		</a>
		{#if live}<span class="badge">{t(language, 'running')}</span>{/if}
		<button
			type="button"
			class="icon-button star"
			onclick={() => {
				toggleFavorite(stored.ruleset.id);
				reload();
			}}
			aria-pressed={stored.favorite}
			aria-label="{t(language, stored.favorite ? 'unfavorite' : 'favorite')}: {name(stored.ruleset)}"
			title={t(language, stored.favorite ? 'unfavorite' : 'favorite')}
		>
			<Icon name={stored.favorite ? 'star' : 'star-outline'} />
		</button>
		<Menu label="{t(language, 'menu')}: {name(stored.ruleset)}" items={menuFor(stored)} />
	</article>
{/snippet}

{#if loaded && rulesets.length === 0}
	<section class="empty">
		<h1>{t(language, 'startTitle')}</h1>
		<p>{t(language, 'startIntro')}</p>
		<a class="big primary" href={href('/[[language=language]]/new', language)}><Icon name="plus" /> {t(language, 'newGame')}</a>
		<button type="button" class="big" onclick={() => (joinOpen = true)}><Icon name="link" /> {t(language, 'joinGame')}</button>
		<p class="hint">{t(language, 'joinHint')}</p>
	</section>
{:else if loaded}
	<a class="big primary" href={href('/[[language=language]]/new', language)}><Icon name="plus" /> {t(language, 'newGame')}</a>

	{#if running.length}
		<h2 class="section">{t(language, 'running')}</h2>
		{#each running as stored (stored.ruleset.id)}{@render tile(stored)}{/each}
	{/if}

	{#if rest.length}
		<h2 class="section">{t(language, 'history')}</h2>
		{#each rest as stored (stored.ruleset.id)}{@render tile(stored)}{/each}
	{/if}

	<p class="join">
		<button type="button" class="secondary" onclick={() => (joinOpen = true)}><Icon name="link" /> {t(language, 'joinGame')}</button>
	</p>
{/if}

{#if shareUrl}
	<InviteDialog url={shareUrl} {language} onclose={() => (shareUrl = null)} />
{/if}
{#if joinOpen}
	<JoinDialog {language} onclose={() => (joinOpen = false)} />
{/if}

<style lang="scss">
	.empty {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 480px;
		margin: 24px auto;
		text-align: center;

		h1 {
			margin: 0;
		}

		p {
			margin: 0;
		}

		.hint {
			opacity: 0.7;
			font-size: 0.9em;
		}
	}

	.big {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		font-weight: bold;
		font-size: 1.1em;
		margin: 12px 0;
		background: var(--surface);

		&.primary {
			background: var(--accent);
			border-color: var(--accent);
			color: #fff;
		}
	}

	.section {
		font-size: 0.8em;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		opacity: 0.7;
		margin: 20px 0 6px;
	}

	.tile {
		display: flex;
		align-items: center;
		gap: 4px;
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 12px;
		padding: 2px 4px 2px 0;
		margin: 8px 0;

		&.favorite {
			border-color: var(--accent);
		}

		.main {
			flex: 1;
			min-width: 0;
			display: flex;
			flex-direction: column;
			padding: 12px 14px;

			strong {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.meta {
				font-size: 0.85em;
				opacity: 0.75;
			}
		}

		.badge {
			font-size: 0.75em;
			background: var(--accent);
			color: #fff;
			border-radius: 999px;
			padding: 2px 8px;
			white-space: nowrap;
		}

		.star {
			color: var(--accent);
		}
	}

	.join {
		margin: 24px 0;
		text-align: center;
	}
</style>
