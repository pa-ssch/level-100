<script lang="ts">
	import { Ruleset } from './ruleset.data';
	import { goto } from '$app/navigation';

	let { ruleset }: { ruleset?: Ruleset } = $props();

	function start(event: MouseEvent) {
		event.stopPropagation();
		goto(`./play/${ruleset?.id ?? 'new'}`);
	}

	function edit(event: MouseEvent) {
		event.stopPropagation();
		goto(`./prepare/${ruleset!.id}`);
	}

	function copy(event: MouseEvent) {
		event.stopPropagation();
		goto(`./prepare/copy${ruleset!.id}`);
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
		min-width: 400px;
		display: grid;
		grid-template-columns: 1fr auto auto auto;

		button {
			border: None;
			background: None;
			font-size: 2em;
		}
	}

	.ruleset:hover {
		border: 3px solid;
		margin: 8px;
		cursor: pointer;
	}
</style>
