import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	if (params.exampleParam === 'test') error(404, 'Not found');
	else
		return {
			title: `Hello ${params.exampleParam}!`,
			content: 'Welcome to our blog. Lorem ipsum dolor sit amet'
		};
};
