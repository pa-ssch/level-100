<script lang="ts">
	import QRCode from 'qrcode';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';

	let { url, language, onclose }: { url: string; language: string | undefined; onclose: () => void } = $props();

	let qr = $state<string | null>(null);
	let copied = $state(false);
	let dialog: HTMLDialogElement;

	$effect(() => {
		dialog.showModal();
		QRCode.toDataURL(url, { margin: 1, width: 320, errorCorrectionLevel: 'M' })
			.then((data) => (qr = data))
			.catch(() => (qr = null));
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Zwischenablage nicht verfügbar: der Link steht zum manuellen Kopieren im Textfeld.
		}
	}
</script>

<dialog bind:this={dialog} {onclose} aria-labelledby="share-title">
	<h2 id="share-title">{t(language, 'shareTitle')}</h2>
	<p>{t(language, 'shareHint')}</p>
	{#if qr}
		<img class="qr" src={qr} alt={t(language, 'qrAlt')} width="320" height="320" />
	{/if}
	<label>
		<span class="visually-hidden">Link</span>
		<input type="text" readonly value={url} onfocus={(e) => (e.target as HTMLInputElement).select()} />
	</label>
	<div class="actions">
		<button type="button" onclick={copy}><Icon name="share-nodes" /> {copied ? t(language, 'copied') : t(language, 'copyLink')}</button>
		<button type="button" class="secondary" onclick={() => dialog.close()}>{t(language, 'close')}</button>
	</div>
</dialog>

<style lang="scss">
	dialog {
		max-width: min(90vw, 420px);
		border-radius: 12px;
		text-align: center;
	}

	.qr {
		display: block;
		margin: 12px auto;
		max-width: 100%;
		height: auto;
		border-radius: 8px;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		font-size: 0.8em;
	}

	.actions {
		display: flex;
		gap: 8px;
		justify-content: center;
		margin-top: 12px;
	}
</style>
