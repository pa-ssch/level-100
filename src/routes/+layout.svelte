<script lang="ts">
	let { children } = $props();

	function changeLanguage(e: MouseEvent) {
		alert('change language');
		console.log(e);
	}
</script>

<nav>
	<a href="/">Home</a>
	<a href="/play">Play</a>
	<a href="/prepare">Prepare</a>

	<button aria-label="Change Language" onclick={changeLanguage}>
		<i class="fa-solid fa-language"> </i>
	</button>
</nav>

{@render children()}

<footer>
	<!-- disclaimer shown here -->
	<a href="/about">About</a>
	<a href="/imprint">Imprint</a>
	<a href="/privacy">Privacy</a>
</footer>

<style>
	@import './global.scss';
</style>
