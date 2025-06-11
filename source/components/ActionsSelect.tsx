import React from 'react';
import SelectInput from 'ink-select-input';
import { Actions } from '../constants.js';

interface Props {
	onSelection: (action: Actions) => void;
}

export const ActionsSelect: React.FC<Props> = props => {
	const { onSelection } = props;

	const items: Item[] = [
		{ value: Actions.Migrate, label: 'Migrate' },
		{ value: Actions.StartDev, label: 'Start dev server' },
		{ value: Actions.PreCommit, label: 'Run precommit script' },
		{ value: Actions.CreateEndpoint, label: 'Create Endpoint' },
		{ value: Actions.CopyToken, label: 'Copy token for env' },
		{ value: Actions.Settings, label: 'Settings' },
		{ value: Actions.Exit, label: 'Exit' },
	];

	const handleSelect = (item: Item) => {
		onSelection(item.value);
	};

	return <SelectInput items={items} onSelect={handleSelect} />;
};

interface Item {
	value: Actions;
	label: string;
}
