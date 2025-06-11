import test from 'ava';
import {toCamelCase} from './toCamelCase.js';

test('Should convert to camel case', t => {
	const result = toCamelCase('some-mixed-Case that shouldBeConverted');

	t.assert(result === 'someMixedCaseThatShouldBeConverted');
});
