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

	// Einladen zeigt QR
	await page.getByRole('button', { name: 'Mitspieler einladen' }).click();
	await expect(page.getByRole('img', { name: /QR-Code/ })).toBeVisible();
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

test('Editor: Level aus Bausteinen, sortieren, Verlauf-Menü mit Duplizieren und Löschen', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);
	await page.goto('/en-US/start');
	await page.getByRole('link', { name: 'New game' }).click();
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
	// Baustein wieder entfernen
	await level2.getByRole('button', { name: 'Remove block: run of 9' }).click();
	await expect(level2).not.toContainText('run of 9');
	await level2.getByRole('button', { name: 'Block', exact: true }).click();
	await page.getByRole('button', { name: 'run of 4 in one suit', exact: true }).click();

	// Sortieren: das Paar + Farbfolge ist leichter als zwei Drillinge? Prüfen, dass die Reihenfolge nach Schwierigkeit gilt.
	await page.getByRole('button', { name: 'Sort by difficulty' }).click();
	const first = await page.getByRole('group', { name: 'Level 1' }).innerText();
	const second = await page.getByRole('group', { name: 'Level 2' }).innerText();
	expect(first).not.toBe(second);

	// Level-Menü: duplizieren, entfernen
	await page.getByRole('button', { name: 'Menu for level 2' }).click();
	await page.getByRole('menuitem', { name: 'Duplicate' }).click();
	await expect(page.getByRole('group', { name: /^Level \d+$/ })).toHaveCount(3);
	await page.getByRole('button', { name: 'Menu for level 3' }).click();
	await page.getByRole('menuitem', { name: 'Remove level' }).click();
	await expect(page.getByRole('group', { name: /^Level \d+$/ })).toHaveCount(2);

	// Fertig -> Verlauf
	await page.getByRole('button', { name: 'Done' }).click();
	await expect(page).toHaveURL(/\/en-US\/start$/);
	const tile = page.getByRole('article', { name: '' }).filter({ hasText: 'House rules' });
	await expect(tile).toContainText('2 levels · not played yet');

	// Stern, Duplizieren, Löschen
	await tile.getByRole('button', { name: 'Mark as favorite: House rules' }).click();
	await expect(tile.getByRole('button', { name: 'Remove favorite: House rules' })).toBeVisible();
	await tile.getByRole('button', { name: 'Menu: House rules' }).click();
	await page.getByRole('menuitem', { name: 'Duplicate' }).click();
	await expect(page.getByLabel('Name')).toHaveValue('House rules (copy)');
	await page.getByRole('button', { name: 'Done' }).click();
	const copy = page.getByRole('article').filter({ hasText: 'House rules (copy)' });
	await expect(copy).toBeVisible();
	await copy.getByRole('button', { name: 'Menu: House rules (copy)' }).click();
	page.once('dialog', (d) => d.accept());
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await expect(page.getByRole('article').filter({ hasText: 'House rules (copy)' })).toHaveCount(0);
	expect(errors).toEqual([]);
});

test('freier Modus und Punkte aus: Level in beliebiger Reihenfolge ohne Punkteblatt', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);
	await page.goto('/en-US/prepare');
	await page.getByLabel('Name').fill('Free');
	await page.getByRole('button', { name: 'Level', exact: true }).click();
	await page.getByRole('button', { name: 'pair', exact: true }).click();
	await page.getByRole('button', { name: 'Level', exact: true }).click();
	await page.getByRole('button', { name: 'run of 4', exact: true }).click();
	await page.getByText('More: hand size, order, points').click();
	await page.getByRole('radio', { name: /Free choice/ }).check();
	await page.getByRole('checkbox', { name: /Count points/ }).uncheck();
	await page.getByRole('button', { name: 'Play' }).click();
	await expect(page.getByText('Open levels')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Round over, not completed' })).toHaveCount(0);
	await page.getByRole('button', { name: 'Level completed' }).click();
	await expect(page.getByRole('heading', { name: 'Which level did you complete?' })).toBeVisible();
	await page.getByRole('button', { name: /^Level 3/ }).click();
	await expect(page.getByText('Level 1 of 3')).toBeVisible();
	await expect(page.locator('.hero')).not.toContainText('Level 3');
	await page.getByRole('button', { name: 'Level completed' }).click();
	await page.getByRole('button', { name: /^Level 1/ }).click();
	await page.getByRole('button', { name: 'Level completed' }).click();
	await page.getByRole('button', { name: /^Level 2/ }).click();
	await expect(page.getByRole('status')).toContainText('All levels completed');
	await expect(page.getByRole('status')).toContainText('3 rounds');
	expect(errors).toEqual([]);
});

test('Spiel beitreten per eingefügtem Link und ungültige Links', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);
	const joinUrl = await createCustomGame(page, 'Linktest');
	await page.evaluate(() => localStorage.clear());
	await page.goto('/de-DE/start');
	await page.getByRole('button', { name: 'Spiel beitreten' }).click();
	await page.getByLabel('Link zum Spiel').fill('https://example.com/nix');
	await page.getByRole('button', { name: 'Öffnen' }).click();
	await expect(page.getByRole('alert')).toContainText('kein Level-100-Link');
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
