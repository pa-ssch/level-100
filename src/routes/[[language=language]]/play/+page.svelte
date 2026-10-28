<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	// Query-Parameter gibt es erst im Browser; beim Prerendern ist die URL ohne Suchparameter.
	let rulesetId = $derived(browser ? page.url.searchParams.get('r') : null);
</script>

<svelte:head>
	<title>Play – Level 100</title>
</svelte:head>

<!--
	Wenn Parameter da sind: Level anzeigen, Punkte eintragen, QR-Code zum Einladen anzeigen.
	Wenn nicht: Hinweis, ein Spiel über einen Link zu öffnen oder einen QR-Code zu scannen (ggf. falsch geteilt?).
	Gamemodes:
	- man sieht immer nur sein aktuelles Level, nicht die folgenden
	- man kann Level tauschen, indem man Punkte aufnimmt
-->

{#if rulesetId}
	<p>Playing ruleset {rulesetId}</p>
{:else}
	<p>No game selected. Open a shared link or scan a QR code.</p>
{/if}
