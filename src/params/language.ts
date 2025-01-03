import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string): param is 'de-DE' | 'en-US' => {
	return param === 'de-DE' || param === 'en-US';
}) satisfies ParamMatcher;
