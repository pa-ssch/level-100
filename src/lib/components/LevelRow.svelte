<script lang="ts">
	import { levelProblem } from '#lib/game/blocks.ts';
	import { estimateDifficulty } from '#lib/game/difficulty.ts';
	import type { CardDeck } from '#lib/game/deck.ts';
	import type { Level } from '#lib/game/ruleset.ts';
	import { describeLevel, t } from '#lib/i18n.ts';
	import Icon from '#lib/Icon.svelte';
	import DifficultyDots from './DifficultyDots.svelte';
	import Menu, { type MenuItem } from './Menu.svelte';

	let {
		level,
		index,
		deck,
		language,
		numbered = true,
		editable = false,
		dragging = false,
		menu = [],
		onedit,
		onreroll,
		ondragstart,
		ondragmove,
		ondragend,
		onmove
	}: {
		level: Level;
		index: number;
		deck: CardDeck;
		language: string | undefined;
		/** Bei freier Reihenfolge haben die Level keine Nummer. */
		numbered?: boolean;
		editable?: boolean;
		dragging?: boolean;
		menu?: MenuItem[];
		onedit?: () => void;
		onreroll?: () => void;
		ondragstart?: (e: PointerEvent) => void;
		ondragmove?: (e: PointerEvent) => void;
		ondragend?: (e: PointerEvent) => void;
		/** Tastatur-Alternative zum Ziehen: eine Position nach oben (-1) oder unten (+1). */
		onmove?: (delta: -1 | 1) => void;
	} = $props();

	let estimate = $derived(estimateDifficulty(deck, level.handSize, level.requirements));
	let problem = $derived(levelProblem(deck, level.handSize, level.requirements));
	let empty = $derived(level.requirements.length === 0);
</script>

<div
	class="level"
	class:editable
	class:dragging
	class:invalid={problem !== null}
	aria-label={t(language, 'level', { n: index + 1 })}
	role="group"
	data-level-index={index}
>
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
			onkeydown={(e) => {
				if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
				e.preventDefault();
				onmove?.(e.key === 'ArrowUp' ? -1 : 1);
			}}
		>
			<Icon name="grip-vertical" />
		</button>
	{/if}
	{#if numbered}
		<span class="n">{index + 1}</span>
	{/if}
	<div class="body">
		{#if editable}
			<!-- Die Bausteine werden nur im Blatt geändert; die Zeile öffnet es. -->
			<button type="button" class="pick" class:empty onclick={onedit} title={t(language, 'editBlocks')}>
				{#if empty}
					<Icon name="plus" /> {t(language, 'blockPick')}
				{:else}
					<span class="desc">{describeLevel(language, level.requirements)}</span>
					<Icon name="pen" />
				{/if}
			</button>
		{:else}
			<span class="desc">{describeLevel(language, level.requirements)}</span>
		{/if}
		{#if problem}
			<small class="warn-text" role="alert">{t(language, problem)}</small>
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
		border: 2px solid var(--border);
		background: var(--surface);
		border-radius: var(--sketch-row);
		padding: 8px 6px 8px 10px;
		margin: 6px 0;

		&.dragging {
			border-color: var(--accent);
			box-shadow: 4px 4px 0 var(--border);
		}

		&.invalid {
			border-style: dashed;
			border-color: var(--warn);
			background: repeating-linear-gradient(-45deg, var(--surface) 0 10px, var(--accent-soft) 10px 12px);
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
	}

	.pick {
		justify-content: space-between;
		gap: 8px;
		width: 100%;
		border: none;
		border-radius: 0;
		box-shadow: none;
		background: none;
		padding: 4px 0;
		font-family: inherit;
		font-size: max(16px, 1em);
		text-align: left;

		&:active:not(:disabled) {
			transform: none;
		}

		&:hover:not(:disabled) {
			background: none;
			text-decoration: underline;
		}

		&.empty {
			justify-content: flex-start;
			font-family: var(--font-hand);
			font-size: max(16px, 1.1em);
			opacity: 0.8;
		}

		.desc {
			flex: 1;
			min-width: 0;
		}
	}
</style>
