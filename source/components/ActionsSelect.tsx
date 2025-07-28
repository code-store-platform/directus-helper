import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import React, { useMemo } from "react";
import { Actions } from "../constants.js";
import figlet from "figlet";
import { useSettings } from "../providers/SettingsProvider.js";

interface Props {
	onSelection: (action: Actions) => void;
}

export const ActionsSelect: React.FC<Props> = (props) => {
	const { onSelection } = props;
	const title = useMemo(() => figlet.textSync("directus helper", "Small"), []);
	const hasProject = !!useSettings().settings.project;

	const items = [
		{ value: Actions.Migrate, label: "Migrate" },
		{ value: Actions.CopyToken, label: "Copy token for env" },
		!hasProject && { value: Actions.CreateProject, label: "Create project" },
		hasProject && { value: Actions.StartDev, label: "Start dev server" },
		hasProject && { value: Actions.BuildExtensions, label: "Build extensions" },
		hasProject && { value: Actions.ProjectSettings, label: "Project Settings" },
		{ value: Actions.Exit, label: "Exit" },
	].filter(Boolean) as Item[];

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
