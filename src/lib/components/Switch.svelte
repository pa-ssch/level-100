<script lang="ts">
	let {
		checked,
		onLabel,
		offLabel,
		onchange,
		id
	}: { checked: boolean; onLabel: string; offLabel: string; onchange: (checked: boolean) => void; id: string } = $props();
</script>

<label class="switch" for={id}>
	<input {id} type="checkbox" role="switch" {checked} onchange={(e) => onchange((e.target as HTMLInputElement).checked)} />
	<span class="track" aria-hidden="true"><span class="knob"></span></span>
	<span class="text">{checked ? onLabel : offLabel}</span>
</label>

<style lang="scss">
	.switch {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		padding: 8px 0;

		position: relative;

		/* Unsichtbar, aber über dem ganzen Schalter: Klicks und Taps treffen immer das echte Eingabefeld. */
		input {
			position: absolute;
			inset: 0;
			opacity: 0;
			margin: 0;
			width: 100%;
			height: 100%;
			cursor: pointer;
			z-index: 1;
		}

		.track {
			width: 42px;
			height: 24px;
			border-radius: 12px;
			background: var(--border);
			position: relative;
			transition: background 0.15s;
			flex: none;
		}

		.knob {
			position: absolute;
			top: 3px;
			left: 3px;
			width: 18px;
			height: 18px;
			border-radius: 50%;
			background: var(--surface);
			transition: transform 0.15s;
		}

		input:checked + .track {
			background: var(--accent);
		}

		input:checked + .track .knob {
			transform: translateX(18px);
		}

		input:focus-visible + .track {
			outline: 2px solid var(--foreground);
			outline-offset: 2px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.track,
		.knob {
			transition: none;
		}
	}
</style>
