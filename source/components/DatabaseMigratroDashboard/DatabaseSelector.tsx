import React from "react";
import SelectInput from "ink-select-input";
import { useSettings } from "../../providers/SettingsProvider.js";

interface Props {
	exclude?: string[];
	onSelect: (envName: string) => void;
}

export const DatabaseSelector: React.FC<Props> = (props) => {
	const { settings } = useSettings();

	const options: Item[] = Object.keys(settings.global.databases)
		.map((name) => {
			return {
				label: name,
				value: name,
			};
		})
		.filter((connection) => !props.exclude?.includes(connection.value));

	const onSelect = (item: Item) => {
		props.onSelect(item.value);
	};

	return <SelectInput items={options} onSelect={onSelect} />;
};

interface Item {
	value: string;
	label: string;
}
