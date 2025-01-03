<script lang="ts">
	let { children } = $props();

	function changeLanguage(e: MouseEvent) {
		alert('change language');
		console.log(e);
	}
</script>

<div class="page">
	<nav class="header">
		<a href="/">Level 100!</a>
	</nav>

	<div class="content">
		{@render children()}
	</div>

	<footer class="footer">
		<!-- disclaimer shown here -->
		<a href="/about">About</a>
		<a href="/imprint">Imprint</a>
		<a href="/privacy">Privacy</a>
		<button aria-label="Change Language" onclick={changeLanguage}>
			<i class="fa-solid fa-language"> </i>change language
		</button>
		<button>test</button>
	</footer>
</div>

<style>
	@import './global.scss';
	.page {
		display: grid;
		min-height: calc(100vh - 16px);
		grid-template-columns: auto;
		grid-template-rows: auto 1fr auto;
		margin: 8px;

		.header {
			border: 3px solid green;
			padding: 10px;
			font-size: 2em;
			font-weight: bold;
			text-align: center;

			border-bottom: 1px solid $foreground-accent !important;

			a,
			a:active,
			a:visited,
			a:hover {
				padding: 20px;
				color: $foreground;
				text-decoration: none;
			}
		}

		.content {
		}

		.footer {
			text-align: center;
		}
	}
</style>
