<script lang="ts">
	import { icons, type IconName } from './icons';

	let { name, label }: { name: IconName; label?: string } = $props();
	let icon = $derived(icons[name]);
</script>

<!-- Dekorativ, wenn kein label gesetzt ist; der umgebende Button/Link trägt dann die Beschriftung. -->
<svg class="icon" viewBox={icon.viewBox} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
	<path fill="currentColor" d={icon.d} />
</svg>

<style>
	.icon {
		width: 1em;
		height: 1em;
		vertical-align: -0.125em;
	}
</style>
