import { defineParams } from '@sveltejs/kit/params';

const matchLanguage = (param: string): param is 'de-DE' | 'en-US' => {
	return param === 'de-DE' || param === 'en-US';
};

export const params = defineParams({
	language: (param) => (matchLanguage(param) ? param : undefined)
});
