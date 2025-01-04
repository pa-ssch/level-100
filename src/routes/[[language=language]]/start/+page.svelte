<script>
	import { CardDeck, Ruleset as Ruleset } from './ruleset.data';
	import GameRulesetTile from './GameRulesetTile.svelte';

	const previousRulesets = [
		new Ruleset('Stufe 10', undefined, new CardDeck()),
		new Ruleset('Contract Rummy', undefined, new CardDeck(13), [10, 10, 10, 10, 12, 12, 12]),
		new Ruleset('Dummy'),
		new Ruleset('Dummy'),
		new Ruleset('Dummy'),
		new Ruleset('Dummy')
	];
</script>

<div class="description"><span>Choose one of the rules below or create your own with the "New custom game" option.</span></div>

<div class="rulesets">
	{#each previousRulesets as ruleset}
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
