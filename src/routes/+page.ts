import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	if (navigator.language.toLowerCase().startsWith('de')) throw redirect(301, 'de-DE/start');
	else throw redirect(301, 'en-US/start');
};
