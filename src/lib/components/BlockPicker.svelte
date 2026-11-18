<script lang="ts">
	import { addBlock, blockCount, blockGroups, blocksFor, setBlockCount, type BlockGroup } from '$lib/game/blocks';
	import type { CardDeck } from '$lib/game/deck';
	import { REQUIREMENT_LIMITS, levelCards, type Requirement } from '$lib/game/requirements';
	import { RULESET_LIMITS } from '$lib/game/ruleset';
	import { describeLevel, describeRequirement, t, type StringKey } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import Sheet from './Sheet.svelte';

	let {
		title,
		deck,
		handSize,
		requirements,
		language,
		onchange,
		onclose
	}: {
		title: string;
		deck: CardDeck;
		handSize: number;
		requirements: Requirement[];
		language: string | undefined;
		onchange: (requirements: Requirement[]) => void;
		onclose: () => void;
	} = $props();

	const groupLabel: Record<BlockGroup, StringKey> = {
		sets: 'groupSets',
		runs: 'groupRuns',
		suitRuns: 'groupSuitRuns',
		flush: 'groupFlush',
		parity: 'groupParity'
	};
	const max = RULESET_LIMITS.requirementsPerLevel.max;

	let customText = $state('');
	let fixedSize = $state(3);
	// svelte-ignore state_referenced_locally
	let fixedValue = $state(deck.minValue);
	let available = $derived(blocksFor(deck));
	let values = $derived(Array.from({ length: deck.maxValue - deck.minValue + 1 }, (_, i) => deck.minValue + i));
	let full = $derived(requirements.length >= max);
	let fixed = $derived(requirements.filter((r) => r.kind === 'set' && r.value !== undefined));
	let custom = $derived(requirements.filter((r) => r.kind === 'custom'));
	let need = $derived(levelCards(requirements));

	function set(r: Requirement, count: number) {
		onchange(setBlockCount(requirements, r, count));
	}

	function toggle(r: Requirement) {
		set(r, blockCount(requirements, r) > 0 ? 0 : 1);
	}

	function addCustom() {
		const text = customText.trim();
		if (text === '' || full) return;
		onchange(addBlock(requirements, { kind: 'custom', text }));
		customText = '';
	}
</script>

{#snippet row(r: Requirement, countable: boolean)}
	{@const n = blockCount(requirements, r)}
	{@const label = describeRequirement(language, r)}
	<div class="row" class:on={n > 0}>
		<button type="button" role="checkbox" aria-checked={n > 0} class="check" disabled={n === 0 && full} onclick={() => toggle(r)}>
			<span class="box" aria-hidden="true"
				>{#if n > 0}<Icon name="check" />{/if}</span
			>
			<span class="label">{label}</span>
		</button>
		{#if countable && n > 0}
			<span class="stepper">
				<button
					type="button"
					class="icon-button"
					onclick={() => set(r, n - 1)}
					disabled={n <= 1}
					aria-label={t(language, 'fewer', { b: label })}>−</button
				>
				<span class="count" aria-hidden="true">{n}×</span>
				<button
					type="button"
					class="icon-button"
					onclick={() => set(r, n + 1)}
					disabled={n >= REQUIREMENT_LIMITS.count.max}
					aria-label={t(language, 'moreOf', { b: label })}>+</button
				>
			</span>
		{/if}
	</div>
{/snippet}

<Sheet {title} {language} {onclose}>
	{#each blockGroups as group (group)}
		{@const shown = available.filter((b) => b.group === group)}
		{#if shown.length}
			<h3>{t(language, groupLabel[group])}</h3>
			<div class="rows">
				{#each shown as block (block.id)}
					{@render row(block.requirement, block.requirement.kind === 'set' || block.requirement.kind === 'run')}
				{/each}
			</div>
		{/if}
	{/each}

	<h3>{t(language, 'fixedValue')} <small>({t(language, 'fixedValueHint')})</small></h3>
	<div class="rows">
		{#each fixed as r (describeRequirement(language, r))}
			{@render row(r, true)}
		{/each}
		<div class="form">
			<select bind:value={fixedSize} aria-label={t(language, 'cardCount', { n: '' }).trim()}>
				{#each [2, 3, 4, 5] as n (n)}<option value={n}>{n}×</option>{/each}
			</select>
			<select bind:value={fixedValue} aria-label={t(language, 'fixedValue')}>
				{#each values as v (v)}<option value={v}>{v}</option>{/each}
			</select>
			<button
				type="button"
				disabled={full}
				onclick={() => onchange(addBlock(requirements, { kind: 'set', size: fixedSize, count: 1, value: fixedValue }))}
				><Icon name="plus" /> {t(language, 'add')}</button
			>
		</div>
	</div>

	<h3>{t(language, 'customBlock')} <small>({t(language, 'customBlockHint')})</small></h3>
	<div class="rows">
		{#each custom as r (r.kind === 'custom' ? r.text : '')}
			{@render row(r, false)}
		{/each}
		<div class="form">
			<input
				type="text"
				maxlength={REQUIREMENT_LIMITS.customText}
				placeholder={t(language, 'customPlaceholder')}
				aria-label={t(language, 'customBlock')}
				bind:value={customText}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						addCustom();
					}
				}}
			/>
			<button type="button" disabled={customText.trim() === '' || full} onclick={addCustom}
				><Icon name="plus" /> {t(language, 'add')}</button
			>
		</div>
	</div>
	{#if full}
		<p class="hint">{t(language, 'blocksFull', { n: max })}</p>
	{/if}

	{#snippet footer()}
		<p class="summary" aria-live="polite">
			{#if requirements.length === 0}
				<span class="muted">{t(language, 'levelEmpty')}</span>
			{:else}
				<strong>{describeLevel(language, requirements)}</strong>
				<small class:warn-text={need > handSize}>{t(language, 'cardsNeeded', { need, hand: handSize })}</small>
			{/if}
		</p>
		<button type="button" class="primary done" onclick={onclose}><Icon name="check" /> {t(language, 'done')}</button>
	{/snippet}
</Sheet>

<style lang="scss">
	h3 {
		font-size: 0.95em;
		margin: 16px 0 6px;

		small {
			font-weight: normal;
			opacity: 0.7;
		}
	}

	.rows {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 4px;
		border: 2px solid var(--border);
		border-radius: var(--sketch-row);
		background: var(--surface);

		&.on {
			border-color: var(--accent);
			background: var(--accent-soft);
		}

		.check {
			flex: 1;
			min-width: 0;
			justify-content: flex-start;
			gap: 10px;
			border: none;
			border-radius: 0;
			box-shadow: none;
			background: none;
			padding: 10px 12px;
			font-family: inherit;
			font-size: max(16px, 1em);
			font-weight: bold;
			text-align: left;

			&:active:not(:disabled) {
				transform: none;
			}
		}

		.box {
			flex: none;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 22px;
			height: 22px;
			border: 2px solid var(--border);
			border-radius: 6px;
			box-sizing: border-box;
			background: var(--surface);
			font-size: 0.8em;
		}

		.label {
			flex: 1;
			min-width: 0;
		}
	}

	.stepper {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding-right: 4px;

		.count {
			min-width: 2em;
			text-align: center;
			font-weight: bold;
		}

		.icon-button {
			font-family: inherit;
			font-weight: bold;
			width: 36px;
			height: 36px;
			justify-content: center;
			padding: 0;
		}
	}

	.form {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 4px 0;

		input {
			flex: 1;
			min-width: 0;
		}
	}

	.hint {
		margin: 12px 0 0;
		font-size: 0.9em;
		opacity: 0.75;
	}

	.summary {
		margin: 0 0 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;

		small {
			opacity: 0.8;
		}

		.muted {
			opacity: 0.7;
		}
	}

	.done {
		width: 100%;
		justify-content: center;
	}
</style>
