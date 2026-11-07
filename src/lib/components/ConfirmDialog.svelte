<script lang="ts">
	import Sheet from './Sheet.svelte';

	let {
		title,
		message,
		confirmLabel,
		cancelLabel,
		language,
		onconfirm,
		onclose
	}: {
		title: string;
		message: string;
		confirmLabel: string;
		cancelLabel: string;
		language: string | undefined;
		onconfirm: () => void;
		onclose: () => void;
	} = $props();
</script>

<Sheet {title} {language} {onclose}>
	<p>{message}</p>
	<div class="actions">
		<button
			type="button"
			class="primary"
			onclick={() => {
				// Erst die Aktion, dann schließen: das Schließen entfernt diese Komponente samt ihrer Props.
				onconfirm();
				onclose();
			}}>{confirmLabel}</button
		>
		<button type="button" onclick={onclose}>{cancelLabel}</button>
	</div>
</Sheet>

<style lang="scss">
	p {
		margin: 0 0 16px;
		font-size: 1.05em;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 10px;

		button {
			justify-content: center;
			padding: 14px;
		}
	}
</style>
