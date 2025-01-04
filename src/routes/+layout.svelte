<script lang="ts">
	let { children } = $props();

	function changeLanguage(e: MouseEvent) {
		alert('change language');
		console.log(e);
	}
</script>

<div class="page">
	<nav class="header">
		<a class="noselect" href="/">Level 100!</a>
		<!-- Wenn ich bei play oder prepare bin gibts oben nen zurück knopf. Header ist wie bei youtube music.  -->
	</nav>

	<div class="content">
		{@render children()}
	</div>

	<footer class="footer">
		<!-- disclaimer shown here -->
		<div class="left">
			<a href="/about">About</a>
			<a href="/imprint">Imprint</a>
			<a href="/privacy">Privacy</a>
		</div>
		<div class="right">
			<button aria-label="Change Language" onclick={changeLanguage}>
				<i class="fa-solid fa-language"> </i>change language
			</button>
			<button>test</button>
			<input type="button" value="kljkjl" />
		</div>
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
		}

		.footer {
			text-align: center;
			font-size: 0.75em;
			display: grid;
			justify-items: center;
			align-items: center;
			margin: 0px 50px;
			grid-template-columns: 1fr, 1fr;
			grid-template-areas: 'left right';
			.left,
			.right {
				display: flex;
				flex-direction: column;

				> * {
					margin: 10px;
				}
			}

			.left {
				grid-area: left;
			}

			.right {
				grid-area: right;
			}
		}
	}
</style>
