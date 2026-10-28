<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	// Regelsatz kommt später kodiert über ?r=... (PLAN.md, Entscheidung 2 und Phase 6); vorerst nur die ID.
	// Query-Parameter gibt es erst im Browser; beim Prerendern ist die URL ohne Suchparameter.
	let rulesetId = $derived(browser ? page.url.searchParams.get('r') : null);
</script>

<svelte:head>
	<title>Prepare – Level 100</title>
</svelte:head>

<!--
	Regeln einstellen, definieren:
	- Name (Textbox)
	- Kartendeck: Range & Farben (Numberboxen)
	- Level wählen (kombinieren, was man machen muss) + Anzahl der Karten pro Level
	-> zu play übergehen + QR-Code anzeigen (kodierte Werte in der URL)
-->

<p>Prepare ruleset {rulesetId ?? '(new)'}</p>

<select name="level" id="level">
	<optgroup label="Folge">
		<option value="dreierfolge">Dreierfolge</option>
		<option value="viererfolge">Viererfolge</option>
	</optgroup>
	<optgroup label="Farbfolge">
		<option value="dreierfarbfolge">Dreier Farbfolge</option>
		<option value="viererfarbfolge">Vierer Farbfolge</option>
	</optgroup>
	<optgroup label="Gleiche">
		<option value="paar">Paar</option>
		<option value="drilling">Drilling</option>
	</optgroup>
</select>
