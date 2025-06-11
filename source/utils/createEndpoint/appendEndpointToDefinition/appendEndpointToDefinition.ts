import {toCamelCase} from '../../caseUtils/toCamelCase/toCamelCase.js';

export const appendEndpointToDefinition = (
	name: string,
	content: string,
): string => {
	const lines = content.split('\n');
	const result: string[] = [];
	let lookingForAppend = false;

	for (const line of lines) {
		const isEndpointLine = line.includes('const ENDPOINTS');

		if (isEndpointLine) {
			lookingForAppend = true;
		}

		if (!lookingForAppend) {
			result.push(line);
			continue;
		}

		const shouldAppend = line.trim() === '];';

		if (!shouldAppend) {
			result.push(line);
			continue;
		}

		lookingForAppend = false;
		result.push(`${toCamelCase(name)}Endpoint,`);
		result.push(line);
	}

	return result.join('\n');
};
