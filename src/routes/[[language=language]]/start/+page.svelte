<script lang="ts">
	import { CardDeck, Ruleset } from '$lib/ruleset';
	import GameRulesetTile from './GameRulesetTile.svelte';

	// TODO (PLAN.md Phase 6): aus History/Favoriten im localStorage laden statt Dummy-Daten.
	const previousRulesets = [
		new Ruleset('Stufe 10', undefined, new CardDeck()),
		new Ruleset('Contract Rummy', undefined, new CardDeck(13), [10, 10, 10, 10, 12, 12, 12])
	];
</script>

<svelte:head>
	<title>Start – Level 100</title>
	<meta name="description" content="Level 100 – create, share and play your own card game rulesets. Runs entirely in your browser." />
</svelte:head>

<div class="description"><span>Choose one of the rules below or create your own with the "New custom game" option.</span></div>

<div class="rulesets">
	{#each previousRulesets as ruleset (ruleset.id)}
		<GameRulesetTile {ruleset}></GameRulesetTile>
	{/each}
	<GameRulesetTile></GameRulesetTile>
</div>

<style lang="scss">
	.description {
		font-size: 1.2em;
		padding: 20px;
	}

	.rulesets {
		display: flex;
		flex-direction: column;
	}
</style>
