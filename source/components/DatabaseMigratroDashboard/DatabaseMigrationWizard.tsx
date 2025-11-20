import { Box, Text } from "ink";
import React, { useState } from "react";
import { DatabaseSelector } from "./DatabaseSelector.js";
import { useSettings } from "../../providers/SettingsProvider.js";

interface Props {
	onSetupDone: (src: string, target: string, shouldNotifify: boolean) => void;
}

export const DatabaseMigrationWizard: React.FC<Props> = (props) => {
	const [srcName, setSrcName] = useState<string>("");
	const [targetName, setTargetName] = useState<string>("");
	const { settings } = useSettings();

	const onTargetNameSelected = (targetName: string) => {
		if (settings.global.notification_hook) {
			setTargetName(targetName);
			return;
		}

		props.onSetupDone(srcName, targetName, false);
	};

	if (!srcName) {
		return (
			<Box flexDirection="column">
				<Text>{"Source env selection"}</Text>
				<DatabaseSelector onSelect={setSrcName} />
			</Box>
		);
	}

	if (!targetName) {
		return (
			<Box flexDirection="column">
				<Text>{"Target env selection"}</Text>
				<DatabaseSelector onSelect={onTargetNameSelected} exclude={[srcName]} />
			</Box>
		);
	}

	return null;
};
