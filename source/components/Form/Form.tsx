import React, { useState } from "react";
import { Box, Text, useFocus, useFocusManager, useInput } from "ink";
import { Field } from "./interfaces.js";
import { BooleanInput } from "../BooleanInput.js";
import { MultiSelectInput } from "../MultiSelectInput.js";
import { Button } from "../Button.js";
import { InputWithLabel } from "../InputWithLabel.js";

interface Props {
	title?: string;
	fields: Field[];
	onSubmit: (result: Record<string, unknown>) => void;
	onCancel?: () => void;
	clearable?: boolean;
}

export const Form: React.FC<Props> = (props) => {
	const initialValue = props.fields.reduce<Record<string, unknown>>(
		(acc, field) => {
			acc[field.name] = field.deafultValue;
			return acc;
		},
		{},
	);
	const [result, setResult] = useState(initialValue);

	const { focusNext } = useFocusManager();
	const onChange = (fieldName: string) => (value: unknown) => {
		setResult((prevState) => ({ ...prevState, [fieldName]: value }));
	};

	const onFinalChange = (fieldName: string) => (value: unknown) => {
		onChange(fieldName)(value);
		focusNext();
	};

	const onSubmit = () => {
		props.onSubmit(result);
	};
	const onClear = () => {
		setResult(initialValue);
	};

	return (
		<Box flexDirection="column" gap={2}>
			{Boolean(props.title) && (
				<Box justifyContent="center">
					<Text>{props.title}</Text>
				</Box>
			)}
			<Box flexDirection="column" gap={1}>
				{props.fields.map((field, index) => {
					return (
						<FieldViewContainer
							{...field}
							key={field.name}
							autoFocus={index === 0}
							value={result[field.name]}
							onChange={onChange(field.name)}
							onFinalChange={onFinalChange(field.name)}
						/>
					);
				})}
			</Box>

			<Box gap={1}>
				<Button text="Submit" onClick={onSubmit} />
				{props.onCancel && <Button text="Cancel" onClick={props.onCancel} />}
				{props.clearable && <Button text="Clear" onClick={onClear} />}
			</Box>
		</Box>
	);
};

type FieldViewProps<T extends Field> = T & {
	value: unknown;
	autoFocus?: boolean;
	focused?: boolean;
	onChange: (value: NonNullable<T["deafultValue"]>) => void;
	onFinalChange: (value: NonNullable<T["deafultValue"]>) => void;
};

const FieldViewContainer = (field: FieldViewProps<Field>) => {
	const { isFocused } = useFocus({
		autoFocus: field.autoFocus,
		isActive: field.type !== "string[]",
	});
	const { focusNext } = useFocusManager();

	useInput((_, key) => {
		if (key.return && isFocused) {
			focusNext();
		}
	});

	return <FieldView {...field} focused={isFocused} />;
};

const FieldView = <T extends Field>(field: FieldViewProps<T>) => {
	if (field.type === "string") {
		return (
			<Box borderColor={field.focused ? "blue" : "grey"} borderStyle="round">
				<InputWithLabel
					label={field.label}
					focus={field.focused}
					value={(field.value as string) || ""}
					onChange={field.onChange}
				/>
			</Box>
		);
	}

	if (field.type === "boolean") {
		return (
			<Box
				borderColor={field.focused ? "blue" : "grey"}
				borderTop={false}
				borderBottom={false}
				borderRight={false}
				borderStyle="round"
				flexDirection="column"
			>
				{field.label && <Text>{field.label}</Text>}
				<BooleanInput
					value={!!field.value}
					hideLabels
					onChange={field.onChange}
					focused={field.focused}
				/>
			</Box>
		);
	}

	if (field.type === "string[]") {
		return (
			<Box flexDirection="column">
				{field.label && <Text>{field.label}</Text>}
				<MultiSelectInput
					value={(field.value || []) as string[]}
					onChange={field.onChange}
				/>
			</Box>
		);
	}

	return null;
};
