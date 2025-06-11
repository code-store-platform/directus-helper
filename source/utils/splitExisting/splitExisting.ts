export const splitExisting = <T>(
	existing: T[],
	itemsToSplit: T[],
	compare: Predicat<T> = (item1, item2) => item1 === item2,
): [T[], T[]] => {
	const existingResult = [];
	const newItemsResult = [];

	for (const item of itemsToSplit) {
		const itemExists = existing.some(existingItem =>
			compare(existingItem, item),
		);

		if (itemExists) {
			existingResult.push(item);

			continue;
		}

		newItemsResult.push(item);
	}

	return [existingResult, newItemsResult];
};

type Predicat<T> = (item1: T, item2: T) => boolean;
