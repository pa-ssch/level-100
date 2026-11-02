<script lang="ts">
	import type { Snippet } from 'svelte';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';

	let { title, language, onclose, children }: { title: string; language: string | undefined; onclose: () => void; children: Snippet } =
		$props();
	let dialog: HTMLDialogElement;

	$effect(() => {
		dialog.showModal();
	});
</script>

<dialog bind:this={dialog} class="sheet" {onclose} aria-labelledby="sheet-title">
	<header>
		<h2 id="sheet-title">{title}</h2>
		<button type="button" class="icon-button" onclick={() => dialog.close()} aria-label={t(language, 'close')}><Icon name="xmark" /></button
		>
	</header>
	<div class="body">
		{@render children()}
	</div>
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
		padding: 12px 16px 24px;
		box-sizing: border-box;
		overflow: auto;

		@media (min-width: 600px) {
			margin: auto;
			border-radius: 16px;
			border-bottom: 1px solid var(--border);
		}
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;

		h2 {
			margin: 0;
			font-size: 1.1em;
		}
	}

	.body {
		margin-top: 8px;
	}
</style>
