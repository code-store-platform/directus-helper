import test from 'ava';
import {getContentWithImport} from './getContentWithImport.js';

const lineToBeAppended = "import { someTestEndpoint } from './some-test'";
const startContent = `
import 1 from 1;
import 2 from 2;

const some othesr staff
	`;
let processedContent = '';

test.beforeEach(() => {
	processedContent = getContentWithImport('some test', startContent);
});

test('should append import', t => {
	const lines = processedContent.split('\n').map(line => line.trim());

	t.assert(lines.includes(lineToBeAppended));
});

test('should be after all imports', t => {
	const lines = processedContent.split('\n').map(line => line.trim());
	const lineIndex = lines.findIndex(line => line === lineToBeAppended);

	t.assert(lines[lineIndex - 1]?.startsWith('import'));
	t.assert(!lines[lineIndex + 1]?.startsWith('import'));
});
