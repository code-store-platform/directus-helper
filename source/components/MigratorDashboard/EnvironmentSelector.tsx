import React from 'react';
import SelectInput from 'ink-select-input';
import {useSettings} from '../../providers/SettingsProvider.js';
import {useBoolean} from '../../hooks/useBoolean.js';
import {EnvironmentCreationForm} from './EnvironmentCreationForm.js';
import {EnvironmentConfiguration} from '../../utils/settingsUtils/interface.js';
import {useBusy} from '../../providers/BusyProvider.js';

interface Props {
	exclude?: string[];
	onSelect: (envName: string) => void;
}

export const EnvironmentSelector: React.FC<Props> = props => {
	const {settings, addEnv} = useSettings();
	const creatingNew = useBoolean();
	const busy = useBusy();

	const options: Item[] = Object.keys(settings.environments)
		.map(name => {
			return {
				label: name,
				value: name,
			};
		})
		.concat([
			{
				label: 'Create New',
				value: 'createNew',
			},
		])
		.filter(env => !props.exclude?.includes(env.value));

	const onSelect = (item: Item) => {
		if (item.value !== 'createNew') {
			props.onSelect(item.value);

			return;
		}

		busy.onBusy();
		creatingNew.setTrue();
	};

	const onCreate = (name: string, config: EnvironmentConfiguration) => {
		addEnv(name, config);
		creatingNew.setFalse();
		busy.onDone();
	};

	if (creatingNew.value) {
		return <EnvironmentCreationForm onCreate={onCreate} />;
	}

	return <SelectInput items={options} onSelect={onSelect} />;
};

interface Item {
	value: string;
	label: string;
}
