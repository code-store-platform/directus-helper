import { Box, Text } from 'ink';
import React from 'react';
import { useSettings } from '../../providers/SettingsProvider.js';
import { useBusyEffect } from '../../providers/BusyProvider.js';
import { CloseHint } from './CloseHint.js';
import { BooleanInput } from '../BooleanInput.js';

interface Props {
	onFinish: () => void;
}

export const ChangeShouldMigrateFlows: React.FC<Props> = (props) => {
	const { settings, changeOption } = useSettings();

	const initialValue = settings.should_migrate_flows === undefined ? false : settings.should_migrate_flows;
	useBusyEffect();

	const onSubmit = (newValue: boolean) => {
		changeOption('should_migrate_flows', newValue);
		props.onFinish();
	}

	return <Box flexDirection='column' gap={1}>
		<Text color="greenBright">Should migrate flows?</Text>
		<BooleanInput value={initialValue} onSelect={onSubmit} />
		<CloseHint />
	</Box>
}
