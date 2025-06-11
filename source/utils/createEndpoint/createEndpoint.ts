import * as fs from 'fs/promises';
import path from 'path';
import {getContentWithImport} from './getContentWithImport/getContentWithImport.js';
import {appendEndpointToDefinition} from './appendEndpointToDefinition/appendEndpointToDefinition.js';
import {toKebabCase} from '../caseUtils/toKebabCase/toKebabCase.js';
import {toCamelCase} from '../caseUtils/toCamelCase/toCamelCase.js';
import {getSettings} from '../settingsUtils/settingsUtils.js';

export const createEndpoint = async (name: string) => {
	const settings = await getSettings();
	const rootDir = settings?.root;

	if (!rootDir) {
		throw new Error(
			"Can't find the path for current working directory. Looking for the extensions_iamexpat dir as parent in the " +
				process.cwd(),
		);
	}

	const apiDir = path.resolve(rootDir, 'iamexpat-extensions/api/src');
	const endpointDir = path.resolve(apiDir, toKebabCase(name));

	await fs.mkdir(endpointDir);
	await fs.writeFile(
		path.resolve(endpointDir, 'index.ts'),
		getBaseContent(name),
	);
	await appendEndpointIntoMainFile(name, apiDir);
};

const appendEndpointIntoMainFile = async (name: string, apiPath: string) => {
	const mainFile = path.resolve(apiPath, 'index.ts');
	const mainFileContent = (await fs.readFile(mainFile)).toString();

	const contentWithImport = getContentWithImport(name, mainFileContent);
	const contentWithDefinition = appendEndpointToDefinition(
		name,
		contentWithImport,
	);

	await fs.writeFile(mainFile, contentWithDefinition);
};

const getBaseContent = (name: string) => {
	return `import {Endpoint} from "../interfaces";

  export const ${toCamelCase(name)}Endpoint: Endpoint = {
	id: '${toKebabCase(name)}',
	handler(router, _context) {
		router.get('/', async (_req, res) => {
		  try {
  			res.send('Hello from /api/${toKebabCase(name)}!');
			} catch (e) {
				res.status(500).send((e as Error).message);
			}
		})
	},
  }
`;
};
