import {getWords} from '../getWords/getWords.js';

export const toCamelCase = (input: string) => {
	const [firstWord, ...words] = getWords(input);

	return [
		firstWord,
		...words.map(word => word[0]?.toUpperCase() + word.slice(1)),
	].join('');
};
