import type { Requirement } from './game/requirements';

export const languages = ['de-DE', 'en-US'] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = 'en-US';

export function isLanguage(value: unknown): value is Language {
	return typeof value === 'string' && (languages as readonly string[]).includes(value);
}

/** Wählt anhand der Browsersprache die passende App-Sprache. */
export function detectLanguage(navigatorLanguage: string | undefined): Language {
	return navigatorLanguage?.toLowerCase().startsWith('de') ? 'de-DE' : defaultLanguage;
}

/** Kurzes lang-Attribut für das HTML-Dokument (`de` / `en`). */
export function htmlLang(language: string | undefined): string {
	return (isLanguage(language) ? language : defaultLanguage).slice(0, 2);
}

export function otherLanguage(language: Language): Language {
	return language === 'de-DE' ? 'en-US' : 'de-DE';
}

/** Sprache des HTML-Dokuments für Seiten außerhalb der Sprach-Routen. */
export const fixedRouteLanguages: Record<string, Language> = {
	'/imprint': 'de-DE'
};

const strings = {
	'de-DE': {
		appName: 'Level 100',
		back: 'Zurück',
		about: 'Über',
		imprint: 'Impressum & Datenschutz',
		// Start
		startIntro: 'Wähle einen Regelsatz oder lege einen neuen an. Regelsätze lassen sich als Link oder QR-Code teilen.',
		examplesHint: 'Zum Ausprobieren liegen zwei Beispiel-Regelsätze bereit.',
		newRuleset: 'Neuer Regelsatz',
		play: 'Spielen',
		edit: 'Bearbeiten',
		copy: 'Kopieren',
		copySuffix: '(Kopie)',
		delete: 'Löschen',
		deleteConfirm: 'Regelsatz „{name}“ wirklich löschen?',
		favorite: 'Als Favorit markieren',
		unfavorite: 'Favorit entfernen',
		share: 'Teilen',
		levelCount: '{n} Level',
		cardCount: '{n} Karten',
		unnamed: 'Ohne Namen',
		// Prepare
		prepareTitle: 'Regelsatz bearbeiten',
		name: 'Name',
		namePlaceholder: 'z. B. Freitagsrunde',
		nameRequired: 'Bitte einen Namen eingeben.',
		deck: 'Kartendeck',
		preset: 'Vorlage',
		presetStandard: '1–12, vier Farben, doppelt, 8 Joker',
		presetPoker: 'Pokerblatt 2–Ass, 2 Joker',
		presetCustom: 'Eigenes Deck',
		minValue: 'Kleinster Wert',
		maxValue: 'Größter Wert',
		suits: 'Farben',
		copies: 'Sätze',
		jokers: 'Joker',
		mode: 'Level-Reihenfolge',
		modeFixed: 'Der Reihe nach',
		modeFixedHint: 'Jeder Spieler muss die Level in der vorgegebenen Reihenfolge schaffen.',
		modeFree: 'Frei wählbar',
		modeFreeHint: 'Beim Rauskommen entscheidet der Spieler, welches offene Level er erfüllt hat.',
		levels: 'Level',
		level: 'Level {n}',
		handSize: 'Handkarten',
		requirements: 'Anforderungen',
		addRequirement: 'Anforderung hinzufügen',
		removeRequirement: 'Anforderung entfernen',
		addLevel: 'Level hinzufügen',
		removeLevel: 'Level entfernen',
		moveUp: 'Nach oben',
		moveDown: 'Nach unten',
		difficulty: 'Schwierigkeit',
		difficultyUnknown: 'Schwierigkeit nicht berechenbar (Freitext)',
		difficultyHint: 'Geschätzt aus {p} % der zufälligen Starthände, mit denen das Level sofort gelegt werden kann.',
		cardsNeeded: '{n} Karten nötig',
		tooManyCards: 'Das Level braucht mehr Karten, als auf der Hand sind.',
		save: 'Speichern',
		saveAndPlay: 'Speichern und spielen',
		invalidLink: 'Dieser Link enthält keinen gültigen Regelsatz. Vielleicht wurde er unvollständig kopiert?',
		kindSet: 'Gleiche Werte',
		kindRun: 'Folge',
		kindFlush: 'Eine Farbe',
		kindParity: 'Gerade / ungerade',
		kindCustom: 'Freitext',
		size: 'Karten',
		count: 'Anzahl',
		length: 'Länge',
		sameSuit: 'in einer Farbe',
		fixedValue: 'Fester Wert',
		anyValue: 'beliebig',
		even: 'gerade',
		odd: 'ungerade',
		customText: 'Beschreibung',
		customPlaceholder: 'z. B. Ein Vierling und ein Affe',
		// Play
		playTitle: 'Spielen',
		noGame: 'Kein Spiel geöffnet. Öffne einen geteilten Link oder scanne einen QR-Code.',
		toStart: 'Zur Startseite',
		players: 'Mitspieler',
		playerName: 'Name',
		player: 'Spieler {n}',
		addPlayer: 'Spieler hinzufügen',
		removePlayer: 'Spieler entfernen',
		startGame: 'Spiel starten',
		continueGame: 'Es gibt ein laufendes Spiel mit diesem Regelsatz.',
		continue: 'Weiterspielen',
		restart: 'Neu starten',
		currentLevel: 'Aktuelles Level',
		allDone: 'Alle Level geschafft',
		points: 'Punkte',
		round: 'Runde {n}',
		enterRound: 'Runde eintragen',
		completed: 'Level geschafft',
		completedWhich: 'Geschafftes Level',
		none: 'keins',
		roundPoints: 'Punkte dieser Runde',
		submitRound: 'Runde speichern',
		finished: '{name} hat alle Level geschafft!',
		newGame: 'Neues Spiel',
		newGameConfirm: 'Laufendes Spiel verwerfen und neu starten?',
		showAllLevels: 'Alle Level anzeigen',
		hideLevels: 'Level ausblenden',
		invite: 'Mitspieler einladen',
		rounds: 'Runden',
		// Share
		shareTitle: 'Regelsatz teilen',
		shareHint: 'Der Link enthält den kompletten Regelsatz. Wer ihn öffnet, kann sofort mitspielen.',
		copyLink: 'Link kopieren',
		copied: 'Kopiert!',
		qrAlt: 'QR-Code mit dem Link zum Regelsatz',
		close: 'Schließen'
	},
	'en-US': {
		appName: 'Level 100',
		back: 'Back',
		about: 'About',
		imprint: 'Imprint & Privacy',
		startIntro: 'Pick a ruleset or create a new one. Rulesets can be shared as a link or QR code.',
		examplesHint: 'Two example rulesets are included to get you started.',
		newRuleset: 'New ruleset',
		play: 'Play',
		edit: 'Edit',
		copy: 'Copy',
		copySuffix: '(copy)',
		delete: 'Delete',
		deleteConfirm: 'Delete ruleset “{name}”?',
		favorite: 'Mark as favorite',
		unfavorite: 'Remove favorite',
		share: 'Share',
		levelCount: '{n} levels',
		cardCount: '{n} cards',
		unnamed: 'Unnamed',
		prepareTitle: 'Edit ruleset',
		name: 'Name',
		namePlaceholder: 'e.g. Friday night',
		nameRequired: 'Please enter a name.',
		deck: 'Card deck',
		preset: 'Preset',
		presetStandard: '1–12, four suits, two of each, 8 jokers',
		presetPoker: 'Poker deck 2–Ace, 2 jokers',
		presetCustom: 'Custom deck',
		minValue: 'Lowest value',
		maxValue: 'Highest value',
		suits: 'Suits',
		copies: 'Copies',
		jokers: 'Jokers',
		mode: 'Level order',
		modeFixed: 'In order',
		modeFixedHint: 'Every player has to complete the levels in the given order.',
		modeFree: 'Free choice',
		modeFreeHint: 'When going out, the player decides which open level they completed.',
		levels: 'Levels',
		level: 'Level {n}',
		handSize: 'Cards in hand',
		requirements: 'Requirements',
		addRequirement: 'Add requirement',
		removeRequirement: 'Remove requirement',
		addLevel: 'Add level',
		removeLevel: 'Remove level',
		moveUp: 'Move up',
		moveDown: 'Move down',
		difficulty: 'Difficulty',
		difficultyUnknown: 'Difficulty not computable (free text)',
		difficultyHint: 'Estimated from the {p} % of random starting hands that can complete the level right away.',
		cardsNeeded: '{n} cards needed',
		tooManyCards: 'The level needs more cards than are in hand.',
		save: 'Save',
		saveAndPlay: 'Save and play',
		invalidLink: 'This link does not contain a valid ruleset. Maybe it was copied incompletely?',
		kindSet: 'Same value',
		kindRun: 'Run',
		kindFlush: 'One suit',
		kindParity: 'Even / odd',
		kindCustom: 'Free text',
		size: 'Cards',
		count: 'Count',
		length: 'Length',
		sameSuit: 'in one suit',
		fixedValue: 'Fixed value',
		anyValue: 'any',
		even: 'even',
		odd: 'odd',
		customText: 'Description',
		customPlaceholder: 'e.g. Four of a kind and a monkey',
		playTitle: 'Play',
		noGame: 'No game open. Open a shared link or scan a QR code.',
		toStart: 'Go to start',
		players: 'Players',
		playerName: 'Name',
		player: 'Player {n}',
		addPlayer: 'Add player',
		removePlayer: 'Remove player',
		startGame: 'Start game',
		continueGame: 'There is a game in progress with this ruleset.',
		continue: 'Continue',
		restart: 'Start over',
		currentLevel: 'Current level',
		allDone: 'All levels done',
		points: 'Points',
		round: 'Round {n}',
		enterRound: 'Enter round',
		completed: 'Level completed',
		completedWhich: 'Completed level',
		none: 'none',
		roundPoints: 'Points this round',
		submitRound: 'Save round',
		finished: '{name} has completed all levels!',
		newGame: 'New game',
		newGameConfirm: 'Discard the current game and start over?',
		showAllLevels: 'Show all levels',
		hideLevels: 'Hide levels',
		invite: 'Invite players',
		rounds: 'Rounds',
		shareTitle: 'Share ruleset',
		shareHint: 'The link contains the whole ruleset. Anyone who opens it can play right away.',
		copyLink: 'Copy link',
		copied: 'Copied!',
		qrAlt: 'QR code with the link to the ruleset',
		close: 'Close'
	}
} as const;

export type StringKey = keyof (typeof strings)['de-DE'];

export function t(language: string | undefined, key: StringKey, params: Record<string, string | number> = {}): string {
	const table = strings[isLanguage(language) ? language : defaultLanguage];
	return table[key].replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
}

/** Beschriftungen im Footer (bleibt für hooks/tests als eigene Funktion). */
export function footerLabel(language: string | undefined, key: 'about' | 'imprint'): string {
	return t(language, key);
}

const numberWordsDe = ['', 'Ein', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs'];
const setNamesDe: Record<number, [string, string]> = {
	2: ['Paar', 'Paare'],
	3: ['Drilling', 'Drillinge'],
	4: ['Vierling', 'Vierlinge'],
	5: ['Fünfling', 'Fünflinge'],
	6: ['Sechsling', 'Sechslinge']
};
const runNamesDe: Record<number, string> = {
	3: 'Dreier',
	4: 'Vierer',
	5: 'Fünfer',
	6: 'Sechser',
	7: 'Siebener',
	8: 'Achter',
	9: 'Neuner',
	10: 'Zehner'
};
const setNamesEn: Record<number, string> = {
	2: 'pair',
	3: 'three of a kind',
	4: 'four of a kind',
	5: 'five of a kind',
	6: 'six of a kind'
};

/** Lesbare Beschreibung einer Anforderung, z. B. „Zwei Drillinge“ oder „Vierer-Farbfolge“. */
export function describeRequirement(language: string | undefined, r: Requirement): string {
	const de = (isLanguage(language) ? language : defaultLanguage) === 'de-DE';
	switch (r.kind) {
		case 'set': {
			const value = r.value === undefined ? '' : de ? ` aus ${r.value}en` : ` of ${r.value}s`;
			if (de) {
				const [singular, plural] = setNamesDe[r.size] ?? [`${r.size}er-Gruppe`, `${r.size}er-Gruppen`];
				return r.count === 1 ? `${singular}${value}` : `${numberWordsDe[r.count] ?? r.count} ${plural}${value}`;
			}
			const name = (setNamesEn[r.size] ?? `${r.size} of a kind`) + value;
			return r.count === 1 ? name : `${r.count}× ${name}`;
		}
		case 'run': {
			if (de) {
				const name = `${runNamesDe[r.length] ?? `${r.length}er`}-${r.sameSuit ? 'Farbfolge' : 'Folge'}`;
				return r.count === 1 ? name : `${numberWordsDe[r.count] ?? r.count} ${name}n`;
			}
			const name = `run of ${r.length}${r.sameSuit ? ' in one suit' : ''}`;
			return r.count === 1 ? name : `${r.count}× ${name}`;
		}
		case 'flush':
			return de ? `${r.size} Karten einer Farbe` : `${r.size} cards of one suit`;
		case 'parity':
			return de ? `${r.size} ${r.parity === 'even' ? 'gerade' : 'ungerade'} Karten` : `${r.size} ${r.parity} cards`;
		case 'custom':
			return r.text;
	}
}

export function describeLevel(language: string | undefined, requirements: Requirement[]): string {
	return requirements.map((r) => describeRequirement(language, r)).join(' + ');
}
