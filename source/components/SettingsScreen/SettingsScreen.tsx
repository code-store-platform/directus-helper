import React, { useState } from "react";
import { Box, Text, useInput } from 'ink';
import SelectInput from "ink-select-input";
import { NotificationHookChangeScreen } from "./NotificationHookChangeScreen.js";
import { RootChangeScreen } from "./RootChangeScreen.js";
import { ChangeShouldMigrateFlows } from "./ShouldMigrateFlowsPicker.js";

interface Props {
	onFinish: () => void;
}

export const SettingsScreen: React.FC<Props> = () => {
	const [currentType, setCurrentType] = useState<OptionType | undefined>();

	const options: Option[] = [{
		label: `Change root`,
		value: OptionType.ChangeRoot,
	}, {
		label: `Change notification hook`,
		value: OptionType.ChangeNotificationHook
	},
	{
		label: `Change should migrate flow`,
		value: OptionType.ChangeShouldMigrateFlows
	}];

	const backToMenu = () => setCurrentType(undefined)

	useInput((key, options) => {
		if (options.ctrl && key === 'q') {
			backToMenu()
		}
	})

	if (currentType === OptionType.ChangeRoot) {
		return <RootChangeScreen onFinish={backToMenu} />
	}

	if (currentType === OptionType.ChangeNotificationHook) {
		return <NotificationHookChangeScreen onFinish={backToMenu} />
	}

	if (currentType === OptionType.ChangeShouldMigrateFlows) {
		return <ChangeShouldMigrateFlows onFinish={backToMenu} />
	}

	return (
		<Box flexDirection="column">
			<Text color="grey">Select setting: </Text>
			<SelectInput items={options} onSelect={(item) => setCurrentType(item.value)} />
		</Box>
	);

}

type Option = {
	label: string;
	value: OptionType;
}

export enum OptionType {
	ChangeRoot = 1,
	ChangeNotificationHook = 2,
	ChangeShouldMigrateFlows = 3,
}
