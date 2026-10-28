<script lang="ts">
	import { estimateDifficulty } from '$lib/game/difficulty';
	import type { CardDeck } from '$lib/game/deck';
	import { defaultRequirement, levelCards, type Requirement } from '$lib/game/requirements';
	import { RULESET_LIMITS, type Level } from '$lib/game/ruleset';
	import { describeLevel, t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import Difficulty from './Difficulty.svelte';
	import RequirementEditor from './RequirementEditor.svelte';

	let {
		level,
		index,
		total,
		deck,
		language,
		onchange,
		onremove,
		onmove
	}: {
		level: Level;
		index: number;
		total: number;
		deck: CardDeck;
		language: string | undefined;
		onchange: (level: Level) => void;
		onremove: () => void;
		onmove: (direction: -1 | 1) => void;
	} = $props();

	let needed = $derived(levelCards(level.requirements));
	let tooMany = $derived(needed > level.handSize);
	let estimate = $derived(estimateDifficulty(deck, level.handSize, level.requirements));
	const { min, max } = RULESET_LIMITS.handSize;
	const maxRequirements = RULESET_LIMITS.requirementsPerLevel.max;

	function setRequirement(i: number, r: Requirement) {
		onchange({ ...level, requirements: level.requirements.map((old, j) => (j === i ? r : old)) });
	}
	function removeRequirement(i: number) {
		if (level.requirements.length > 1) onchange({ ...level, requirements: level.requirements.filter((_, j) => j !== i) });
	}
	function addRequirement() {
		if (level.requirements.length < maxRequirements)
			onchange({ ...level, requirements: [...level.requirements, defaultRequirement('set')] });
	}
</script>

<section class="level" aria-label={t(language, 'level', { n: index + 1 })}>
	<header>
		<h3>{t(language, 'level', { n: index + 1 })}</h3>
		<p class="summary">{describeLevel(language, level.requirements)}</p>
		<div class="tools">
			<button
				type="button"
				class="icon-button"
				onclick={() => onmove(-1)}
				disabled={index === 0}
				aria-label={t(language, 'moveUp')}
				title={t(language, 'moveUp')}
			>
				<Icon name="arrow-up" />
			</button>
			<button
				type="button"
				class="icon-button"
				onclick={() => onmove(1)}
				disabled={index === total - 1}
				aria-label={t(language, 'moveDown')}
				title={t(language, 'moveDown')}
			>
				<Icon name="arrow-down" />
			</button>
			<button
				type="button"
				class="icon-button"
				onclick={onremove}
				disabled={total <= 1}
				aria-label={t(language, 'removeLevel')}
				title={t(language, 'removeLevel')}
			>
				<Icon name="trash" />
			</button>
		</div>
	</header>

	<div class="meta">
		<label>
			{t(language, 'handSize')}
			<input
				type="number"
				{min}
				{max}
				value={level.handSize}
				onchange={(e) => {
					const v = Number((e.target as HTMLInputElement).value);
					onchange({ ...level, handSize: Number.isInteger(v) ? Math.min(max, Math.max(min, v)) : min });
				}}
			/>
		</label>
		<span class="cards" class:warn={tooMany}>{t(language, 'cardsNeeded', { n: needed })}</span>
		<Difficulty {estimate} {language} />
	</div>
	{#if tooMany}
		<p class="warn" role="alert">{t(language, 'tooManyCards')}</p>
	{/if}

	<div class="requirements">
		{#each level.requirements as requirement, i (i)}
			<RequirementEditor
				{requirement}
				{deck}
				{language}
				id="{index}-{i}"
				onchange={(r) => setRequirement(i, r)}
				onremove={() => removeRequirement(i)}
			/>
		{/each}
		<button type="button" class="secondary" onclick={addRequirement} disabled={level.requirements.length >= maxRequirements}>
			<Icon name="plus" />
			{t(language, 'addRequirement')}
		</button>
	</div>
</section>

<style lang="scss">
	.level {
		border: 1px solid;
		border-radius: 10px;
		padding: 12px 16px;
		margin: 12px 0;
	}

	header {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 8px 16px;
		align-items: center;

		h3 {
			margin: 0;
		}

		.summary {
			margin: 0;
			font-weight: bold;
		}

		.tools {
			display: flex;
			gap: 4px;
		}
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
		align-items: center;
		margin: 8px 0;

		label {
			display: flex;
			gap: 8px;
			align-items: center;
			font-size: 0.9em;
		}

		input {
			width: 4.5em;
		}
	}

	.warn {
		color: #ffb347;
	}

	@media (max-width: 600px) {
		header {
			grid-template-columns: 1fr auto;

			.summary {
				grid-column: 1 / -1;
			}
		}
	}
</style>
