import {toCamelCase} from '../../caseUtils/toCamelCase/toCamelCase.js';
import {toKebabCase} from '../../caseUtils/toKebabCase/toKebabCase.js';

export const getContentWithImport = (name: string, content: string) => {
	const lastImportLine = Array.from(content.matchAll(/import.+from.+\n/g)).at(
		-1,
	);

	if (!lastImportLine) {
		return content;
	}

	const sliceIndex = (lastImportLine?.index || 0) + lastImportLine[0]?.length;

	const importsSection = content.slice(0, sliceIndex);
	const mainContentSection = content.slice(sliceIndex);

	return [
		importsSection,
		`import { ${toCamelCase(name)}Endpoint } from './${toKebabCase(name)}'\n`,
		mainContentSection,
	].join('');
};
