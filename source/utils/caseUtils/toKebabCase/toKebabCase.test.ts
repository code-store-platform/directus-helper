import test from 'ava';
import {toKebabCase} from './toKebabCase.js';

test('should convert to kebab case', t => {
	const result = toKebabCase('some-mixed-Case that shouldBeConverted');

	t.assert(result === 'some-mixed-case-that-should-be-converted');
});
