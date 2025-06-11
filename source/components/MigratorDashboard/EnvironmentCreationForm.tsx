import React, {useState} from 'react';
import zod from 'zod';
import {Box, Text} from 'ink';
import {EnvironmentConfiguration} from '../../utils/settingsUtils/interface.js';
import {InputWithLabel} from '../InputWithLabel.js';
import {useBoolean} from '../../hooks/useBoolean.js';

interface Props {
	onCreate: (name: string, configuration: EnvironmentConfiguration) => void;
}

export const EnvironmentCreationForm: React.FC<Props> = props => {
	const [name, setName] = useState('');
	const [link, setLink] = useState('');
	const [token, setToken] = useState('');

	const [linkError, setLinkError] = useState<string>();

	const nameIsDone = useBoolean();
	const linkIsDone = useBoolean();

	const onNameDone = () => {
		if (!name) {
			return;
		}

		nameIsDone.setTrue();
	};

	const onLinkDone = () => {
		const urlSchema = zod.string().url();
		const linkParsed = urlSchema.safeParse(link);

		if (linkParsed.success) {
			linkIsDone.setTrue();
			return;
		}

		setLinkError('Invalid format');
	};

	const onTokenDone = () => {
		if (!token) {
			return;
		}

		props.onCreate(name, {
			link,
			token,
		});
	};

	if (!nameIsDone.value) {
		return (
			<InputWithLabel
				label="Environment name"
				value={name}
				onChange={setName}
				onSubmit={onNameDone}
			/>
		);
	}

	if (!linkIsDone.value) {
		return (
			<Box flexDirection="column">
				<InputWithLabel
					label="Environment link"
					value={link}
					onChange={setLink}
					onSubmit={onLinkDone}
				/>
				{linkError && <Text color="red">{linkError}</Text>}
			</Box>
		);
	}

	return (
		<InputWithLabel
			label="Environment token"
			value={token}
			onChange={setToken}
			onSubmit={onTokenDone}
		/>
	);
};
