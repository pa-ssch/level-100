<script lang="ts">
	import { REQUIREMENT_LIMITS, defaultRequirement, requirementKinds, type Requirement, type RequirementKind } from '$lib/game/requirements';
	import type { CardDeck } from '$lib/game/deck';
	import { t, type StringKey } from '$lib/i18n';
	import Icon from '$lib/Icon.svelte';

	let {
		requirement,
		deck,
		language,
		id,
		onchange,
		onremove
	}: {
		requirement: Requirement;
		deck: CardDeck;
		language: string | undefined;
		id: string;
		onchange: (r: Requirement) => void;
		onremove: () => void;
	} = $props();

	const kindLabels: Record<RequirementKind, StringKey> = {
		set: 'kindSet',
		run: 'kindRun',
		flush: 'kindFlush',
		parity: 'kindParity',
		custom: 'kindCustom'
	};
	const { size, count } = REQUIREMENT_LIMITS;

	function setKind(kind: RequirementKind) {
		if (kind !== requirement.kind) onchange(defaultRequirement(kind));
	}

	function update(patch: Record<string, unknown>) {
		onchange({ ...requirement, ...patch } as Requirement);
	}

	function num(event: Event, min: number, max: number): number {
		const value = Number((event.target as HTMLInputElement).value);
		return Number.isInteger(value) ? Math.min(max, Math.max(min, value)) : min;
	}
</script>

<div class="requirement">
	<label>
		<span class="visually-hidden">{t(language, 'requirements')}</span>
		<select value={requirement.kind} onchange={(e) => setKind((e.target as HTMLSelectElement).value as RequirementKind)}>
			{#each requirementKinds as kind (kind)}
				<option value={kind}>{t(language, kindLabels[kind])}</option>
			{/each}
		</select>
	</label>

	{#if requirement.kind === 'set'}
		<label>
			{t(language, 'size')}
			<input
				type="number"
				min={size.min}
				max={size.max}
				value={requirement.size}
				onchange={(e) => update({ size: num(e, size.min, size.max) })}
			/>
		</label>
		<label>
			{t(language, 'count')}
			<input
				type="number"
				min={count.min}
				max={count.max}
				value={requirement.count}
				onchange={(e) => update({ count: num(e, count.min, count.max) })}
			/>
		</label>
		<label>
			{t(language, 'fixedValue')}
			<select
				value={requirement.value === undefined ? '' : String(requirement.value)}
				onchange={(e) => {
					const v = (e.target as HTMLSelectElement).value;
					const next = { ...requirement } as Requirement & { value?: number };
					if (v === '') delete next.value;
					else next.value = Number(v);
					onchange(next);
				}}
			>
				<option value="">{t(language, 'anyValue')}</option>
				{#each Array.from({ length: deck.maxValue - deck.minValue + 1 }, (_, i) => deck.minValue + i) as v (v)}
					<option value={String(v)}>{v}</option>
				{/each}
			</select>
		</label>
	{:else if requirement.kind === 'run'}
		<label>
			{t(language, 'length')}
			<input
				type="number"
				min={size.min}
				max={size.max}
				value={requirement.length}
				onchange={(e) => update({ length: num(e, size.min, size.max) })}
			/>
		</label>
		<label>
			{t(language, 'count')}
			<input
				type="number"
				min={count.min}
				max={count.max}
				value={requirement.count}
				onchange={(e) => update({ count: num(e, count.min, count.max) })}
			/>
		</label>
		<label class="checkbox">
			<input
				type="checkbox"
				checked={requirement.sameSuit}
				onchange={(e) => update({ sameSuit: (e.target as HTMLInputElement).checked })}
			/>
			{t(language, 'sameSuit')}
		</label>
	{:else if requirement.kind === 'flush'}
		<label>
			{t(language, 'size')}
			<input
				type="number"
				min={size.min}
				max={size.max}
				value={requirement.size}
				onchange={(e) => update({ size: num(e, size.min, size.max) })}
			/>
		</label>
	{:else if requirement.kind === 'parity'}
		<label>
			{t(language, 'size')}
			<input
				type="number"
				min={size.min}
				max={size.max}
				value={requirement.size}
				onchange={(e) => update({ size: num(e, size.min, size.max) })}
			/>
		</label>
		<label>
			<span class="visually-hidden">{t(language, 'kindParity')}</span>
			<select value={requirement.parity} onchange={(e) => update({ parity: (e.target as HTMLSelectElement).value })}>
				<option value="even">{t(language, 'even')}</option>
				<option value="odd">{t(language, 'odd')}</option>
			</select>
		</label>
	{:else}
		<label class="grow">
			{t(language, 'customText')}
			<input
				type="text"
				maxlength={REQUIREMENT_LIMITS.customText}
				placeholder={t(language, 'customPlaceholder')}
				value={requirement.text}
				oninput={(e) => update({ text: (e.target as HTMLInputElement).value })}
			/>
		</label>
	{/if}

	<button
		type="button"
		class="icon-button"
		onclick={onremove}
		aria-label={t(language, 'removeRequirement')}
		title={t(language, 'removeRequirement')}
		data-testid="remove-requirement-{id}"
	>
		<Icon name="xmark" />
	</button>
</div>

<style lang="scss">
	.requirement {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 12px;
		align-items: end;
		padding: 8px 0;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 0.85em;
	}

	.checkbox {
		flex-direction: row;
		align-items: center;
		padding-bottom: 6px;
	}

	.grow {
		flex: 1 1 200px;
	}

	input[type='number'] {
		width: 4.5em;
	}
</style>
