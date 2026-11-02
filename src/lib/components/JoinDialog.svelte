<script lang="ts">
	import { goto } from '$app/navigation';
	import { href } from '$lib/links';
	import { payloadFromScan } from '$lib/qr';
	import { t } from '$lib/i18n';
	import QrScanner from './QrScanner.svelte';
	import Sheet from './Sheet.svelte';

	let { language, onclose }: { language: string | undefined; onclose: () => void } = $props();
	let link = $state('');
	let invalid = $state(false);
	let done = false;

	function openPayload(r: string) {
		if (done) return;
		done = true;
		onclose();
		goto(href('/[[language=language]]/play', language, { r }));
	}

	function scanned(text: string) {
		const r = payloadFromScan(text);
		if (r) openPayload(r);
		else invalid = true;
	}

	function submit(event: Event) {
		event.preventDefault();
		const r = payloadFromScan(link.trim());
		if (r) openPayload(r);
		else invalid = true;
	}
</script>

<Sheet title={t(language, 'joinTitle')} {language} {onclose}>
	<QrScanner {language} onscan={scanned} />
	<form onsubmit={submit}>
		<label>
			{t(language, 'joinPaste')}
			<input
				type="url"
				required
				placeholder="https://lvl100.de/…"
				bind:value={link}
				oninput={() => (invalid = false)}
				aria-invalid={invalid}
			/>
		</label>
		{#if invalid}
			<p class="warn-text" role="alert">{t(language, 'joinInvalid')}</p>
		{/if}
		<button type="submit" class="primary">{t(language, 'joinOpen')}</button>
	</form>
</Sheet>

<style lang="scss">
	form {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 14px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	input {
		width: 100%;
		box-sizing: border-box;
	}
</style>
