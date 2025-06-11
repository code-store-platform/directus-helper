import test from 'ava';
import {splitExisting} from './splitExisting.js';

test('First array shound contain existing only', t => {
	const [existing] = splitExisting(['1', '2', '3'], ['2', '3', '4']);

	t.deepEqual(existing, ['2', '3']);
});

test('Second array shound contain not existing only', t => {
	const [_, newItems] = splitExisting(['1', '2', '3'], ['2', '3', '4']);

	t.deepEqual(newItems, ['4']);
});

test('Should work nice with empty existing', t => {
	const newItemsInput = ['2', '3', '4'];
	const [_, newItems] = splitExisting([], newItemsInput);

	t.deepEqual(newItems, newItemsInput);
});

test('Should work nice with empty both', t => {
	const [existing, newItems] = splitExisting([], []);

	t.deepEqual(existing, []);
	t.deepEqual(newItems, []);
});
