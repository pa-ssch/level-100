<script lang="ts">
	import type { Snippet } from 'svelte';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';

	let {
		title,
		language,
		onclose,
		children,
		footer
	}: { title: string; language: string | undefined; onclose: () => void; children: Snippet; footer?: Snippet } = $props();
	let dialog: HTMLDialogElement;

	$effect(() => {
		dialog.showModal();
	});
</script>

<dialog bind:this={dialog} class="sheet" {onclose} aria-labelledby="sheet-title">
	<!-- Kopf und Fuß bleiben stehen, nur der Inhalt scrollt. -->
	<header>
		<h2 id="sheet-title">{title}</h2>
		<button type="button" class="icon-button" onclick={() => dialog.close()} aria-label={t(language, 'close')}><Icon name="xmark" /></button
		>
	</header>
	<div class="body">
		{@render children()}
	</div>
	{#if footer}
		<footer>{@render footer()}</footer>
	{/if}
</dialog>

<style lang="scss">
	.sheet {
		width: min(100vw, 520px);
		max-width: 100vw;
		max-height: 90vh;
		max-height: 90dvh;
		margin: auto auto 0;
		border-radius: 16px 16px 0 0;
		border-bottom: none;
		box-shadow: none;
		padding: 0;
		box-sizing: border-box;
		overflow: hidden;

		&[open] {
			display: flex;
			flex-direction: column;
		}

		@media (min-width: 600px) {
			margin: auto;
			border-radius: var(--sketch-a);
			border-bottom: 3px solid var(--border);
			box-shadow: 4px 4px 0 var(--border);
		}
	}

	header {
		flex: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 12px 12px 8px 16px;

		h2 {
			margin: 0;
			font-size: 1.1em;
		}
	}

	.body {
		flex: 1 1 auto;
		min-height: 0;
		overflow: auto;
		overscroll-behavior: contain;
		padding: 0 16px 24px;
	}

	footer {
		flex: none;
		padding: 10px 16px 16px;
		border-top: 1px solid var(--border);
		background: var(--surface);
	}
</style>
