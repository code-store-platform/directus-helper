import { useId, useState } from "react";
import { InputWithLabel } from "./InputWithLabel.js";
import { Box, useFocus, useFocusManager, useInput } from "ink";
import SelectInput from "ink-select-input";
import { Props as TextInputProps } from "ink-text-input";
import React from "react";

interface Props {
	value: string[];
	onChange: (values: string[]) => void;
}

export const MultiSelectInput: React.FC<Props> = (props) => {
	const [newEntry, setNewEntry] = useState("");
	const inputId = useId();
	const { focus } = useFocusManager();

	const onAdd = () => {
		if (props.value.includes(newEntry)) {
			return;
		}

		props.onChange([...props.value, newEntry]);
		setNewEntry("");
	};

	const onRemove = (value: string) => {
		focus(inputId);
		props.onChange(props.value.filter((oldValue) => oldValue !== value));
	};

	return (
		<Box flexDirection="column">
			<EntryInput
				id={inputId}
				value={newEntry}
				onChange={setNewEntry}
				onComplete={onAdd}
			/>
			<OptionsList options={props.value} onSelect={onRemove} />
		</Box>
	);
};

const EntryInput: React.FC<
	TextInputProps & { id: string; onComplete: () => void; focused?: boolean }
> = (props) => {
	const { isFocused } = useFocus({ id: props.id });

	useInput((_, key) => {
		if (key.return && isFocused) {
			props.onComplete();
		}
	});

	return (
		<Box borderStyle="round" borderColor={isFocused ? "blue" : "grey"}>
			<InputWithLabel
				label="New entry in a list"
				focus={isFocused}
				{...props}
			/>
		</Box>
	);
};

interface ListProps {
	options: string[];
	onSelect: (value: string) => void;
	focused?: boolean;
}

const OptionsList: React.FC<ListProps> = (props) => {
	const { isFocused } = useFocus();

	const options = props.options.map((entry) => ({
		value: entry,
		label: entry,
	}));
	const onSelect = (item: { value: string }) => props.onSelect(item.value);

	return (
		<Box
			borderColor={isFocused ? "blue" : "grey"}
			borderTop={false}
			borderBottom={false}
			borderRight={false}
			borderStyle="round"
		>
			<SelectInput items={options} onSelect={onSelect} isFocused={isFocused} />
		</Box>
	);
};
