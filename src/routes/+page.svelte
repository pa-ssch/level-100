<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { detectLanguage } from '$lib/i18n';
	import { loadLanguage } from '$lib/game/storage';
	import Seo from '$lib/components/Seo.svelte';

	// Die Sprachweiche muss im Browser laufen: beim statischen Build gibt es keinen Server, der Accept-Language auswerten könnte.
	onMount(() => {
		const language = loadLanguage() ?? detectLanguage(navigator.language);
		goto(resolve('/[[language=language]]/start', { language }), { replaceState: true });
	});
</script>

<Seo
	title="Level 100"
	description="Create your own rulesets for level-based card games, share them as a link or QR code and track levels and scores while playing with real cards. Runs entirely in your browser."
/>

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
