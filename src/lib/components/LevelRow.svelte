<script lang="ts">
	import { estimateDifficulty } from '$lib/game/difficulty';
	import type { CardDeck } from '$lib/game/deck';
	import { levelCards } from '$lib/game/requirements';
	import type { Level } from '$lib/game/ruleset';
	import { describeLevel, describeRequirement, t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import DifficultyDots from './DifficultyDots.svelte';
	import Menu, { type MenuItem } from './Menu.svelte';

	let {
		level,
		index,
		deck,
		language,
		editable = false,
		dragging = false,
		menu = [],
		onaddblock,
		onremoveblock,
		onreroll,
		ondragstart,
		ondragmove,
		ondragend
	}: {
		level: Level;
		index: number;
		deck: CardDeck;
		language: string | undefined;
		editable?: boolean;
		dragging?: boolean;
		menu?: MenuItem[];
		onaddblock?: () => void;
		onremoveblock?: (i: number) => void;
		onreroll?: () => void;
		ondragstart?: (e: PointerEvent) => void;
		ondragmove?: (e: PointerEvent) => void;
		ondragend?: (e: PointerEvent) => void;
	} = $props();

	let estimate = $derived(estimateDifficulty(deck, level.handSize, level.requirements));
	let tooMany = $derived(levelCards(level.requirements) > level.handSize);
</script>

<div class="level" class:editable class:dragging aria-label={t(language, 'level', { n: index + 1 })} role="group" data-level-index={index}>
	{#if ondragstart}
		<button
			type="button"
			class="icon-button grip"
			aria-label={t(language, 'dragHandle', { n: index + 1 })}
			title={t(language, 'dragHandle', { n: index + 1 })}
			onpointerdown={(e) => {
				(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
				ondragstart?.(e);
			}}
			onpointermove={ondragmove}
			onpointerup={ondragend}
			onpointercancel={ondragend}
		>
			<Icon name="grip-vertical" />
		</button>
	{/if}
	<span class="n">{index + 1}</span>
	<div class="body">
		{#if editable}
			<div class="chips">
				{#each level.requirements as r, i (i)}
					<button
						type="button"
						class="chip"
						onclick={() => onremoveblock?.(i)}
						aria-label={t(language, 'removeBlock', { b: describeRequirement(language, r) })}
						title={t(language, 'removeBlock', { b: describeRequirement(language, r) })}
					>
						{describeRequirement(language, r)}
						<Icon name="xmark" />
					</button>
				{/each}
				<button type="button" class="chip add" onclick={onaddblock}><Icon name="plus" /> {t(language, 'addBlock')}</button>
			</div>
			{#if level.requirements.length === 0}
				<small class="hint">{t(language, 'levelEmpty')}</small>
			{/if}
		{:else}
			<span class="desc">{describeLevel(language, level.requirements)}</span>
		{/if}
		{#if tooMany}
			<small class="warn-text" role="alert">{t(language, 'tooManyCards')}</small>
		{/if}
	</div>
	<DifficultyDots difficulty={estimate.difficulty} {language} />
	{#if onreroll}
		<button
			type="button"
			class="icon-button"
			onclick={onreroll}
			aria-label={t(language, 'rerollOne', { n: index + 1 })}
			title={t(language, 'rerollOne', { n: index + 1 })}><Icon name="rotate-right" /></button
		>
	{/if}
	{#if menu.length}
		<Menu label={t(language, 'levelMenu', { n: index + 1 })} items={menu} />
	{/if}
</div>

<style lang="scss">
	.level {
		display: flex;
		align-items: center;
		gap: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 10px;
		padding: 8px 6px 8px 10px;
		margin: 6px 0;

		&.dragging {
			border-color: var(--accent);
			box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
		}

		.grip {
			touch-action: none;
			cursor: grab;
			opacity: 0.6;
			padding: 10px 4px;

			&:active {
				cursor: grabbing;
			}
		}

		.n {
			font-weight: bold;
			opacity: 0.6;
			min-width: 1.2em;
		}

		.body {
			flex: 1;
			min-width: 0;
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		.desc {
			font-weight: bold;
		}

		.hint {
			opacity: 0.7;
		}
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.chip {
		border-radius: 999px;
		padding: 4px 10px;
		font-size: 0.9em;
		font-weight: bold;

		&.add {
			border-style: dashed;
			font-weight: normal;
			background: none;
		}
	}
</style>
