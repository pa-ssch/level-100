<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} – Level 100</title>
</svelte:head>

<section class="error">
	<h2>{page.status}</h2>
	<p>{page.error?.message ?? 'Something went wrong.'}</p>
	<a href={resolve('/')}>Back to start</a>
</section>

<style>
	.error {
		text-align: center;
		padding: 2em;
	}
</style>
