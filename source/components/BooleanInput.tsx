import React from "react";
import SelectInput from "ink-select-input";
import { useInput } from "ink";

interface Props {
	value?: boolean;
	onSelect?: (value: boolean) => void;
	onChange?: (value: boolean) => void;
	focused?: boolean;
	hideLabels?: boolean;
}

export const BooleanInput: React.FC<Props> = (props) => {
	const options: Item[] = [
		{ value: true, label: `Yes${!props.hideLabels ? " <y>" : ""}` },
		{ value: false, label: `No${!props.hideLabels ? " <n>" : ""}` },
	];
	const onSelect = (item: Item) => {
		props.onSelect?.(item.value);
	};

	const onChange = (item: Item) => {
		props.onChange?.(item.value);
	};

	useInput(
		(input) => {
			if (input.toLowerCase() === "y") {
				props.onSelect?.(true);
			}

			if (input.toLowerCase() === "n") {
				props.onSelect?.(false);
			}
		},
		{ isActive: !props.hideLabels && props.focused !== false },
	);

	let initialIndex = options.findIndex((item) => item.value === props.value);
	if (initialIndex === -1) {
		initialIndex = 0;
	}

	return (
		<SelectInput
			isFocused={props.focused}
			items={options}
			onSelect={onSelect}
			onHighlight={onChange}
			initialIndex={initialIndex}
		/>
	);
};

interface Item {
	value: boolean;
	label: string;
}
