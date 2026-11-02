<script lang="ts">
	import { goto } from '$app/navigation';
	import { href } from '$lib/links';
	import { t } from '$lib/i18n';
	import Sheet from './Sheet.svelte';

	let { language, onclose }: { language: string | undefined; onclose: () => void } = $props();
	let link = $state('');
	let invalid = $state(false);

	function open(event: Event) {
		event.preventDefault();
		try {
			const url = new URL(link.trim());
			const r = url.searchParams.get('r');
			if (!r) throw new Error('no payload');
			onclose();
			goto(href('/[[language=language]]/play', language, { r }));
		} catch {
			invalid = true;
		}
	}
</script>

<Sheet title={t(language, 'joinTitle')} {language} {onclose}>
	<form onsubmit={open}>
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
