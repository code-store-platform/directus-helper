import path from 'path';

export const findRoot = (
	start: string,
	target: string,
	pathLevel = 0,
): string | null => {
	let startPath = start;
	const sufix = buildPathLevelSufix(pathLevel);

	while (startPath !== path.sep) {
		if (path.resolve(startPath, sufix).endsWith(path.sep + target)) {
			return startPath;
		}

		startPath = path.resolve(startPath, '..');
	}

	return null;
};

const buildPathLevelSufix = (level: number) => {
	let result = '';

	for (let i = 0; i < level; i++) {
		result += '../';
	}

	return result;
};
