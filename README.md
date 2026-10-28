# Level 100

Regelsätze für Kartenspiele der „Stufen“-Art selbst zusammenstellen, per Link oder QR-Code mit Freunden teilen und
gemeinsam spielen. Level 100 ist eine rein clientseitige Web-App: kein Backend, keine Konten, keine Cookies, kein Tracking.

Live: [lvl100.de](https://lvl100.de) (GitHub Pages)

Level 100 ist ein eigenständiges Projekt und steht in keiner Verbindung zu „Phase 10“, „Stufe 10“, Contract Rummy oder
deren Rechteinhabern.

## Entwicklung

Voraussetzung: Node 22 (siehe `.nvmrc`) und Yarn 4 (`corepack enable`).

```bash
yarn install
yarn dev        # Dev-Server mit Hot Reload
yarn check      # Typen und Svelte-Diagnose
yarn lint       # Prettier und ESLint
yarn test       # Unit-Tests (Vitest)
yarn build      # Statischer Export nach build/
yarn test:e2e   # Playwright gegen build/ (vorher yarn build; einmalig yarn playwright install)
yarn preview    # Build lokal ansehen
```

## Aufbau

- `src/lib/game/` – Domänenmodell: Deck, Level-Anforderungen, Löser (nur für die Schwierigkeitsschätzung per Simulation), Regelsatz mit
  Validierung, Share-Link-Kodierung (deflate + base64url), Spielstand, Local Storage; Tests daneben als `*.test.ts`
- `src/lib/i18n.ts` – Übersetzungen und lesbare Level-Beschreibungen; `src/lib/components/` – Level-Editor, Teilen-Dialog (QR)
- `src/routes/[[language=language]]/` – Seiten je Sprache (`de-DE`, `en-US`): `start`, `prepare`, `play`
- `src/routes/about|imprint|privacy` – Disclaimer, Impressum, Datenschutz
- `e2e/` – Playwright-Tests gegen den statischen Build: Rendering, Barrierefreiheit (axe), CSP, keine fremden Requests, Impressum
- `test/` – Tests für die Konfiguration (CSP-Hash)
- `static/` – `CNAME`, `robots.txt`, Favicon

Local Storage: `level100.rulesets` (Verlauf/Favoriten), `level100.game` (laufendes Spiel), `level100.language`.

Alle Seiten werden beim Build vorgerendert (`@sveltejs/adapter-static`). Die Content-Security-Policy steht als Meta-Tag in jeder
Seite (`kit.csp` in `svelte.config.js`), ohne `unsafe-inline`; Icons sind Inline-SVG (Font Awesome Free, CC BY 4.0). Spielzustand und geteilte Regelsätze leben
ausschließlich in der URL und im `localStorage` des Browsers.

## Deployment

Jeder Push auf `main` baut und veröffentlicht die Seite per GitHub Actions auf GitHub Pages (siehe `.github/workflows/`).
Der Fahrplan bis zur Veröffentlichung steht in [PLAN.md](PLAN.md).

## Lizenz

[MIT](LICENSE)
