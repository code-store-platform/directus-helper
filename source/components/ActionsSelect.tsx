import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import React, { useMemo } from "react";
import { Actions } from "../constants.js";
import figlet from "figlet";

interface Props {
	onSelection: (action: Actions) => void;
}

export const ActionsSelect: React.FC<Props> = (props) => {
	const { onSelection } = props;
	const title = useMemo(() => figlet.textSync("directus helper", "Small"), []);

	const items: Item[] = [
		{ value: Actions.Migrate, label: "Migrate" },
		{ value: Actions.StartDev, label: "Start dev server" },
		{ value: Actions.BuildExtensions, label: "Build extensions" },
		{ value: Actions.CopyToken, label: "Copy token for env" },
		{ value: Actions.Settings, label: "Settings" },
		{ value: Actions.Exit, label: "Exit" },
	];

	const handleSelect = (item: Item) => {
		onSelection(item.value);
	};

	return (
		<Box flexDirection="column">
			<Text>{title}</Text>
			<SelectInput items={items} onSelect={handleSelect} />
		</Box>
	);
};

interface Item {
	value: Actions;
	label: string;
}
