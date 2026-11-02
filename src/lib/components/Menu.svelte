<script lang="ts">
	import Icon from '$lib/Icon.svelte';

	export interface MenuItem {
		label: string;
		onselect: () => void;
		danger?: boolean;
		disabled?: boolean;
	}

	let { label, items }: { label: string; items: MenuItem[] } = $props();
	let open = $state(false);
	let root: HTMLDivElement;

	function toggle() {
		open = !open;
	}

	function select(item: MenuItem) {
		open = false;
		item.onselect();
	}

	$effect(() => {
		if (!open) return;
		const onPointer = (e: PointerEvent) => {
			if (!root.contains(e.target as Node)) open = false;
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') open = false;
		};
		document.addEventListener('pointerdown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	});
</script>

<div class="menu" bind:this={root}>
	<button type="button" class="icon-button" aria-label={label} title={label} aria-haspopup="menu" aria-expanded={open} onclick={toggle}>
		<Icon name="ellipsis-vertical" />
	</button>
	{#if open}
		<div class="list" role="menu" aria-label={label}>
			{#each items as item (item.label)}
				<button type="button" role="menuitem" class:danger={item.danger} disabled={item.disabled} onclick={() => select(item)}
					>{item.label}</button
				>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.menu {
		position: relative;
		display: inline-block;
	}

	.list {
		position: absolute;
		right: 0;
		top: 100%;
		z-index: 5;
		min-width: 160px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
		padding: 4px 0;
		display: flex;
		flex-direction: column;

		button {
			border: none;
			border-radius: 0;
			background: none;
			text-align: left;
			padding: 10px 16px;
			width: 100%;

			&:hover:not(:disabled) {
				background: var(--background);
			}

			&.danger {
				color: var(--warn);
				border-top: 1px solid var(--border);
			}
		}
	}
</style>
