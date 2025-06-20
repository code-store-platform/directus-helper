import React from 'react';
import SelectInput from "ink-select-input";
import clipboard from 'clipboardy';
import { useSettings } from "../providers/SettingsProvider.js";

interface Props {
	onFinish: () => void;
}

export const CopyTokenScreen: React.FC<Props> = props => {
	const { onFinish } = props;
	const settings = useSettings();
	const items: Item[] = Object.entries(settings.settings.environments).map(entry => {
		const [name, data] = entry;

		return {
			label: name,
			value: data.token
		}
	})

	const handleSelect = (item: Item) => {
		clipboard.writeSync(item.value);
		onFinish();
	};

	return <SelectInput items={items} onSelect={handleSelect} />;
};

interface Item {
	value: string;
	label: string;
}
