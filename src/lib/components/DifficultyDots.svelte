<script lang="ts">
	import { t } from '$lib/i18n';

	let { difficulty, language }: { difficulty: number | undefined; language: string | undefined } = $props();
	let filled = $derived(difficulty === undefined ? 0 : Math.max(1, Math.ceil(difficulty / 2)));
	let label = $derived(difficulty === undefined ? t(language, 'difficultyUnknown') : t(language, 'difficulty', { d: difficulty }));
</script>

<span
	class="dots"
	class:hard={difficulty !== undefined && difficulty >= 8}
	class:unknown={difficulty === undefined}
	role="img"
	aria-label={label}
	title={label}
>
	{#each [1, 2, 3, 4, 5] as i (i)}
		<i class:on={i <= filled}></i>
	{/each}
</span>

<style lang="scss">
	.dots {
		display: inline-flex;
		gap: 3px;
		vertical-align: middle;

		i {
			width: 7px;
			height: 7px;
			border-radius: 50%;
			border: 1px solid var(--accent);
			box-sizing: border-box;

			&.on {
				background: var(--accent);
			}
		}

		&.hard i {
			border-color: var(--warn);

			&.on {
				background: var(--warn);
			}
		}

		&.unknown i {
			border-color: var(--border);
		}
	}
</style>
