# Level 100 – Plan: Ziele und Todos bis zur Veröffentlichung

Stand: 28.10.2026 (Phase 0 bis 5 im Kern umgesetzt und deployt; DNS für lvl100.de offen; Phase 6 Features als Nächstes). Erstellt aus einer Analyse des Repos, der ToDo.txt und der Referenz-Repos
[pa-ssch/one-clue](https://github.com/pa-ssch/one-clue) und [pa-ssch/pdfshuffle](https://github.com/pa-ssch/pdfshuffle).

## Ziel

Eine statische, rein clientseitige Web-App (kein Backend, keine Konten, keine Cookies, kein Tracking),
gehostet auf GitHub Pages unter eigener Domain, mit Impressum und Datenschutzerklärung, CI-Pipeline
mit Tests und automatischem Deploy. Qualitätsmaßstab: der Stand von one-clue / pdfshuffle.

## Ist-Zustand (Befund)

**Funktional**

- Startseite mit hartkodierten Dummy-Regelsätzen steht. `prepare` und `play` sind Platzhalter (Kommentare + ein `<select>`).
- Keine Persistenz (keine History / Favoriten), kein Teilen per Link / QR, keine Punktezählung, keine Spiellogik.
- `static/levels.json` wird nirgends verwendet und enthält gemischte Notizen.

**Bugs / Code-Smells**

- `src/routes/+page.ts`: nutzt `navigator` im universellen `load` → bricht bei SSR / Prerender (`navigator is not defined`). Sprachweiche muss clientseitig passieren.
- `src/routes/+error.svelte`: Fehlermeldung 4× hintereinander ausgegeben.
- `src/routes/+layout.svelte`: Footer enthält Test-Buttons (`test`, `kljkjl`), Sprachwechsel ist ein `alert()`; `grid-template-columns: 1fr, 1fr` ist ungültiges CSS (Komma).
- `src/routes/Nester.svelte`: Test-Datei mit `{@html}`, nicht verwendet → löschen.
- `src/app.html`: `lang="en"` fest, obwohl die App zweisprachig ist.
- `GameRulesetTile.svelte`: Kopieren navigiert nach `prepare/copy<uuid>` (String-Hack statt sauberem Routing).
- `about/+page.svelte`: Platzhalter `[Kontakt-E-Mail]`; Impressum/Datenschutz nur „ich bin imprint“.
- `package.json`: Name `web-demo`; Dependency `scss` ist ein fremdes, unpassendes Paket (nur `sass` nötig); `svelte-preprocess` + `vitePreprocess` doppelt (vitePreprocess reicht).
- `package-lock.json` UND `yarn.lock` eingecheckt → eine Quelle (yarn) behalten.
- `.DS_Store` ist eingecheckt, obwohl in `.gitignore`.
- README ist das unveränderte sv-Template.

**Toolchain / Sicherheit**

- `yarn lint`: 1 Formatierungs-Warnung (`phase-100.code-workspace`). `yarn check`: 0 Fehler. `yarn build`: läuft, aber adapter-auto findet keine Plattform.
- `yarn npm audit`: 3 high, 26 moderate, 5 low (u. a. vite 6.0.6 ≤ 6.4.3). Stack ist ~2 Jahre alt (svelte 5.16 → 5.57, kit 2.15 → 3.1, vite 6 → 8, eslint 9 → 10).
- Keine Tests, keine CI, kein Deploy, kein LICENSE, kein SECURITY.md, kein Dependabot, kein `.nvmrc`.
- Keine CSP, kein Manifest, keine Icons, keine Meta-Description, kein robots/sitemap, keine 404-Seite.
- Remote `pa-ssch/level-100` ist privat oder existiert noch nicht (GitHub API: Not Found).

## Entscheidungen, die vorab zu treffen sind

1. **Name / Domain.** Repo heißt `phase-100`, App heißt „Level 100“, Domains `lvl100.de` und `phase100.de`.
   Empfehlung: `lvl100.de` als primäre Domain und „Level 100“ als Name. „Phase 10“ ist eine eingetragene Marke (Mattel);
   `phase100.de` als sichtbare Domain erhöht das Verwechslungs- und Markenrisiko, das der Disclaimer gerade vermeiden will.
   `phase100.de` kann beim Registrar als HTTP-Redirect auf `lvl100.de` eingerichtet werden (GitHub Pages erlaubt nur eine Custom Domain je Repo).
2. **Teilen ohne Backend.** Die Routen `play/[id]` und `prepare/[id]` setzen eine serverseitige ID voraus, die es nicht gibt.
   Der Regelsatz muss komplett in der URL stecken (z. B. `?r=<base64url-JSON>` oder kompaktes Format) und beim Laden strikt validiert werden.
   Die ID bleibt nur lokal (History / Favoriten in localStorage).
3. **Routing auf GitHub Pages.** Statische Seiten vorrendern (`de-DE/start`, `en-US/start`, about, imprint, privacy); für dynamische Routen
   `fallback: '404.html'` (SPA-Fallback) oder Daten ausschließlich über Query-Parameter auf vorgerenderten Seiten. Empfehlung: Query-Parameter, dann braucht es keinen Fallback.
4. **Lizenz.** one-clue: MIT, pdfshuffle: Apache-2.0. Eine davon wählen.

## Phasen und Todos

### Phase 0 – Aufräumen und Fundament (½ Tag)

- [x] `package.json`: Name auf `level-100`, `version`, `license`, `engines.node >= 22`; `scss` und `svelte-preprocess` entfernen.
- [x] `svelte.config.js`: nur `vitePreprocess()`; `eslint.config.js` auf eslint-plugin-svelte 3 umgestellt (Regel `no-navigation-without-resolve` aktiv, alle Links über `resolve()`).
- [x] `package-lock.json` löschen, `.DS_Store` aus Git entfernen (`git rm --cached`), `.nvmrc` (22) anlegen.
- [x] Dependencies aktualisiert (svelte 5.57, kit 2.70, vite 6.4, eslint 9.39, vitest 4), Audit: 0 high/critical. `uuid` durch `crypto.randomUUID()` ersetzt.
- [ ] **Später:** Kit 3 / Vite 8 / ESLint 10 / TypeScript 6 brauchen Node ≥ 22.17 (lokal ist 22.11 ohne Versionsmanager). Nach Node-Update: `npx sv migrate` prüfen, `.nvmrc` anheben.
- [x] `Nester.svelte`, `static/levels.json`, Test-Buttons im Footer, 4-fache Fehlerausgabe entfernen; CSS-Komma fixen.
- [x] Modell nach `src/lib/ruleset.ts`, i18n-Helfer in `src/lib/i18n.ts`, erste Vitest-Tests (`yarn test`), `lang`-Attribut per `hooks.server.ts` je Sprache, Sprachwechsel im Footer als echter Link.
- [x] Dynamische Routen `prepare/[id]` und `play/[id]` zu statischen Seiten `prepare` und `play` mit Query-Parameter `?r=` umgebaut (Entscheidung 2).
- [x] `ToDo.txt` in diesen Plan überführen und löschen.
- [x] README neu schreiben (Was ist Level 100, Entwicklung, Tests, Deploy, Lizenz), `LICENSE` und `SECURITY.md` (wie pdfshuffle) anlegen.
- [x] `yarn lint`, `yarn check`, `yarn build` grün.

### Phase 1 – Statischer Build und GitHub Pages (½ Tag)

- [x] `@sveltejs/adapter-static` statt adapter-auto; `export const prerender = true` im Root-Layout; ggf. `trailingSlash: 'always'` (GitHub Pages liefert `/pfad/index.html`).
- [x] Root-Redirect (`/` → Sprache) clientseitig in `+page.svelte` mit `onMount`, nicht im `load`. Alternativ `/` als Startseite mit Sprachwahl.
- [x] `static/CNAME` mit `lvl100.de`; `static/robots.txt`; `.nojekyll` in `static/` (Adapter erzeugt es nicht).
- [ ] DNS beim Registrar (netcup): A-Records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` und AAAA `2606:50c0:8000::153` bis `::8003::153` für `lvl100.de`, `www` als CNAME auf `pa-ssch.github.io`. Stand 28.10.2026 zeigt `lvl100.de` noch auf den netcup-Domainpark (46.38.243.234). Danach in den Repo-Settings „Enforce HTTPS“ aktivieren.
- [ ] `phase100.de` → 301 auf `lvl100.de` beim Registrar.
- [x] Repo auf GitHub öffentlich; Pages per Workflow aktiviert, `pa-ssch.github.io/level-100` leitet auf `lvl100.de` um.

### Phase 2 – CI/CD (½ Tag)

Vorlage: `.github/workflows/ci.yml` aus pdfshuffle (Lint → Typecheck → Unit → Build → E2E → Upload Pages Artifact → Deploy nur auf `main`).

- [x] Workflow mit auf SHA gepinnten Actions (checkout, setup-node, upload-pages-artifact, deploy-pages), `permissions: contents: read`, `concurrency`, `timeout-minutes`.
- [x] Schritte: `yarn install --immutable`, `yarn npm audit --severity high`, `yarn lint`, `yarn check`, `yarn test`, `yarn build`, Upload + Deploy. Erster Lauf grün (28.10.2026).
- [x] Playwright e2e gegen `build/` in der CI (Chromium + WebKit), Playwright-Report als Artifact bei Fehler.
- [x] `.github/dependabot.yml` für npm und github-actions (wöchentlich, gruppiert).
- [ ] Branch-Protection auf `main`: CI muss grün sein.
- [ ] Optional (wie one-clue `live-check.yml`): nächtlicher Live-Check der veröffentlichten Seite (HTTPS, Zertifikat, Seite lädt fehlerfrei). Erst sinnvoll, wenn DNS steht.

### Phase 3 – Rechtliches (½ Tag)

Vorlage: `impressum/page.tsx` und `datenschutz/page.tsx` aus pdfshuffle (Angaben nach § 5 DDG, § 18 MStV, VSBG, GitHub-Pages-Hosting, DPF, Aufsichtsbehörde BW, Stand-Datum).

- [x] Impressum unter `/imprint` nach one-clue-Vorbild (eine Seite mit Impressum und Datenschutz, Du-Form): Betreiber 9xb, Anschrift, E-Mail info@9xb.de, Haftung, geteilte Inhalte, Open-Source-Hinweis, Font-Awesome-Attribution.
- [x] Datenschutzerklärung (Abschnitt auf `/imprint`): kein Server, keine Cookies, GitHub Pages Logfiles inkl. Hinweis auf Regelsatz-Daten in der URL, Local Storage (Verlauf/Favoriten, Spielstand, Sprache) nach § 25 TDDDG, Session Storage von SvelteKit, geteilte Links/QR, Betroffenenrechte. `/privacy` entfällt.
- [ ] Sobald Local Storage tatsächlich genutzt wird (Phase 6): Schlüssel in `e2e/helpers.ts` (`ALLOWED_LOCAL_STORAGE_KEYS`) eintragen, der Test erzwingt die Übereinstimmung mit der Erklärung.
- [x] About/Disclaimer zweisprachig unter `/about`, Abgrenzung auch im Impressum; Platzhalter ersetzt.
- [x] Rechtsseiten auf Deutsch mit englischer Zusammenfassung, Footer-Links je Sprache, Rückverlinkung.
- [x] `e2e/legal.spec.ts`: Pflichtangaben, keine Platzhalter, DDG statt TMG, Stand-Datum.

### Phase 4 – Sicherheit und Web-Best-Practices (1 Tag)

- [x] CSP per `kit.csp` (`mode: 'hash'`) als Meta-Tag, ohne `unsafe-inline`/`unsafe-eval`. Einzige Ausnahme: `style-src-attr 'unsafe-hashes'` mit dem Hash des festen style-Attributs von SvelteKits `#svelte-announcer`; `test/csp.test.ts` prüft den Hash gegen die Kit-Quelle (schlägt bei Kit-Updates an).
- [ ] WebKit meldet für jedes `<select>` unter `style-src 'self'` einen CSP-Verstoß seines internen Stylesheets (Browser-Eigenheit, in `e2e/helpers.ts` nur für WebKit ignoriert). Auf einem echten iPhone prüfen, ob `<select>` korrekt dargestellt wird; sonst in Phase 6 eigene Auswahl-Komponente statt `<select>`.
- [x] Referrer-Policy-Meta, `lang` pro Sprache (Hook beim Prerendern, `$effect` bei Client-Navigation).
- [x] Keine externen Ressourcen. Font Awesome entfernt, 8 Icons als Inline-SVG in `src/lib/icons.ts` + `Icon.svelte` (Build 1,3 MB → 0,3 MB).
- [x] Kein `{@html}` im Projekt; ESLint-Regel `svelte/no-at-html-tags` (recommended) aktiv, E2E prüft auf Inline-Styles/-Handler im HTML.
- [ ] Alle Eingaben aus URL und localStorage strikt validieren (Schema z. B. mit `valibot`/`zod` oder Hand-Parser): Typen, Wertebereiche (Handkarten 5–15, Farben 2–8, Level-Anzahl), Längenlimit für URL-Payload, Fallback auf Default bei Müll. Kein Absturz bei kaputtem localStorage (one-clue `security.test.js` als Vorlage).
- [ ] QR-Code-Generierung lokal (z. B. `qrcode`-Paket, SVG-Ausgabe), keine externe API.
- [x] Viewport ohne `maximum-scale`/`user-scalable=no` (per E2E abgesichert).
- [x] `fallback: '404.html'`, Fehlerseite per E2E getestet.

### Phase 5 – Tests (1 Tag, parallel zu Features)

- [ ] **Vitest** (Unit): Regelsatz-Modell, Serialisierung/Deserialisierung für Share-Links (Roundtrip), Validierung, Schwierigkeitsberechnung (Kombinatorik), Punktelogik.
- [x] **Playwright** eingerichtet (Chromium, WebKit, Pixel-7-Emulation) gegen `build/`: alle Routen, Sprach-Redirect, Sprachwechsel, Kacheln → play/prepare, 404, Rechtsseiten.
- [ ] Mit Phase 6 ergänzen: Regelsatz anlegen → Teilen-Link → in neuem Context öffnen → spielbar.
- [x] **Sicherheits-/Datenschutz-Tests** (`e2e/privacy.spec.ts`): kein Request verlässt die Origin, keine Cookies, nur dokumentierte Local-/Session-Storage-Keys, CSP auf jeder Seite, keine Inline-Styles/-Handler.
- [ ] Kaputter Local Storage stürzt nicht ab (sobald Storage genutzt wird, Phase 6).
- [x] **Barrierefreiheit** mit `@axe-core/playwright` (wcag2a/aa, 2.1/2.2) auf allen Seiten; zwei Funde behoben (Sprachlink-Label, Select ohne Label).
- [x] **Markup**: `main`-Landmark genau einmal, Titel je Seite.
- [ ] **SEO**: Description auf allen Seiten > 50 Zeichen, canonical, Manifest/Icons (Phase 7).
- [ ] Coverage für `src/lib` im CI ausgeben.

### Phase 6 – Spiel-Features (Kern; mehrere Tage)

Aus ToDo.txt und Kommentaren im Code:

- [ ] **Domänenmodell nach `src/lib/`** verschieben (`Ruleset`, `CardDeck`, `Level`/Vertrag, Serialisierung, Validierung), nicht in `routes/`.
- [ ] **Prepare-Seite**: Name, Kartendeck (Wertebereich 2–Ass bzw. 1–X, Farben, Joker ja/nein/Anzahl, eigene Sonderkarten wie „Aussetzen“), Handkarten pro Level, Level-Editor (Kombination aus Folge, Farbfolge, Gleiche, Full House, gerade/ungerade, … mit Anzahl), Modus `fixed` vs. „Kniffel“ (beim Rauskommen frei wählen).
- [ ] **Schwierigkeit**: Anzahl möglicher Hände je Level berechnen (Kombinatorik: wie viele Karten braucht man und wie oft gibt es sie im Deck) → Schwierigkeit 1–10, Level danach sortierbar; höheres Level = mehr Karten zum Rauskommen.
- [ ] **Teilen**: Regelsatz in URL kodieren, QR-Code anzeigen (Link auf `lvl100.de`), Hinweis wenn Link ungültig („hat jemand falsch geteilt?“).
- [ ] **Play-Seite**: aktuelles Level je Spieler anzeigen (nur eigenes, nicht die folgenden), Punkte für mehrere Spieler erfassen, Level-Fortschritt, Spielstand in localStorage.
- [ ] **Startseite**: „+ Neues Spiel“, History und Favoriten aus localStorage (statt Dummy-Daten), Kopieren über echten Zustand statt `copy<id>`-URL.
- [ ] **i18n**: de-DE / en-US sauber (Übersetzungs-Tabelle in `src/lib/i18n`, Sprachwechsel im Footer funktionsfähig, Auswahl in localStorage).
- [ ] Header: Zurück-Button auf prepare/play.
- [ ] Spielbar mit normalen Spielkarten (2–Ass) als vordefiniertes Deck.

### Phase 7 – Mobile, PWA, Feinschliff (1 Tag)

- [ ] Responsives Layout (Tiles haben `min-width: 400px` → bricht auf Handys), 16 px Gutter, keine horizontale Scrollbar, Dark/Light über `prefers-color-scheme`.
- [ ] `manifest.webmanifest`, Icons (192/512/apple-touch), `theme-color`; optional Service Worker für Offline (dann Versions-Check wie `scripts/check-sw-version.js` in one-clue).
- [ ] `prefers-reduced-motion` respektieren.
- [ ] Meta: Title/Description je Sprache, Open-Graph-Bild, `sitemap.xml`, `robots.txt`.
- [ ] Lighthouse ≥ 90 in allen Kategorien als Abnahmekriterium.

## Reihenfolge-Empfehlung

Phase 0 → 1 → 2 zuerst (danach deployt jeder Push auf `main` automatisch, auch wenn die App noch unfertig ist),
dann Phase 3 + 4 (Rechtssicherheit und CSP vor der ersten Verlinkung an Freunde), dann Phase 5 + 6 iterativ
(jedes Feature mit Tests), zum Schluss Phase 7.

## Definition of Done für „veröffentlicht“

- CI grün (lint, check, unit, build, e2e, axe, audit), Deploy per Action auf `lvl100.de` mit HTTPS.
- Impressum und Datenschutzerklärung vollständig und durch Tests abgesichert.
- Kein Request an fremde Origins, keine Cookies, CSP aktiv, Eingaben validiert.
- Ein Regelsatz lässt sich anlegen, per Link/QR teilen, auf einem zweiten Gerät öffnen und spielen.
