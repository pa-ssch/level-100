import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
import { encodeRuleset } from './game/share';
import type { Ruleset } from './game/ruleset';
import { isLanguage } from './i18n';

type Route =
	| '/[[language=language]]/play'
	| '/[[language=language]]/prepare'
	| '/[[language=language]]/random'
	| '/[[language=language]]/new'
	| '/[[language=language]]/start';

/** Aufgelöster Pfad mit Query; resolve() kennt keine Suchparameter, der Pfad selbst ist aber aufgelöst. */
export function href(route: Route, language: string | undefined, query: Record<string, string> = {}): ResolvedPathname {
	const search = Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : '';
	return (resolve(route, { language: isLanguage(language) ? language : undefined }) + search) as ResolvedPathname;
}

export interface RulesetLinks {
	/** Spiel direkt starten bzw. fortsetzen (aus dem eigenen Verlauf). */
	play: ResolvedPathname;
	/** Beitreten-Ansicht, so wie sie ein Mitspieler über den geteilten Link sieht. */
	join: ResolvedPathname;
	edit: ResolvedPathname;
	duplicate: ResolvedPathname;
	/** Absoluter Teilen-Link. */
	share: string;
}

export async function rulesetLinks(ruleset: Ruleset, language: string | undefined, origin: string): Promise<RulesetLinks> {
	const r = await encodeRuleset(ruleset);
	return {
		play: href('/[[language=language]]/play', language, { r, go: '1' }),
		join: href('/[[language=language]]/play', language, { r }),
		edit: href('/[[language=language]]/prepare', language, { r }),
		duplicate: href('/[[language=language]]/prepare', language, { r, copy: '1' }),
		share: new URL(href('/[[language=language]]/play', language, { r }), origin).toString()
	};
}
