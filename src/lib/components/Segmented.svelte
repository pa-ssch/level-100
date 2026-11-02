<script lang="ts" generics="T extends string">
	let {
		label,
		options,
		value,
		onchange
	}: { label: string; options: { value: T; label: string; hint?: string }[]; value: T; onchange: (value: T) => void } = $props();
</script>

<div class="seg" role="radiogroup" aria-label={label}>
	{#each options as option (option.value)}
		<button
			type="button"
			role="radio"
			aria-checked={option.value === value}
			class:on={option.value === value}
			onclick={() => onchange(option.value)}
		>
			<strong>{option.label}</strong>
			{#if option.hint}<small>{option.hint}</small>{/if}
		</button>
	{/each}
</div>

<style lang="scss">
	.seg {
		display: flex;
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: hidden;

		button {
			flex: 1;
			flex-direction: column;
			gap: 1px;
			border: none;
			border-radius: 0;
			padding: 10px 4px;
			justify-content: center;

			& + button {
				border-left: 1px solid var(--border);
			}

			&.on {
				background: var(--foreground);
				color: var(--background);
			}

			small {
				font-size: 0.75em;
				opacity: 0.8;
				font-weight: normal;
			}
		}
	}
</style>
