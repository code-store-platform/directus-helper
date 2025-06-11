import test from 'ava';
import {getWords} from './getWords.js';

test('should break kebab case', t => {
	const words = getWords('kebab-case-some-text');

	t.deepEqual(words, ['kebab', 'case', 'some', 'text']);
});

test('should break camel case', t => {
	const words = getWords('camelCaseSomeText');

	t.deepEqual(words, ['camel', 'case', 'some', 'text']);
});

test('should break nice mixed cases', t => {
	const words = getWords('mixedCases-words with whiteSpace  and other-staff');

	t.deepEqual(words, [
		'mixed',
		'cases',
		'words',
		'with',
		'white',
		'space',
		'and',
		'other',
		'staff',
	]);
});
