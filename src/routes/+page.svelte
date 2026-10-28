<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { detectLanguage } from '$lib/i18n';
	import { loadLanguage } from '$lib/game/storage';

	// Die Sprachweiche muss im Browser laufen: beim statischen Build gibt es keinen Server, der Accept-Language auswerten könnte.
	onMount(() => {
		const language = loadLanguage() ?? detectLanguage(navigator.language);
		goto(resolve('/[[language=language]]/start', { language }), { replaceState: true });
	});
</script>

<svelte:head>
	<title>Level 100</title>
	<meta name="description" content="Level 100 – create, share and play your own card game rulesets. Runs entirely in your browser." />
</svelte:head>

<p class="choose">
	<a href={resolve('/[[language=language]]/start', { language: 'de-DE' })}>Deutsch</a>
	<a href={resolve('/[[language=language]]/start', { language: 'en-US' })}>English</a>
</p>

<style>
	.choose {
		display: flex;
		gap: 2em;
		justify-content: center;
		padding: 2em;
		font-size: 1.5em;
	}
</style>
