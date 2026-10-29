<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import { exampleRulesets, type Ruleset } from '$lib/game/ruleset';
	import { encodeRuleset } from '$lib/game/share';
	import { loadRulesets, removeRuleset, saveRuleset, toggleFavorite, type StoredRuleset } from '$lib/game/storage';
	import { isLanguage, t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import ShareDialog from '$lib/components/ShareDialog.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import GameRulesetTile from './GameRulesetTile.svelte';

	let language = $derived(page.params.language);
	let rulesets = $state<StoredRuleset[]>([]);
	let showExamplesHint = $state(false);
	/** Vorberechnete Links je Regelsatz (die Kodierung ist asynchron). */
	let links = $state<Record<string, { play: ResolvedPathname; edit: ResolvedPathname; copy: ResolvedPathname; share: string }>>({});
	let shareUrl = $state<string | null>(null);

	function href(route: '/[[language=language]]/play' | '/[[language=language]]/prepare', query: Record<string, string>): ResolvedPathname {
		// resolve() kennt keine Query-Parameter; der Pfad selbst ist aufgelöst, daher ist der Typ hier korrekt.
		return (resolve(route, { language }) + '?' + new URLSearchParams(query).toString()) as ResolvedPathname;
	}

	async function buildLinks(list: StoredRuleset[]) {
		const next: typeof links = {};
		for (const { ruleset } of list) {
			const r = await encodeRuleset(ruleset);
			next[ruleset.id] = {
				play: href('/[[language=language]]/play', { r }),
				edit: href('/[[language=language]]/prepare', { r }),
				copy: href('/[[language=language]]/prepare', { r, copy: '1' }),
				share: new URL(href('/[[language=language]]/play', { r }), page.url.origin).toString()
			};
		}
		links = next;
	}

	function setList(list: StoredRuleset[]) {
		rulesets = list;
		buildLinks(list);
	}

	$effect(() => {
		if (!browser) return;
		let list = loadRulesets();
		if (list.length === 0 && isLanguage(language)) {
			// Erster Start: Beispiele anlegen, damit die Seite nicht leer ist.
			for (const example of exampleRulesets(language).reverse()) list = saveRuleset(example);
			showExamplesHint = true;
		}
		setList(list);
	});

	function remove(ruleset: Ruleset) {
		if (confirm(t(language, 'deleteConfirm', { name: ruleset.name || t(language, 'unnamed') }))) setList(removeRuleset(ruleset.id));
	}
</script>

<Seo title="Level 100" description={t(language, 'metaStart')} />

<p class="description">{t(language, 'startIntro')}</p>
{#if showExamplesHint}
	<p class="hint">{t(language, 'examplesHint')}</p>
{/if}

<a class="new" href={resolve('/[[language=language]]/prepare', { language })}><Icon name="plus" /> {t(language, 'newRuleset')}</a>

<div class="rulesets">
	{#each rulesets as stored (stored.ruleset.id)}
		{@const l = links[stored.ruleset.id]}
		{#if l}
			<GameRulesetTile
				{stored}
				playHref={l.play}
				editHref={l.edit}
				copyHref={l.copy}
				onshare={() => (shareUrl = l.share)}
				ondelete={() => remove(stored.ruleset)}
				onfavorite={() => setList(toggleFavorite(stored.ruleset.id))}
			/>
		{/if}
	{/each}
</div>

{#if shareUrl}
	<ShareDialog url={shareUrl} {language} onclose={() => (shareUrl = null)} />
{/if}

<style lang="scss">
	.description {
		font-size: 1.1em;
		margin: 20px 0 8px;
	}

	.hint {
		opacity: 0.8;
		margin: 0 0 12px;
	}

	.new {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		border: 1px dashed var(--border);
		border-radius: 10px;
		padding: 12px 16px;
		margin: 8px 0;
		font-weight: bold;

		&:hover {
			border-color: var(--foreground);
		}
	}
</style>
