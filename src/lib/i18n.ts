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
		more: 'Mehr',
		close: 'Schließen',
		cancel: 'Abbrechen',
		done: 'Fertig',
		change: 'Ändern',
		unexpectedError: 'Unerwarteter Fehler',
		unnamed: 'Ohne Namen',
		levelCount: '{n} Level',
		cardCount: '{n} Karten',
		minutes: '≈ {m} min',
		// Start
		startTitle: 'Womit geht’s los?',
		startIntro: 'Für Kartenspiele mit Stufen. Ihr spielt mit echten Karten, die App zählt mit.',
		newGame: 'Neues Spiel',
		joinGame: 'Spiel beitreten',
		joinHint: 'QR-Code scannen oder Link einfügen',
		running: 'Läuft gerade',
		history: 'Favoriten und Verlauf',
		runningStatus: 'Level {n} von {total}',
		finishedStatus: 'Fertig gespielt',
		playsCount: '{n}× gespielt',
		notPlayed: 'noch nicht gespielt',
		menu: 'Menü',
		edit: 'Bearbeiten',
		share: 'Teilen',
		duplicate: 'Duplizieren',
		copySuffix: '(Kopie)',
		delete: 'Löschen',
		deleteConfirm: 'Spiel „{name}“ wirklich löschen?',
		favorite: 'Als Favorit markieren',
		unfavorite: 'Favorit entfernen',
		joinTitle: 'Spiel beitreten',
		joinPaste: 'Link zum Spiel',
		joinOpen: 'Öffnen',
		joinInvalid: 'Das ist kein Level-100-Link. Bitte den kompletten Link einfügen.',
		// Neues Spiel
		newTitle: 'Wie soll das Spiel entstehen?',
		randomTitle: 'Zufällig zusammenstellen',
		randomHint: 'Du wählst Deck, Dauer und Schwierigkeit. Die Level würfelt die App. Empfohlen.',
		customTitle: 'Selbst zusammenstellen',
		customHint: 'Jedes Level aus Bausteinen bauen. Für eigene Hausregeln.',
		// Zufällig
		randomScreen: 'Zufälliges Spiel',
		deckQ: 'Mit welchen Karten?',
		deckStandard: '1–12, 4 Farben',
		deckStandardHint: 'doppelt, 8 Joker',
		deckPoker: 'Pokerblatt',
		deckPokerHint: '2 bis Ass, 2 Joker',
		deckCustom: 'Eigenes Deck',
		durationQ: 'Wie lange?',
		short: 'Kurz',
		medium: 'Mittel',
		long: 'Lang',
		difficultyQ: 'Wie schwer?',
		easy: 'Leicht',
		mediumDiff: 'Mittel',
		hard: 'Schwer',
		sortedHint: 'Die Level werden von leicht nach schwer sortiert.',
		roll: 'Level würfeln',
		rolling: 'Würfelt …',
		preview: 'Vorschau',
		nameHint: 'Name antippen zum Ändern',
		rerollAll: 'Alle neu würfeln',
		rerollOne: 'Level {n} neu würfeln',
		adjust: 'Anpassen',
		play: 'Spielen',
		randomName: '{difficulty} · {n} Level',
		// Mehr
		moreOptions: 'Mehr: eigenes Deck, Handkarten, Reihenfolge, Punkte',
		moreOptionsShort: 'Mehr: Handkarten, Reihenfolge, Punkte',
		handSize: 'Handkarten',
		handSizeHint: 'Gilt für alle Level.',
		modeQ: 'Level-Reihenfolge',
		modeFixed: 'Der Reihe nach',
		modeFree: 'Frei wählbar',
		modeFreeHint: 'Beim Rauskommen entscheidest du, welches offene Level du erfüllt hast.',
		pointsOpt: 'Punkte zählen',
		pointsHint: 'Nach jeder Runde die Punkte der Restkarten eintragen.',
		minValue: 'Kleinster Wert',
		maxValue: 'Größter Wert',
		suits: 'Farben',
		copies: 'Sätze',
		jokers: 'Joker',
		// Editor
		editorTitle: 'Selbst zusammenstellen',
		name: 'Name',
		namePlaceholder: 'z. B. Freitagsrunde',
		nameRequired: 'Bitte einen Namen eingeben.',
		deckRow: 'Deck',
		addLevel: 'Level',
		addBlock: 'Baustein',
		blockPick: 'Baustein wählen',
		moreBlocks: 'Mehr Bausteine',
		fewerBlocks: 'Weniger Bausteine',
		customBlock: 'Eigener Text',
		customPlaceholder: 'z. B. Ein Vierling und ein Affe',
		fixedValue: 'Fester Wert',
		fixedValueHint: 'z. B. drei 8er',
		removeBlock: 'Baustein entfernen: {b}',
		levelMenu: 'Menü für Level {n}',
		moveUp: 'Nach oben',
		moveDown: 'Nach unten',
		removeLevel: 'Level entfernen',
		sortByDifficulty: 'Nach Schwierigkeit sortieren',
		levelEmpty: 'Noch keine Bausteine',
		tooManyCards: 'Braucht mehr Karten, als auf der Hand sind.',
		difficulty: 'Schwierigkeit {d} von 10',
		difficultyUnknown: 'Schwierigkeit nicht berechenbar (Freitext)',
		// Spielen
		yourLevel: 'Dein Level',
		levelOf: 'Level {n} von {total}',
		level: 'Level {n}',
		handNeeded: '{hand} Handkarten · {need} Karten nötig',
		handOnly: '{hand} Handkarten',
		nextLevel: 'Nächstes Level: {d}',
		completed: 'Level geschafft',
		notCompleted: 'Runde vorbei, nicht geschafft',
		pointsSheet: 'Punkte auf der Hand',
		pointsTotal: '{n} Punkte',
		showAll: 'Alle Level anzeigen',
		hideAll: 'Level ausblenden',
		invite: 'Mitspieler einladen',
		finishedTitle: 'Alle Level geschafft!',
		finishedSummary: '{rounds} Runden · {points} Punkte',
		finishedSummaryNoPoints: '{rounds} Runden',
		playAgain: 'Nochmal spielen',
		toHistory: 'Zurück zum Verlauf',
		openLevelsTitle: 'Offene Level',
		whichLevel: 'Welches Level hast du geschafft?',
		none: 'Keins',
		roundsSoFar: 'Runde {n}',
		// Beitreten
		joinIntro: 'per Link erhalten',
		joinMore: '… und {n} weitere',
		joinPlay: 'Mitspielen',
		joinSaved: 'Das Spiel wird in deinem Verlauf gespeichert.',
		invalidLink: 'Dieser Link enthält kein gültiges Spiel. Vielleicht wurde er unvollständig kopiert?',
		noGame: 'Kein Spiel geöffnet. Öffne einen geteilten Link oder scanne einen QR-Code.',
		toStart: 'Zur Startseite',
		// Teilen
		shareTitle: 'Mitspieler einladen',
		shareHint: 'Der Link enthält das komplette Spiel. Wer ihn öffnet, kann sofort mitspielen.',
		copyLink: 'Link kopieren',
		copied: 'Kopiert!',
		qrAlt: 'QR-Code mit dem Link zum Spiel',
		// Meta
		metaStart:
			'Eigene Spiele für Kartenspiele mit Stufen zusammenstellen, als Link oder QR-Code teilen und beim Spielen mit echten Karten das eigene Level und die Punkte verfolgen. Läuft komplett im Browser, ohne Konto.',
		metaNew: 'Neues Spiel anlegen: Level zufällig nach Dauer und Schwierigkeit würfeln lassen oder selbst aus Bausteinen zusammenstellen.',
		metaRandom: 'Ein zufälliges Spiel in drei Schritten: Deck, Dauer und Schwierigkeit wählen, Level-Vorschau prüfen, losspielen.',
		metaPrepare:
			'Level aus Bausteinen wie Drilling, Viererfolge oder Farbfolge zusammenstellen, mit automatischer Beschreibung und Schwierigkeit.',
		metaPlay: 'Dein aktuelles Level und deine Punkte am Tisch verfolgen. Geteilten Link öffnen und sofort mitspielen.'
	},
	'en-US': {
		appName: 'Level 100',
		back: 'Back',
		about: 'About',
		imprint: 'Imprint & Privacy',
		more: 'More',
		close: 'Close',
		cancel: 'Cancel',
		done: 'Done',
		change: 'Change',
		unexpectedError: 'Unexpected error',
		unnamed: 'Unnamed',
		levelCount: '{n} levels',
		cardCount: '{n} cards',
		minutes: '≈ {m} min',
		startTitle: 'What do you want to do?',
		startIntro: 'For level-based card games. You play with real cards, the app keeps track.',
		newGame: 'New game',
		joinGame: 'Join a game',
		joinHint: 'Scan a QR code or paste a link',
		running: 'In progress',
		history: 'Favorites and history',
		runningStatus: 'Level {n} of {total}',
		finishedStatus: 'Finished',
		playsCount: 'played {n}×',
		notPlayed: 'not played yet',
		menu: 'Menu',
		edit: 'Edit',
		share: 'Share',
		duplicate: 'Duplicate',
		copySuffix: '(copy)',
		delete: 'Delete',
		deleteConfirm: 'Delete game “{name}”?',
		favorite: 'Mark as favorite',
		unfavorite: 'Remove favorite',
		joinTitle: 'Join a game',
		joinPaste: 'Link to the game',
		joinOpen: 'Open',
		joinInvalid: 'That is not a Level 100 link. Please paste the complete link.',
		newTitle: 'How should the game be created?',
		randomTitle: 'Random levels',
		randomHint: 'You pick deck, duration and difficulty. The app rolls the levels. Recommended.',
		customTitle: 'Build it yourself',
		customHint: 'Compose every level from building blocks. For your own house rules.',
		randomScreen: 'Random game',
		deckQ: 'Which cards?',
		deckStandard: '1–12, 4 suits',
		deckStandardHint: 'two of each, 8 jokers',
		deckPoker: 'Poker deck',
		deckPokerHint: '2 to Ace, 2 jokers',
		deckCustom: 'Custom deck',
		durationQ: 'How long?',
		short: 'Short',
		medium: 'Medium',
		long: 'Long',
		difficultyQ: 'How hard?',
		easy: 'Easy',
		mediumDiff: 'Medium',
		hard: 'Hard',
		sortedHint: 'Levels are sorted from easy to hard.',
		roll: 'Roll levels',
		rolling: 'Rolling …',
		preview: 'Preview',
		nameHint: 'Tap the name to change it',
		rerollAll: 'Reroll all',
		rerollOne: 'Reroll level {n}',
		adjust: 'Adjust',
		play: 'Play',
		randomName: '{difficulty} · {n} levels',
		moreOptions: 'More: custom deck, hand size, order, points',
		moreOptionsShort: 'More: hand size, order, points',
		handSize: 'Cards in hand',
		handSizeHint: 'Applies to all levels.',
		modeQ: 'Level order',
		modeFixed: 'In order',
		modeFree: 'Free choice',
		modeFreeHint: 'When going out, you decide which open level you completed.',
		pointsOpt: 'Count points',
		pointsHint: 'After each round, enter the points of the cards left in your hand.',
		minValue: 'Lowest value',
		maxValue: 'Highest value',
		suits: 'Suits',
		copies: 'Copies',
		jokers: 'Jokers',
		editorTitle: 'Build it yourself',
		name: 'Name',
		namePlaceholder: 'e.g. Friday night',
		nameRequired: 'Please enter a name.',
		deckRow: 'Deck',
		addLevel: 'Level',
		addBlock: 'Block',
		blockPick: 'Pick a block',
		moreBlocks: 'More blocks',
		fewerBlocks: 'Fewer blocks',
		customBlock: 'Custom text',
		customPlaceholder: 'e.g. Four of a kind and a monkey',
		fixedValue: 'Fixed value',
		fixedValueHint: 'e.g. three 8s',
		removeBlock: 'Remove block: {b}',
		levelMenu: 'Menu for level {n}',
		moveUp: 'Move up',
		moveDown: 'Move down',
		removeLevel: 'Remove level',
		sortByDifficulty: 'Sort by difficulty',
		levelEmpty: 'No blocks yet',
		tooManyCards: 'Needs more cards than are in hand.',
		difficulty: 'Difficulty {d} of 10',
		difficultyUnknown: 'Difficulty not computable (free text)',
		yourLevel: 'Your level',
		levelOf: 'Level {n} of {total}',
		level: 'Level {n}',
		handNeeded: '{hand} cards in hand · {need} cards needed',
		handOnly: '{hand} cards in hand',
		nextLevel: 'Next level: {d}',
		completed: 'Level completed',
		notCompleted: 'Round over, not completed',
		pointsSheet: 'Points left in hand',
		pointsTotal: '{n} points',
		showAll: 'Show all levels',
		hideAll: 'Hide levels',
		invite: 'Invite players',
		finishedTitle: 'All levels completed!',
		finishedSummary: '{rounds} rounds · {points} points',
		finishedSummaryNoPoints: '{rounds} rounds',
		playAgain: 'Play again',
		toHistory: 'Back to history',
		openLevelsTitle: 'Open levels',
		whichLevel: 'Which level did you complete?',
		none: 'None',
		roundsSoFar: 'Round {n}',
		joinIntro: 'received via link',
		joinMore: '… and {n} more',
		joinPlay: 'Join',
		joinSaved: 'The game is saved to your history.',
		invalidLink: 'This link does not contain a valid game. Maybe it was copied incompletely?',
		noGame: 'No game open. Open a shared link or scan a QR code.',
		toStart: 'Go to start',
		shareTitle: 'Invite players',
		shareHint: 'The link contains the whole game. Anyone who opens it can play right away.',
		copyLink: 'Copy link',
		copied: 'Copied!',
		qrAlt: 'QR code with the link to the game',
		metaStart:
			'Create your own games for level-based card games, share them as a link or QR code and track your level and points while playing with real cards. Runs entirely in your browser, no account needed.',
		metaNew: 'Create a new game: roll levels by duration and difficulty, or build them yourself from blocks.',
		metaRandom: 'A random game in three steps: pick deck, duration and difficulty, check the level preview, start playing.',
		metaPrepare:
			'Compose levels from blocks such as three of a kind, run of four or run in one suit, with automatic description and difficulty.',
		metaPlay: 'Track your current level and points at the table. Open a shared link and join right away.'
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
