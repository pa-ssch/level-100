<script lang="ts">
	import QRCode from 'qrcode';
	import { t } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';
	import Sheet from './Sheet.svelte';

	let { url, language, onclose }: { url: string; language: string | undefined; onclose: () => void } = $props();

	let qr = $state<string | null>(null);
	let showQr = $state(false);
	let copied = $state(false);
	let canShare = $derived(typeof navigator !== 'undefined' && typeof navigator.share === 'function');

	async function toggleQr() {
		showQr = !showQr;
		if (showQr && qr === null) {
			try {
				qr = await QRCode.toDataURL(url, { margin: 1, width: 360, errorCorrectionLevel: 'M' });
			} catch {
				qr = null;
			}
		}
	}

	async function send() {
		if (canShare) {
			try {
				await navigator.share({ title: 'Level 100', url });
				return;
			} catch {
				// abgebrochen oder nicht möglich: Link kopieren
			}
		}
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Zwischenablage nicht verfügbar: der Link steht zum manuellen Kopieren im Textfeld
		}
	}
</script>

<Sheet title={t(language, 'inviteTitle')} {language} {onclose}>
	<p class="hint">{t(language, 'inviteHint')}</p>
	<div class="options">
		<button type="button" class:primary={!showQr} onclick={toggleQr} aria-expanded={showQr}
			><Icon name="qrcode" /> {t(language, 'showQr')}</button
		>
		<button type="button" onclick={send}><Icon name="paper-plane" /> {copied ? t(language, 'copied') : t(language, 'sendLink')}</button>
	</div>
	{#if showQr && qr}
		<img class="qr" src={qr} alt={t(language, 'qrAlt')} width="360" height="360" />
	{/if}
	<label class="link">
		<span class="visually-hidden">Link</span>
		<input type="text" readonly value={url} onfocus={(e) => (e.target as HTMLInputElement).select()} />
	</label>
</Sheet>

<style lang="scss">
	.hint {
		margin: 0 0 12px;
		opacity: 0.8;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 8px;

		button {
			justify-content: center;
			padding: 14px;
			font-weight: bold;
		}
	}

	.qr {
		display: block;
		margin: 12px auto 0;
		width: min(100%, 360px);
		height: auto;
		border-radius: 8px;
		background: #fff;
	}

	.link {
		display: block;
		margin-top: 12px;

		input {
			width: 100%;
			box-sizing: border-box;
			opacity: 0.8;
		}
	}
</style>
