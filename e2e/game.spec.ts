import { expect, test, type Page } from '@playwright/test';
import { watchErrors } from './helpers';

/** Legt über den Editor ein kleines Spiel an und startet es; liefert die Beitreten-URL. */
async function createCustomGame(page: Page, name: string): Promise<string> {
	await page.goto('/de-DE/start');
	await page.getByRole('link', { name: 'Neues Spiel' }).click();
	await page.getByRole('link', { name: /Selbst zusammenstellen/ }).click();
	await page.getByLabel('Name').fill(name);
	await page.getByRole('button', { name: 'Spielen' }).click();
	await expect(page).toHaveURL(/\/de-DE\/play\?r=.*go=1/);
	const url = new URL(page.url());
	url.searchParams.delete('go');
	return url.toString();
}

test('Zufallsspiel in drei Taps, Runden mit Punkten, Fortsetzen aus dem Verlauf', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);

	// Erstbesuch: zwei Kacheln
	await page.goto('/de-DE/start');
	await expect(page.getByRole('heading', { name: 'Womit geht’s los?' })).toBeVisible();
	await page.getByRole('link', { name: 'Neues Spiel' }).click();
	await expect(page).toHaveURL(/\/de-DE\/new$/);
	await page.getByRole('link', { name: /Zufällig zusammenstellen/ }).click();
	await expect(page).toHaveURL(/\/de-DE\/random$/);

	// Vorgaben sind vorausgewählt (Mittel / Mittel / Standarddeck)
	await expect(page.getByRole('radio', { name: /^Mittel/ }).first()).toHaveAttribute('aria-checked', 'true');
	await page.getByRole('button', { name: 'Level würfeln' }).click();

	// Vorschau: 8 Level, aufsteigend, Name automatisch
	await expect(page.getByRole('textbox')).toHaveValue('Mittel · 8 Level');
	await expect(page.getByRole('group', { name: /^Level \d+$/ })).toHaveCount(8);
	const before = await page.getByRole('group', { name: 'Level 3' }).innerText();
	await page.getByRole('button', { name: 'Level 3 neu würfeln' }).click();
	await expect.poll(() => page.getByRole('group', { name: 'Level 3' }).innerText()).not.toBe(before);
	await page.getByRole('button', { name: 'Spielen' }).click();

	// Spielen: eigenes Level, Punkte
	await expect(page).toHaveURL(/\/de-DE\/play\?r=/);
	await expect(page.getByText('Dein Level')).toBeVisible();
	await expect(page.getByText('Level 1 von 8 · 0 Punkte')).toBeVisible();
	await page.getByRole('button', { name: 'Level geschafft' }).click();
	await expect(page.getByRole('heading', { name: 'Punkte auf der Hand' })).toBeVisible();
	await page.getByRole('button', { name: '+10' }).click();
	await page.getByRole('button', { name: 'Fertig' }).click();
	await expect(page.getByText('Level 2 von 8 · 10 Punkte')).toBeVisible();
	await page.getByRole('button', { name: 'Runde vorbei, nicht geschafft' }).click();
	await page.getByRole('spinbutton').fill('7');
	await page.getByRole('button', { name: 'Fertig' }).click();
	await expect(page.getByText('Level 2 von 8 · 17 Punkte')).toBeVisible();

	// Neuladen und Verlauf
	await page.reload();
	await expect(page.getByText('Level 2 von 8 · 17 Punkte')).toBeVisible();
	await page.getByRole('link', { name: 'Zurück' }).click();
	await expect(page).toHaveURL(/\/de-DE\/start$/);
	await expect(page.getByRole('heading', { name: 'Läuft gerade' })).toBeVisible();
	const tile = page.getByRole('article').first();
	await expect(tile).toContainText('Mittel · 8 Level');
	await expect(tile).toContainText('Level 2 von 8');
	await tile.getByRole('link').click();
	await expect(page.getByText('Level 2 von 8 · 17 Punkte')).toBeVisible();

	// Einladen: QR-Code oder Link
	await page.getByRole('button', { name: 'Spieler einladen' }).click();
	await expect(page.getByRole('img', { name: /QR-Code/ })).toHaveCount(0);
	await page.getByRole('button', { name: 'QR-Code anzeigen' }).click();
	await expect(page.getByRole('img', { name: /QR-Code/ })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Link senden' })).toBeVisible();
	await page.getByRole('button', { name: 'Schließen' }).click();

	expect(errors).toEqual([]);
});

test('Beitreten per Link auf einem zweiten Gerät, dann alle Level schaffen', async ({ page, browser, browserName }) => {
	const errors = watchErrors(page, browserName);
	const joinUrl = await createCustomGame(page, 'Freitagsrunde');

	const other = await browser.newContext();
	const otherPage = await other.newPage();
	const otherErrors = watchErrors(otherPage, browserName);
	await otherPage.goto(joinUrl);
	await expect(otherPage.getByRole('heading', { name: 'Freitagsrunde' })).toBeVisible();
	await expect(otherPage.getByText('per Link erhalten')).toBeVisible();
	await otherPage.getByRole('button', { name: 'Mitspielen' }).click();
	await expect(otherPage.getByText('Dein Level')).toBeVisible();
	await expect(otherPage.getByText('Zwei Drillinge')).toBeVisible();
	// Ein Level, Punkte an: geschafft -> Punkte -> fertig
	await otherPage.getByRole('button', { name: 'Level geschafft' }).click();
	await otherPage.getByRole('button', { name: 'Fertig' }).click();
	await expect(otherPage.getByRole('status')).toContainText('Alle Level geschafft');
	await expect(otherPage.getByRole('status')).toContainText('1 Runden · 0 Punkte');
	// Nochmal spielen setzt zurück
	await otherPage.getByRole('button', { name: 'Nochmal spielen' }).click();
	await expect(otherPage.getByText('Level 1 von 1 · 0 Punkte')).toBeVisible();
	// Das Spiel steht im Verlauf des zweiten Geräts
	await otherPage.goto('/de-DE/start');
	await expect(otherPage.getByRole('article').first()).toContainText('Freitagsrunde');
	expect(otherErrors).toEqual([]);
	await other.close();
	expect(errors).toEqual([]);
});

test('Editor: Level aus Bausteinen, Drag & Drop, sortieren, Verlauf-Menü mit Duplizieren und Löschen', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);
	await page.goto('/en-US/start');
	await page.getByRole('link', { name: 'New game' }).click();
	await expect(page.getByRole('link', { name: /Random levels/ })).toHaveCount(1);
	await page.getByRole('link', { name: /Build it yourself/ }).click();
	await page.getByLabel('Name').fill('House rules');
	const level1 = page.getByRole('group', { name: 'Level 1' });
	await expect(level1).toContainText('2× three of a kind');

	// Level 2 anlegen: Blatt öffnet sich, Baustein wählen, zweiten dazu
	await page.getByRole('button', { name: 'Level', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Pick a block' })).toBeVisible();
	await page.getByRole('button', { name: 'pair', exact: true }).click();
	const level2 = page.getByRole('group', { name: 'Level 2' });
	await expect(level2).toContainText('pair');
	await level2.getByRole('button', { name: 'Block', exact: true }).click();
	await page.getByRole('button', { name: 'More blocks' }).click();
	await page.getByRole('button', { name: 'run of 9', exact: true }).click();
	await expect(level2).toContainText('run of 9');
	await level2.getByRole('button', { name: 'Remove block: run of 9' }).click();
	await expect(level2).not.toContainText('run of 9');
	await level2.getByRole('button', { name: 'Block', exact: true }).click();
	await page.getByRole('button', { name: 'run of 4 in one suit', exact: true }).click();

	// Drag & Drop: Level 2 über Level 1 ziehen
	await page.getByRole('button', { name: 'Move level 2' }).dragTo(page.getByRole('group', { name: 'Level 1' }));
	await expect(page.getByRole('group', { name: 'Level 1' })).toContainText(/pair.*run of 4 in one suit/);
	await expect(page.getByRole('group', { name: 'Level 2' })).toContainText('2× three of a kind');

	// Sortieren nach Schwierigkeit ändert die Reihenfolge nicht zufällig: zwei Drillinge sind schwerer als Paar + Farbfolge?
	await page.getByRole('button', { name: 'Sort by difficulty' }).click();
	await expect(page.getByRole('group', { name: /^Level \d+$/ })).toHaveCount(2);

	// Level-Menü: duplizieren, entfernen
	await page.getByRole('button', { name: 'Menu for level 2' }).click();
	await page.getByRole('menuitem', { name: 'Duplicate' }).click();
	await expect(page.getByRole('group', { name: /^Level \d+$/ })).toHaveCount(3);
	await page.getByRole('button', { name: 'Menu for level 3' }).click();
	await page.getByRole('menuitem', { name: 'Remove level' }).click();
	await expect(page.getByRole('group', { name: /^Level \d+$/ })).toHaveCount(2);

	// Kein „Fertig“: Zurück speichert automatisch
	await expect(page.getByRole('button', { name: 'Done' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Share' })).toHaveCount(0);
	await page.getByRole('link', { name: 'Back' }).click();
	await expect(page).toHaveURL(/\/en-US\/start$/);
	const tile = page.getByRole('article').filter({ hasText: 'House rules' });
	await expect(tile).toContainText('2 levels · not played yet');

	// Stern, Duplizieren, Löschen
	await tile.getByRole('button', { name: 'Mark as favorite: House rules' }).click();
	await expect(tile.getByRole('button', { name: 'Remove favorite: House rules' })).toBeVisible();
	await tile.getByRole('button', { name: 'Menu: House rules' }).click();
	await page.getByRole('menuitem', { name: 'Duplicate' }).click();
	await expect(page.getByLabel('Name')).toHaveValue('House rules (copy)');
	// Erst eine Änderung speichert die Kopie
	await page.getByLabel('Name').fill('House rules (copy)!');
	await page.getByRole('link', { name: 'Back' }).click();
	const copy = page.getByRole('article').filter({ hasText: 'House rules (copy)!' });
	await expect(copy).toBeVisible();
	await copy.getByRole('button', { name: 'Menu: House rules (copy)!' }).click();
	page.once('dialog', (d) => d.accept());
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await expect(page.getByRole('article').filter({ hasText: 'House rules (copy)!' })).toHaveCount(0);
	expect(errors).toEqual([]);
});

test('Name ist optional: ohne Namen heißt das Spiel nach seiner Levelzahl', async ({ page }) => {
	await page.goto('/de-DE/prepare');
	await page.getByRole('button', { name: 'Spielen' }).click();
	await expect(page.getByRole('heading', { name: 'Eigenes Spiel · 1 Level' })).toBeVisible();
	await page.goto('/de-DE/start');
	await expect(page.getByRole('article').first()).toContainText('Eigenes Spiel · 1 Level');
});

test('Eigenes Deck anlegen, verwenden und wieder löschen', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);
	await page.goto('/de-DE/prepare');
	await page.getByLabel('Name').fill('Skatrunde');
	await expect(page.getByRole('button', { name: 'Weitere Decks' })).toHaveCount(0);
	await page.getByRole('link', { name: 'Neues Deck' }).click();
	await expect(page).toHaveURL(/\/de-DE\/deck\?return=prepare&id=/);
	await page.getByLabel('Name des Decks').fill('Skatblatt');
	await page.getByLabel('Kleinster Wert').fill('7');
	await page.getByLabel('Kleinster Wert').press('Tab');
	await page.getByLabel('Größter Wert').fill('14');
	await page.getByLabel('Größter Wert').press('Tab');
	await page.getByLabel('Sätze').fill('1');
	await page.getByLabel('Sätze').press('Tab');
	await page.getByLabel('Joker').fill('0');
	await page.getByLabel('Joker').press('Tab');
	await expect(page.getByText('32 Karten')).toBeVisible();
	await page.getByRole('button', { name: 'Deck speichern und verwenden' }).click();
	await expect(page).toHaveURL(/\/de-DE\/prepare\?id=/);
	await expect(page.getByLabel('Name')).toHaveValue('Skatrunde');
	const skat = page.getByRole('radio', { name: /Skatblatt/ });
	await expect(skat).toHaveAttribute('aria-checked', 'true');
	// Löschen fragt nach; abgebrochen bleibt es da
	page.once('dialog', (d) => d.dismiss());
	await page.getByRole('button', { name: 'Deck löschen: Skatblatt' }).click();
	await expect(skat).toBeVisible();
	page.once('dialog', (d) => d.accept());
	await page.getByRole('button', { name: 'Deck löschen: Skatblatt' }).click();
	await expect(page.getByRole('radio', { name: /Skatblatt/ })).toHaveCount(0);
	expect(errors).toEqual([]);
});

test('freier Modus und Punkte aus: Level als Kacheln in beliebiger Reihenfolge, ohne Punkteblatt', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);
	await page.goto('/en-US/prepare');
	await page.getByLabel('Name').fill('Free');
	await page.getByRole('button', { name: 'Level', exact: true }).click();
	await page.getByRole('button', { name: 'pair', exact: true }).click();
	await page.getByRole('button', { name: 'Level', exact: true }).click();
	await page.getByRole('button', { name: 'run of 4', exact: true }).click();
	await page.getByRole('switch', { name: 'Levels in order' }).click();
	await expect(page.getByRole('switch', { name: 'Levels in any order' })).toBeChecked();
	await page.getByRole('switch', { name: 'Count points' }).click();
	await expect(page.getByRole('switch', { name: 'No points' })).not.toBeChecked();
	await page.getByRole('button', { name: 'Play' }).click();

	// Kacheln statt Liste, keine Fortschrittsleiste, keine „nicht geschafft“-Kachel ohne Punkte
	await expect(page.getByRole('button', { name: 'run of 4', exact: true })).toBeVisible();
	await expect(page.getByRole('img', { name: /Level \d of/ })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Round over, not completed' })).toHaveCount(0);
	await page.getByRole('button', { name: 'run of 4', exact: true }).click();
	await expect(page.getByRole('button', { name: 'run of 4', exact: true })).toBeDisabled();
	await expect(page.getByText('2 levels')).toBeVisible();
	await page.getByRole('button', { name: 'pair', exact: true }).click();
	await page.getByRole('button', { name: '2× three of a kind' }).click();
	await expect(page.getByRole('status')).toContainText('All levels completed');
	await expect(page.getByRole('status')).toContainText('3 rounds');
	expect(errors).toEqual([]);
});

test('freier Modus mit Punkten: Kachel „Runde vorbei“ und Punkteblatt', async ({ page }) => {
	await page.goto('/de-DE/prepare');
	await page.getByRole('switch', { name: 'Level der Reihe nach' }).click();
	await page.getByRole('button', { name: 'Spielen' }).click();
	await page.getByRole('button', { name: 'Runde vorbei, nicht geschafft' }).click();
	await page.getByRole('button', { name: '+5' }).click();
	await page.getByRole('button', { name: 'Fertig' }).click();
	await expect(page.getByText('1 Level · 5 Punkte')).toBeVisible();
	await page.getByRole('button', { name: 'Zwei Drillinge' }).click();
	await page.getByRole('button', { name: 'Fertig' }).click();
	await expect(page.getByRole('status')).toContainText('Alle Level geschafft');
});

test('Spiel beitreten per eingefügtem Link und ungültige Links', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);
	const joinUrl = await createCustomGame(page, 'Linktest');
	await page.evaluate(() => localStorage.clear());
	await page.goto('/de-DE/start');
	await page.getByRole('button', { name: 'Spiel beitreten' }).click();
	await page.getByLabel('Link zum Spiel').fill('https://example.com/nix');
	await page.getByRole('button', { name: 'Öffnen' }).click();
	// Ohne Kamera zeigt das Blatt zusätzlich einen Kamera-Hinweis als Alert
	await expect(page.getByRole('alert').filter({ hasText: 'Level-100-Link' })).toBeVisible();
	await page.getByLabel('Link zum Spiel').fill(joinUrl);
	await page.getByRole('button', { name: 'Öffnen' }).click();
	await expect(page.getByRole('heading', { name: 'Linktest' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Mitspielen' })).toBeVisible();
	expect(errors).toEqual([]);
});

test('funktioniert auch ohne crypto.randomUUID (unsicherer Kontext, z. B. LAN-Adresse)', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);
	await page.addInitScript(() => {
		delete (Crypto.prototype as { randomUUID?: unknown }).randomUUID;
	});
	await createCustomGame(page, 'LAN-Test');
	await expect(page.getByText('Dein Level')).toBeVisible();
	expect(errors).toEqual([]);
});
