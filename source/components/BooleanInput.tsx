import React from 'react';
import SelectInput from "ink-select-input"
import { useInput } from 'ink';

interface Props {
	value?: boolean;
	onSelect: (value: boolean) => void;
}

export const BooleanInput: React.FC<Props> = (props) => {
	const options: Item[] = [{ value: true, label: 'Yes <y>' }, { value: false, label: 'No <n>' }]
	const onSelect = (item: Item) => {
		props.onSelect(item.value);
	}

	useInput(input => {
		if (input.toLowerCase() === 'y') {
			props.onSelect(true);
		}

		if (input.toLowerCase() === 'n') {
			props.onSelect(false);
		}
	});

	let initialIndex = options.findIndex(item => item.value === props.value);
	if (initialIndex === -1) {
		initialIndex = 0;
	}

	return <SelectInput items={options} onSelect={onSelect} initialIndex={initialIndex} />
}

interface Item {
	value: boolean;
	label: string;
}
