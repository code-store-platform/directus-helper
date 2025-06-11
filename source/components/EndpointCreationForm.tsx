import React, {useState} from 'react';
import {Box, Text} from 'ink';
import {InputWithLabel} from './InputWithLabel.js';
import {createEndpoint} from '../utils/createEndpoint/createEndpoint.js';
import {LoadingIndicator} from './LoadingIndicator.js';
import {usePromise} from '../hooks/usePromise.js';

export const EndpointCreationForm: React.FC = () => {
	const [extensionName, setExtensionName] = useState<string>('');
	const [submited, setSubmited] = useState(false);
	const [loading, startPromise] = usePromise();

	const onSubmit = () => {
		setSubmited(true);

		startPromise(async () => {
			await createEndpoint(extensionName);
		});
	};

	return (
		<Box flexDirection="column" gap={1}>
			<Text color="blue">Creation of the endpoint</Text>
			{!submited && (
				<InputWithLabel
					label="Enter extension name:"
					value={extensionName}
					onChange={setExtensionName}
					onSubmit={onSubmit}
				/>
			)}
			{loading && <LoadingIndicator label="Creating extension" />}
		</Box>
	);
};
