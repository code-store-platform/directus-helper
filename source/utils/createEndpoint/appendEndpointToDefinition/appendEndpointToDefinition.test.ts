import test from 'ava';
import {appendEndpointToDefinition} from './appendEndpointToDefinition.js';

const startContent = `
  import { tokenizedPreviewEndpoint } from './tokenized-preview';
  import { similarJobsEndpoint } from './similar-jobs';

  // don't change naming of this constant, it is used by the helper utility
  const ENDPOINTS: Endpoint[] = [
    authorContentEndpoint,
    moreEventsEndpoint,
    relatedStoriesEndpoint,
    tokenizedPreviewEndpoint,
    similarJobsEndpoint,
  ];

  export default defineEndpoint((router, context) => {
    for (const endpoint of ENDPOINTS) {`;
const lineToAppend = 'someTestEndpoint,';
let processedContent = '';

test.beforeEach(() => {
	processedContent = appendEndpointToDefinition('some test', startContent);
});

test('should append definition', t => {
	const lines = processedContent.split('\n').map(line => line.trim());

	t.assert(lines.includes(lineToAppend));
});

test('should append in right place', t => {
	const lines = processedContent.split('\n').map(line => line.trim());

	const lineIndex = lines.findIndex(line => line === lineToAppend);

	t.assert(lineIndex !== -1);

	t.assert(lines[lineIndex - 1] === 'similarJobsEndpoint,');
	t.assert(lines[lineIndex + 1] === '];');
});
