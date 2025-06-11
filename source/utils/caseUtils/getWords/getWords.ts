export const getWords = (name: string) => {
	const separators = ['-', ' ', '_'];

	let word = '';
	let words: string[] = [];

	for (const char of name.split('')) {
		const isUpperCase = char.toUpperCase() === char;

		if (!isUpperCase) {
			word += char;
			continue;
		}

		words.push(word);
		word = char.toLowerCase();
	}

	if (word) {
		words.push(word);
	}

	for (const sep of separators) {
		words = words.flatMap(word => word.split(sep));
	}

	return words.map(word => word.toLowerCase().trim()).filter(Boolean);
};
