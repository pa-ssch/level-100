<script lang="ts">
	let name = 'Svelte';
	let src = 'https://www.nyan.cat/cats/xmas.gif';
	import Nester from './Nester.svelte';
	let count = $state(0);
	$inspect(count);

	function increment() {
		count += 1;
	}

	let numbers = $state([1]);
	$inspect(numbers).with(console.trace);
	let total = $derived(numbers.reduce((t, n) => t + n, 0));
	function addNumber() {
		numbers.push(numbers.length + 1);
	}
</script>

<h1>Hello {name.toUpperCase()}!</h1>
<img {src} alt="Present Nyan Cat" />
<Nester />
<p>This is a paragraph.</p>
<button onclick={increment}>
	Clicked {count}
	{count === 1 ? 'time' : 'times'}
</button>

<p>{numbers.join(' + ')} = {total}</p>
<button onclick={addNumber}> Add a number </button>

<!-- base page of level 100 -->

<!-- next is effect -->

<!-- // standard hatml + js / ts mit entwicklungsserver -->

<style>
	p {
		color: red;
		font-size: 1.5em;
	}
</style>
