import React, {useState} from 'react';
import {Box, Text} from 'ink';
import {AppSettings} from '../utils/settingsUtils/interface.js';
import path from 'path';
import {findRoot} from '../utils/findRoot/findRoot.js';
import SelectInput from 'ink-select-input';
import {useBoolean} from '../hooks/useBoolean.js';
import {InputWithLabel} from './InputWithLabel.js';

interface Props {
	onSubmit: (settings: AppSettings) => void;
}

export const SetupForm: React.FC<Props> = props => {
	const {onSubmit} = props;
	const [root, setRoot] = useState(getDefaultRoot());
	const useCustom = useBoolean();

	const options = [
		{value: 'useDefault', label: `Set root as ${root}`},
		{value: 'custom', label: 'Adjust root'},
	];

	const onSelect = (result: {value: string}) => {
		const {value} = result;

		if (value === 'useDefault') {
			onSubmit({
				root,
				environments: {},
			});
		}

		useCustom.setTrue();
	};

	const onSubmitCustomRoot = () => {
		onSubmit({
			root,
			environments: {},
		});
	};

	if (useCustom.value) {
		return (
			<InputWithLabel
				label="Type absolute path to root"
				value={root}
				onChange={setRoot}
				onSubmit={onSubmitCustomRoot}
			/>
		);
	}

	return (
		<Box flexDirection="column">
			<Text>Select option for root of the project: </Text>
			<SelectInput items={options} onSelect={onSelect} />
		</Box>
	);
};

const getDefaultRoot = () => {
	const helperRoot = findRoot(process.cwd(), 'helper');
	return helperRoot ? path.resolve(helperRoot, '..') : process.cwd();
};
