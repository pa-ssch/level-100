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
		handSize: 'Handkarten',
		handSizeQ: 'Wie viele Handkarten?',
		handSizeHint: 'Gilt für alle Level.',
		modeQ: 'In welcher Reihenfolge?',
		modeFixed: 'Der Reihe nach',
		modeFree: 'Frei wählbar',
		minValue: 'Kleinster Wert',
		maxValue: 'Größter Wert',
		suits: 'Farben',
		copies: 'Sätze',
		jokers: 'Joker',
		jokersLine: '{n} Joker',
		jokersHint: 'Zählen nur für die Schwierigkeit.',
		// Editor
		editorTitle: 'Selbst zusammenstellen',
		name: 'Name',
		namePlaceholder: 'z. B. Freitagsrunde',
		nameRequired: 'Bitte einen Namen eingeben.',
		deckRow: 'Deck',
		addLevel: 'Level',
		add: 'Hinzufügen',
		blockPick: 'Bausteine wählen',
		blocksForLevel: 'Bausteine für Level {n}',
		editBlocks: 'Bausteine ändern',
		groupSets: 'Gleiche Werte',
		groupRuns: 'Folgen',
		groupSuitRuns: 'Farbfolgen',
		groupFlush: 'Eine Farbe',
		groupParity: 'Gerade oder ungerade',
		customBlock: 'Eigener Text',
		customBlockHint: 'Wird nicht geprüft und zählt nicht für die Schwierigkeit.',
		customPlaceholder: 'z. B. Ein Vierling und ein Affe',
		fixedValue: 'Fester Wert',
		fixedValueHint: 'z. B. drei 8er',
		fewer: 'Weniger: {b}',
		moreOf: 'Mehr: {b}',
		blocksFull: 'Mehr als {n} Bausteine passen nicht in ein Level.',
		cardsNeeded: '{need} Karten nötig · {hand} Handkarten',
		levelMenu: 'Menü für Level {n}',
		removeLevel: 'Level entfernen',
		sortByDifficulty: 'Nach Schwierigkeit sortieren',
		levelEmpty: 'Noch keine Bausteine',
		tooManyCards: 'Braucht mehr Karten, als auf der Hand sind.',
		impossible: 'Mit diesem Deck nicht legbar.',
		fixLevels: 'Erst die markierten Level anpassen, dann geht’s los.',
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
		invite: 'Spieler einladen',
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
		shareTitle: 'Spieler einladen',
		shareHint: 'Der Link enthält das komplette Spiel. Wer ihn öffnet, kann sofort mitspielen.',
		copyLink: 'Link kopieren',
		copied: 'Kopiert!',
		qrAlt: 'QR-Code mit dem Link zum Spiel',
		// Meta
		levels: 'Level',
		cancelGame: 'Spiel abbrechen',
		cancelGameConfirm: 'Laufendes Spiel „{name}“ abbrechen? Dein Stand geht verloren, das Spiel bleibt im Verlauf.',
		keep: 'Behalten',
		lastPlayed: 'zuletzt {d}',
		today: 'heute',
		yesterday: 'gestern',
		daysAgo: 'vor {n} Tagen',
		deckHint: 'Mit welchen echten Karten ihr spielt. Standard sind zwei Sätze 1–12 in vier Farben plus Joker.',
		orderHintFixed: 'Alle beginnen bei Level 1 und müssen jedes Level der Reihe nach schaffen.',
		orderHintFree: 'Jede Runde darf ein beliebiges noch offenes Level gelegt werden.',
		pointsHintOn: 'Nach jeder Runde zählt jeder die Restkarten auf seiner Hand als Punkte. Weniger ist besser.',
		pointsHintOff: 'Es zählt nur, wer zuerst alle Level schafft.',
		howLink: 'Wie geht das?',
		howTitle: 'So geht’s',
		how1: 'Ihr spielt ein Kartenspiel mit Stufen, mit echten Karten. Die App zählt nur mit: jeder Spieler auf dem eigenen Handy.',
		how2: 'Einer legt das Spiel an: Level würfeln lassen oder selbst aus Bausteinen bauen. Dann „Spieler einladen“ antippen.',
		how3: 'Alle anderen tippen auf „Spiel beitreten“ und scannen den QR-Code. Fertig, jeder sieht sein Level 1.',
		how4: 'Nach jeder Runde: „Level geschafft“ oder „Runde vorbei, nicht geschafft“, dann die Punkte der Restkarten eintragen.',
		how5: 'Wer alle Level geschafft hat, gewinnt. Gespielte Spiele bleiben im Verlauf und lassen sich jederzeit wieder starten.',
		howOk: 'Alles klar',
		customName: 'Eigenes Spiel · {n} Level',
		savedDecks: 'Weitere Decks',
		newDeck: 'Neues Deck',
		deckEditorTitle: 'Deck anlegen',
		deckName: 'Name des Decks',
		deckNamePlaceholder: 'z. B. Skatblatt',
		deckDelete: 'Deck löschen',
		deckDeleteConfirm: 'Deck „{name}“ wirklich löschen? Spiele, die es verwenden, bleiben erhalten.',
		deckSave: 'Deck speichern und verwenden',
		deckSummary: '{min}–{max} · {suits} Farben · {copies}× · {jokers} Joker',
		scanTitle: 'QR-Code scannen',
		scanHint: 'Halte die Kamera auf den QR-Code des Mitspielers.',
		scanUnavailable: 'Keine Kamera verfügbar. Füge den Link stattdessen ein.',
		scanDenied: 'Kein Zugriff auf die Kamera. Füge den Link stattdessen ein.',
		scanStart: 'Kamera öffnen',
		inviteTitle: 'Spieler einladen',
		inviteHint: 'Mitspieler scannen den QR-Code oder öffnen den Link. Jeder spielt auf dem eigenen Handy.',
		showQr: 'QR-Code anzeigen',
		sendLink: 'Link senden',
		pointsToggle: 'Punkte zählen',
		pointsToggleOff: 'Keine Punkte',
		dragHandle: 'Level {n} verschieben (ziehen oder Pfeiltasten)',
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
		handSize: 'Cards in hand',
		handSizeQ: 'How many cards in hand?',
		handSizeHint: 'Applies to all levels.',
		modeQ: 'In which order?',
		modeFixed: 'In order',
		modeFree: 'Any order',
		minValue: 'Lowest value',
		maxValue: 'Highest value',
		suits: 'Suits',
		copies: 'Copies',
		jokers: 'Jokers',
		jokersLine: '{n} jokers',
		jokersHint: 'Only used for the difficulty estimate.',
		editorTitle: 'Build it yourself',
		name: 'Name',
		namePlaceholder: 'e.g. Friday night',
		nameRequired: 'Please enter a name.',
		deckRow: 'Deck',
		addLevel: 'Level',
		add: 'Add',
		blockPick: 'Pick blocks',
		blocksForLevel: 'Blocks for level {n}',
		editBlocks: 'Change blocks',
		groupSets: 'Same values',
		groupRuns: 'Runs',
		groupSuitRuns: 'Runs in one suit',
		groupFlush: 'One suit',
		groupParity: 'Even or odd',
		customBlock: 'Custom text',
		customBlockHint: 'Not checked and not counted for the difficulty.',
		customPlaceholder: 'e.g. Four of a kind and a monkey',
		fixedValue: 'Fixed value',
		fixedValueHint: 'e.g. three 8s',
		fewer: 'Fewer: {b}',
		moreOf: 'More: {b}',
		blocksFull: 'A level holds at most {n} blocks.',
		cardsNeeded: '{need} cards needed · {hand} in hand',
		levelMenu: 'Menu for level {n}',
		removeLevel: 'Remove level',
		sortByDifficulty: 'Sort by difficulty',
		levelEmpty: 'No blocks yet',
		tooManyCards: 'Needs more cards than are in hand.',
		impossible: 'Cannot be laid with this deck.',
		fixLevels: 'Fix the marked levels first, then you can start.',
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
		levels: 'Levels',
		cancelGame: 'Cancel game',
		cancelGameConfirm: 'Cancel the running game “{name}”? Your progress is lost, the game stays in your history.',
		keep: 'Keep',
		lastPlayed: 'last played {d}',
		today: 'today',
		yesterday: 'yesterday',
		daysAgo: '{n} days ago',
		deckHint: 'Which real cards you play with. The default is two sets of 1–12 in four suits plus jokers.',
		orderHintFixed: 'Everyone starts at level 1 and has to complete the levels in order.',
		orderHintFree: 'Each round you may lay down any level that is still open.',
		pointsHintOn: 'After each round, everyone counts the cards left in hand as points. Fewer is better.',
		pointsHintOff: 'Only who completes all levels first counts.',
		howLink: 'How does it work?',
		howTitle: 'How it works',
		how1: 'You play a level-based card game with real cards. The app only keeps score: every player on their own phone.',
		how2: 'One person creates the game: roll the levels or build them from blocks. Then tap “Invite players”.',
		how3: 'Everyone else taps “Join a game” and scans the QR code. Done, everyone sees their level 1.',
		how4: 'After each round: “Level completed” or “Round over, not completed”, then enter the points of the cards left in hand.',
		how5: 'Whoever completes all levels wins. Played games stay in your history and can be started again any time.',
		howOk: 'Got it',
		customName: 'Custom game · {n} levels',
		savedDecks: 'More decks',
		newDeck: 'New deck',
		deckEditorTitle: 'Create a deck',
		deckName: 'Deck name',
		deckNamePlaceholder: 'e.g. Skat deck',
		deckDelete: 'Delete deck',
		deckDeleteConfirm: 'Delete deck “{name}”? Games that use it are kept.',
		deckSave: 'Save deck and use it',
		deckSummary: '{min}–{max} · {suits} suits · {copies}× · {jokers} jokers',
		scanTitle: 'Scan QR code',
		scanHint: 'Point the camera at a player’s QR code.',
		scanUnavailable: 'No camera available. Paste the link instead.',
		scanDenied: 'No access to the camera. Paste the link instead.',
		scanStart: 'Open camera',
		inviteTitle: 'Invite players',
		inviteHint: 'Players scan the QR code or open the link. Everyone plays on their own phone.',
		showQr: 'Show QR code',
		sendLink: 'Send link',
		pointsToggle: 'Count points',
		pointsToggleOff: 'No points',
		dragHandle: 'Move level {n} (drag or arrow keys)',
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

/** Anzeigename eines Spiels; ohne Namen ein Fallback aus Levelzahl. */
export function displayName(language: string | undefined, name: string, levelCount: number): string {
	return name.trim() || t(language, 'customName', { n: levelCount });
}

/** „heute“, „gestern“, „vor n Tagen“ oder ein Datum. */
export function relativeDay(language: string | undefined, iso: string, now = new Date()): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	const days = Math.round((startOf(now) - startOf(date)) / 86_400_000);
	if (days <= 0) return t(language, 'today');
	if (days === 1) return t(language, 'yesterday');
	if (days < 14) return t(language, 'daysAgo', { n: days });
	return date.toLocaleDateString(isLanguage(language) ? language : defaultLanguage, {
		day: 'numeric',
		month: 'short',
		year: now.getFullYear() === date.getFullYear() ? undefined : 'numeric'
	});
}
