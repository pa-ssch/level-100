import { expect, test } from '@playwright/test';
import { watchErrors } from './helpers';

test('kompletter Ablauf: Regelsatz anlegen, teilen, auf zweitem Gerät öffnen, spielen', async ({ page, browser, browserName }) => {
	const errors = watchErrors(page, browserName);

	// Regelsatz anlegen
	await page.goto('/de-DE/start');
	await page.getByRole('link', { name: 'Neuer Regelsatz' }).click();
	await expect(page).toHaveURL(/\/de-DE\/prepare$/);
	await page.getByLabel('Name').fill('Freitagsrunde');
	await expect(page.getByRole('region', { name: 'Level 1', exact: true })).toContainText('Zwei Drillinge');
	await expect(page.getByRole('region', { name: 'Level 1', exact: true })).toContainText(/Schwierigkeit: \d+\/10/);
	await page.getByRole('button', { name: 'Level hinzufügen' }).click();
	const level2 = page.getByRole('region', { name: 'Level 2', exact: true });
	await level2.getByRole('button', { name: 'Anforderung hinzufügen' }).click();
	await level2.getByRole('combobox', { name: 'Anforderungen' }).nth(1).selectOption('run');
	await expect(level2).toContainText('Zwei Drillinge + Vierer-Folge');
	// Handkarten zu klein -> Warnung
	await level2.getByLabel('Handkarten').fill('5');
	await level2.getByLabel('Handkarten').press('Tab');
	await expect(level2.getByRole('alert')).toContainText('mehr Karten');
	await level2.getByLabel('Handkarten').fill('12');
	await level2.getByLabel('Handkarten').press('Tab');
	await expect(level2.getByRole('alert')).toHaveCount(0);

	// Speichern und spielen
	await page.getByRole('button', { name: 'Speichern und spielen' }).click();
	await expect(page).toHaveURL(/\/de-DE\/play\?r=/);
	const shareUrl = page.url();
	await expect(page.getByRole('heading', { name: 'Freitagsrunde' })).toBeVisible();

	// Zweites Gerät: Link in neuem Browser-Kontext öffnen
	const other = await browser.newContext();
	const otherPage = await other.newPage();
	await otherPage.goto(shareUrl);
	await expect(otherPage.getByRole('heading', { name: 'Freitagsrunde' })).toBeVisible();
	await otherPage.goto('/de-DE/start');
	await expect(otherPage.getByRole('heading', { name: 'Freitagsrunde' })).toBeVisible();
	await other.close();

	// Spiel starten
	await page.getByPlaceholder('Spieler 1').fill('Ann');
	await page.getByPlaceholder('Spieler 2').fill('Ben');
	await page.getByRole('button', { name: 'Spieler hinzufügen' }).click();
	await page.getByRole('button', { name: 'Spieler entfernen 3' }).click();
	await page.getByRole('button', { name: 'Spiel starten' }).click();
	const table = page.getByRole('table').first();
	await expect(table).toContainText('Ann');
	await expect(table).toContainText('Level 1: Zwei Drillinge');

	// Runde eintragen: Ann schafft Level 1, Ben bekommt 25 Punkte
	await page.getByRole('checkbox', { name: 'Level geschafft' }).first().check();
	await page.getByLabel('Punkte dieser Runde').nth(1).fill('25');
	await page.getByRole('button', { name: 'Runde speichern' }).click();
	await expect(table.getByRole('row').nth(1)).toContainText('Level 2: Zwei Drillinge + Vierer-Folge');
	await expect(table.getByRole('row').nth(2)).toContainText('25');
	await expect(page.getByRole('heading', { name: 'Runde 2' })).toBeVisible();

	// Spielstand überlebt ein Neuladen
	await page.reload();
	await page.getByRole('button', { name: 'Weiterspielen' }).click();
	await expect(page.getByRole('heading', { name: 'Runde 2' })).toBeVisible();

	// Ann schafft Level 2 -> fertig
	await page.getByRole('checkbox', { name: 'Level geschafft' }).first().check();
	await page.getByRole('button', { name: 'Runde speichern' }).click();
	await expect(page.getByRole('status')).toContainText('Ann hat alle Level geschafft');

	// Teilen-Dialog mit QR-Code
	await page.getByRole('button', { name: 'Mitspieler einladen' }).click();
	await expect(page.getByRole('img', { name: /QR-Code/ })).toBeVisible();
	await expect(page.getByRole('textbox')).toHaveValue(shareUrl);
	await page.getByRole('button', { name: 'Schließen' }).click();

	// Startseite: Favorit, Kopie, Löschen
	await page.goto('/de-DE/start');
	await page.getByRole('button', { name: 'Als Favorit markieren: Freitagsrunde' }).click();
	await expect(page.getByRole('button', { name: 'Favorit entfernen: Freitagsrunde' })).toBeVisible();
	await page.getByRole('link', { name: 'Kopieren: Freitagsrunde' }).click();
	await expect(page.getByLabel('Name')).toHaveValue('Freitagsrunde (Kopie)');
	await page.getByRole('button', { name: 'Speichern', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Freitagsrunde (Kopie)' })).toBeVisible();
	page.once('dialog', (d) => d.accept());
	await page.getByRole('button', { name: 'Löschen: Freitagsrunde (Kopie)' }).click();
	await expect(page.getByRole('heading', { name: 'Freitagsrunde (Kopie)' })).toHaveCount(0);

	expect(errors).toEqual([]);
});

test('freier Modus: Level in beliebiger Reihenfolge', async ({ page }) => {
	await page.goto('/en-US/start');
	await page.getByRole('link', { name: 'Edit: Poker deck, five levels' }).click();
	await page.getByRole('radio', { name: /Free choice/ }).check();
	await page.getByRole('button', { name: 'Save and play' }).click();
	await page.getByRole('button', { name: 'Start game' }).click();
	await page.getByRole('combobox', { name: 'Completed level' }).first().selectOption('3');
	await page.getByRole('button', { name: 'Save round' }).click();
	const row = page.getByRole('table').first().getByRole('row').nth(1);
	await expect(row).toContainText('Level 1');
	await expect(row).toContainText('Level 5');
	await expect(row).not.toContainText('Level 4');
});

test('funktioniert auch ohne crypto.randomUUID (unsicherer Kontext, z. B. LAN-Adresse)', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);
	await page.addInitScript(() => {
		delete (Crypto.prototype as { randomUUID?: unknown }).randomUUID;
	});
	await page.goto('/de-DE/start');
	await page.getByRole('link', { name: 'Neuer Regelsatz' }).click();
	await page.getByLabel('Name').fill('LAN-Test');
	await page.getByRole('button', { name: 'Speichern und spielen' }).click();
	await page.getByRole('button', { name: 'Spiel starten' }).click();
	await expect(page.getByRole('heading', { name: 'Runde 1' })).toBeVisible();
	expect(errors).toEqual([]);
});
