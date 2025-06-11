import { Box, Text } from 'ink';
import React, { useState } from 'react';
import { useSettings } from '../../providers/SettingsProvider.js';
import TextInput from 'ink-text-input';
import { useBusyEffect } from '../../providers/BusyProvider.js';
import { CloseHint } from './CloseHint.js';

interface Props {
	onFinish: () => void;
}

export const RootChangeScreen: React.FC<Props> = (props) => {
	const { settings, changeOption } = useSettings();
	const [newValue, setNewValue] = useState('');

	useBusyEffect();

	const onSubmit = () => {
		changeOption('root', newValue);
		props.onFinish();
	}

	return <Box flexDirection='column' gap={1}>
		<Text color="greenBright">Type new value</Text>
		<TextInput value={newValue} onChange={setNewValue} onSubmit={onSubmit} />
		<Text color="gray">Current value: {settings.root || 'n/a'}</Text>
		<CloseHint />
	</Box>
}
