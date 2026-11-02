<script lang="ts">
	import { blocksFor } from '$lib/game/blocks';
	import type { CardDeck } from '$lib/game/deck';
	import { REQUIREMENT_LIMITS, type Requirement } from '$lib/game/requirements';
	import { describeRequirement, t } from '$lib/i18n';
	import Sheet from './Sheet.svelte';

	let {
		deck,
		language,
		onpick,
		onclose
	}: { deck: CardDeck; language: string | undefined; onpick: (r: Requirement) => void; onclose: () => void } = $props();

	let showAll = $state(false);
	let customText = $state('');
	let fixedSize = $state(3);
	// svelte-ignore state_referenced_locally
	let fixedValue = $state(deck.minValue);
	let available = $derived(blocksFor(deck));
	let shown = $derived(showAll ? available : available.filter((b) => b.common));
	let values = $derived(Array.from({ length: deck.maxValue - deck.minValue + 1 }, (_, i) => deck.minValue + i));

	function pick(r: Requirement) {
		onpick(r);
		onclose();
	}
</script>

<Sheet title={t(language, 'blockPick')} {language} {onclose}>
	<div class="grid">
		{#each shown as block (block.id)}
			<button type="button" onclick={() => pick(block.requirement)}>{describeRequirement(language, block.requirement)}</button>
		{/each}
	</div>
	<button type="button" class="secondary toggle" onclick={() => (showAll = !showAll)} aria-expanded={showAll}>
		{showAll ? t(language, 'fewerBlocks') : t(language, 'moreBlocks')}
	</button>

	{#if showAll}
		<div class="special">
			<label>
				{t(language, 'fixedValue')} <small>({t(language, 'fixedValueHint')})</small>
				<span class="row">
					<select bind:value={fixedSize} aria-label={t(language, 'cardCount', { n: '' }).trim()}>
						{#each [2, 3, 4, 5] as n (n)}<option value={n}>{n}×</option>{/each}
					</select>
					<select bind:value={fixedValue} aria-label={t(language, 'fixedValue')}>
						{#each values as v (v)}<option value={v}>{v}</option>{/each}
					</select>
					<button type="button" onclick={() => pick({ kind: 'set', size: fixedSize, count: 1, value: fixedValue })}
						>{t(language, 'addBlock')}</button
					>
				</span>
			</label>
			<label>
				{t(language, 'customBlock')}
				<span class="row">
					<input
						type="text"
						maxlength={REQUIREMENT_LIMITS.customText}
						placeholder={t(language, 'customPlaceholder')}
						bind:value={customText}
					/>
					<button type="button" disabled={customText.trim() === ''} onclick={() => pick({ kind: 'custom', text: customText.trim() })}
						>{t(language, 'addBlock')}</button
					>
				</span>
			</label>
		</div>
	{/if}
</Sheet>

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 8px;

		button {
			justify-content: center;
			padding: 14px 8px;
			font-weight: bold;
			text-align: center;
		}
	}

	.toggle {
		margin-top: 12px;
		width: 100%;
		justify-content: center;
	}

	.special {
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;

		label {
			display: flex;
			flex-direction: column;
			gap: 4px;
			font-size: 0.9em;
		}

		.row {
			display: flex;
			gap: 8px;
			align-items: center;

			input {
				flex: 1;
				min-width: 0;
			}
		}
	}
</style>
