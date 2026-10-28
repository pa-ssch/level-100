<script lang="ts">
	import { t } from '$lib/i18n';
	import type { DifficultyEstimate } from '$lib/game/difficulty';

	let { estimate, language }: { estimate: DifficultyEstimate; language: string | undefined } = $props();
	let percent = $derived(Math.round(estimate.probability * 1000) / 10);
</script>

{#if estimate.difficulty === undefined}
	<span class="difficulty unknown">{t(language, 'difficultyUnknown')}</span>
{:else}
	<span class="difficulty" title={t(language, 'difficultyHint', { p: percent })} data-level={estimate.difficulty}>
		{t(language, 'difficulty')}: <strong>{estimate.difficulty}</strong>/10
	</span>
{/if}

<style lang="scss">
	.difficulty {
		display: inline-block;
		border: 1px solid currentColor;
		border-radius: 999px;
		padding: 2px 10px;
		font-size: 0.85em;
		white-space: nowrap;
	}

	.unknown {
		opacity: 0.7;
	}
</style>
