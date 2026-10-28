<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import type { Ruleset } from '$lib/ruleset';

	let { ruleset }: { ruleset?: Ruleset } = $props();

	let language = $derived(page.params.language);

	// resolve() kennt keine Query-Parameter; der Pfad selbst ist aufgelöst, daher ist der Typ hier korrekt.
	function href(route: '/[[language=language]]/play' | '/[[language=language]]/prepare', query?: Record<string, string>): ResolvedPathname {
		const search = query ? '?' + new URLSearchParams(query).toString() : '';
		return (resolve(route, { language }) + search) as ResolvedPathname;
	}

	function start(event: MouseEvent) {
		event.stopPropagation();
		goto(ruleset ? href('/[[language=language]]/play', { r: ruleset.id }) : href('/[[language=language]]/prepare'));
	}

	function edit(event: MouseEvent) {
		event.stopPropagation();
		if (ruleset) goto(href('/[[language=language]]/prepare', { r: ruleset.id }));
	}

	function copy(event: MouseEvent) {
		event.stopPropagation();
		if (ruleset) goto(href('/[[language=language]]/prepare', { r: ruleset.id, copy: '1' }));
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="ruleset" onclick={start}>
	<h3 class="noselect">{ruleset?.name ?? 'New custom game'}</h3>

	{#if ruleset}
		<button onclick={edit} aria-label="edit" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
		<button onclick={copy} aria-label="copy" title="Copy"><i class="fa-solid fa-clone"></i></button>
	{/if}
	<button onclick={start} aria-label="play" title="Start"><i class="fa-solid fa-play"></i></button>
</div>

<style lang="scss">
	.ruleset {
		border: 1px solid;
		padding: 10px;
		margin: 10px;
		border-radius: 10px;
		max-width: 800px;
		display: grid;
		grid-template-columns: 1fr auto auto auto;

		button {
			border: none;
			background: none;
			font-size: 2em;
		}
	}

	.ruleset:hover {
		border: 3px solid;
		margin: 8px;
		cursor: pointer;
	}
</style>
