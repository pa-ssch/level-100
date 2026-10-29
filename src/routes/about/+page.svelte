<script lang="ts">
	import { resolve } from '$app/paths';
	import Seo from '$lib/components/Seo.svelte';
</script>

<Seo
	title="About"
	description="Level 100 lets you create your own rulesets for level-based card games, share them as a link or QR code and track scores. Runs entirely in your browser."
/>

<article class="legal">
	<section lang="en">
		<h1>About Level 100</h1>
		<p>
			Level 100 is a free companion app for level-based rummy-style card games. You put together your own ruleset (deck, hand size, the
			levels that have to be completed), share it with your friends as a link or QR code and keep track of everyone's level and score while
			you play with a real deck of cards.
		</p>
		<p>
			Everything runs in your browser. There is no server, no account and no tracking; rulesets live in the link itself and in your
			browser's local storage. The source code is published under the MIT licence on
			<a href="https://github.com/pa-ssch/level-100" rel="noopener">GitHub</a>.
		</p>
		<h2>Disclaimer</h2>
		<p>
			Level 100 is an independent project and is not affiliated with, endorsed by or connected to “Phase 10”, “Stufe 10”, Contract Rummy,
			Twist or similar games and their rights holders. It uses none of their trademarks, artwork, texts or rulebooks; game names are
			mentioned only to make this distinction clear and belong to their respective owners.
		</p>
	</section>

	<section lang="de">
		<h1>Über Level 100</h1>
		<p>
			Level 100 ist eine kostenlose Begleit-App für Kartenspiele mit Stufen. Du stellst deinen eigenen Regelsatz zusammen (Kartendeck,
			Handkarten, die zu erfüllenden Level), teilst ihn als Link oder QR-Code mit deinen Freunden und behältst beim Spielen mit echten
			Karten Level und Punkte aller Mitspieler im Blick.
		</p>
		<p>
			Alles läuft in deinem Browser. Es gibt keinen Server, kein Konto und kein Tracking; Regelsätze stecken im Link selbst und im Local
			Storage deines Browsers. Der Quelltext ist unter der MIT-Lizenz auf
			<a href="https://github.com/pa-ssch/level-100" rel="noopener">GitHub</a> veröffentlicht.
		</p>
		<h2>Haftungsausschluss</h2>
		<p>
			Level 100 ist ein eigenständiges Projekt und steht in keiner Verbindung zu „Phase 10“, „Stufe 10“, Contract Rummy, Twist oder
			ähnlichen Spielen und deren Rechteinhabern. Es verwendet keine geschützten Marken, Grafiken, Texte oder Regelwerke; Spielenamen werden
			nur zur Abgrenzung genannt und gehören den jeweiligen Inhabern. Details stehen im
			<a href={resolve('/imprint')}>Impressum</a>.
		</p>
	</section>

	<p class="back"><a href={resolve('/')}>Back to the game · Zurück zum Spiel</a></p>
</article>
