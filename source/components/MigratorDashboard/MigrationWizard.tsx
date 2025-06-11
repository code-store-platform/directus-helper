import { Box, Text } from 'ink';
import React, { useState } from 'react';
import { EnvironmentSelector } from './EnvironmentSelector.js';
import { BooleanInput } from '../BooleanInput.js';
import { useSettings } from '../../providers/SettingsProvider.js';

interface Props {
	onSetupDone: (src: string, target: string, shouldNotifify: boolean) => void;
}

export const MigrationWizard: React.FC<Props> = (props) => {
	const [srcName, setSrcName] = useState<string>('')
	const [targetName, setTargetName] = useState<string>('')
	const { settings } = useSettings();

	const onTargetNameSelected = (targetName: string) => {
		if (settings.notification_hook) {
			setTargetName(targetName);
			return
		}

		props.onSetupDone(srcName, targetName, false);
	}

	const onShouldNotifySelect = (shouldNotifify: boolean) => {
		props.onSetupDone(srcName, targetName, shouldNotifify)
	}

	if (!srcName) {
		return (
			<Box flexDirection="column">
				<Text>{'Source env selection'}</Text>
				<EnvironmentSelector onSelect={setSrcName} />
			</Box>
		);
	}

	if (!targetName) {
		return (
			<Box flexDirection="column">
				<Text>{'Target env selection'}</Text>
				<EnvironmentSelector onSelect={onTargetNameSelected} exclude={[srcName]} />
			</Box>
		);
	}

	if (settings.notification_hook) {
		return (
			<Box flexDirection="column">
				<Text>{'Should notify?'}</Text>
				<BooleanInput onSelect={onShouldNotifySelect} />
			</Box>
		)
	}

	return null
}
