import {useCallback} from 'react';
import {useBoolean} from './useBoolean.js';

export const usePromise = (): [
	boolean,
	(callback: () => Promise<void>) => void,
] => {
	const loading = useBoolean();

	const startPromise = useCallback(
		(callback: () => Promise<void>) => {
			loading.setTrue();
			callback().then(loading.setFalse);
		},
		[loading.setTrue, loading.setFalse],
	);

	return [loading.value, startPromise];
};
