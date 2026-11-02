<script lang="ts">
	import { onMount } from 'svelte';
	import { createDecoder } from '$lib/qr';
	import { t } from '$lib/i18n';

	let { language, onscan }: { language: string | undefined; onscan: (text: string) => void } = $props();

	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let error = $state<'unavailable' | 'denied' | null>(null);
	let active = $state(false);

	onMount(() => {
		let stream: MediaStream | null = null;
		let frame = 0;
		let stopped = false;

		(async () => {
			if (!navigator.mediaDevices?.getUserMedia) {
				error = 'unavailable';
				return;
			}
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
					audio: false
				});
			} catch (e) {
				error = e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'denied' : 'unavailable';
				return;
			}
			if (stopped) {
				stream.getTracks().forEach((track) => track.stop());
				return;
			}
			video.srcObject = stream;
			await video.play().catch(() => undefined);
			active = true;
			const decode = await createDecoder();
			const context = canvas.getContext('2d', { willReadFrequently: true });
			let busy = false;
			const tick = async () => {
				if (stopped) return;
				if (!busy && context && video.videoWidth > 0) {
					busy = true;
					// Mittleren Ausschnitt lesen; das reicht für den Code und spart Rechenzeit.
					const size = Math.min(video.videoWidth, video.videoHeight);
					canvas.width = Math.min(size, 640);
					canvas.height = canvas.width;
					const sx = (video.videoWidth - size) / 2;
					const sy = (video.videoHeight - size) / 2;
					context.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
					const text = await decode(context.getImageData(0, 0, canvas.width, canvas.height)).catch(() => null);
					busy = false;
					if (text) {
						onscan(text);
						return;
					}
				}
				frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		})();

		return () => {
			stopped = true;
			cancelAnimationFrame(frame);
			stream?.getTracks().forEach((track) => track.stop());
		};
	});
</script>

<div class="scanner" class:active>
	<video bind:this={video} playsinline muted aria-label={t(language, 'scanTitle')}></video>
	<canvas bind:this={canvas} hidden></canvas>
	{#if error}
		<p class="warn-text" role="alert">{t(language, error === 'denied' ? 'scanDenied' : 'scanUnavailable')}</p>
	{:else}
		<p class="hint">{t(language, 'scanHint')}</p>
	{/if}
</div>

<style lang="scss">
	.scanner {
		display: flex;
		flex-direction: column;
		gap: 6px;
		align-items: center;

		video {
			width: 100%;
			max-width: 360px;
			aspect-ratio: 1;
			object-fit: cover;
			border-radius: 12px;
			background: #000;
			display: none;
		}

		&.active video {
			display: block;
		}

		.hint {
			margin: 0;
			opacity: 0.8;
			font-size: 0.9em;
			text-align: center;
		}
	}
</style>
