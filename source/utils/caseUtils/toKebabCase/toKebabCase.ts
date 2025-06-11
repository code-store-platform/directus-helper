import {getWords} from '../getWords/getWords.js';

export const toKebabCase = (input: string) => {
	return getWords(input).join('-');
};
