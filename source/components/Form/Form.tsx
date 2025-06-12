import React, { useMemo, useState } from "react";
import { Box, Text, useFocus, useFocusManager, useInput } from "ink";
import { Field } from "./interfaces.js";
import { BooleanInput } from "../BooleanInput.js";
import { MultiSelectInput } from "../MultiSelectInput.js";
import { Button } from "../Button.js";
import { InputWithLabel } from "../InputWithLabel.js";
import { useArrowFocus } from "../../hooks/useArrowFocus.js";
import figlet from "figlet";

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
	const [errors, setErrors] = useState<Record<string, string>>({});
	const title = useMemo(() => {
		return figlet.textSync(props.title || "", { font: "Small" });
	}, [props.title]);
	useArrowFocus();

	const { focusNext } = useFocusManager();
	const onChange = (fieldName: string) => (value: unknown) => {
		setResult((prevState) => ({ ...prevState, [fieldName]: value }));
	};

	const onFinalChange = (fieldName: string) => (value: unknown) => {
		onChange(fieldName)(value);
		focusNext();
	};

	const onSubmit = () => {
		const errors: Record<string, string> = {};
		for (const field of props.fields) {
			if (field.required && !result[field.name]) {
				errors[field.name] = "This field is required";
			}

			if (
				field.required &&
				field.type === "string[]" &&
				!(result[field.name] as string[])?.length
			) {
				errors[field.name] = "This field is required";
			}

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const errorMessage = field.validate?.(result[field.name] as any);

			if (errorMessage) {
				errors[field.name] = errorMessage;
			}
		}

		if (Object.keys(errors).length) {
			setErrors(errors);
			return;
		}

		props.onSubmit(result);
	};
	const onClear = () => {
		setResult(initialValue);
	};

	useInput((input, key) => {
		if (key.ctrl && input === "s") {
			onSubmit();
			return;
		}

		if (key.ctrl && input === "q") {
			props.onCancel?.();
			return;
		}

		if (key.ctrl && input === "r") {
			onClear();
			return;
		}
	});

	return (
		<Box flexDirection="column" gap={2}>
			{Boolean(title) && (
				<Box justifyContent="center">
					<Text>{title}</Text>
				</Box>
			)}
			<Box flexDirection="column" gap={1}>
				{props.fields.map((field, index) => {
					return (
						<FieldViewContainer
							{...field}
							key={field.name}
							error={errors[field.name]}
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
			<Box width="100%" justifyContent="center" flexDirection="column">
				<Text color="gray">Press (tab) to move to next field</Text>
				<Text color="gray">Press (shift + tab) to move to prev field</Text>
				<Text color="gray">Press (cntrl + return) to submit</Text>
				{Boolean(props.onCancel) && (
					<Text color="gray">Press (cntrl + q) to cancel</Text>
				)}
				{props.clearable && (
					<Text color="gray">Press (cntrl + r) to reset to default value</Text>
				)}
			</Box>
		</Box>
	);
};

type FieldViewProps<T extends Field> = T & {
	value: unknown;
	autoFocus?: boolean;
	focused?: boolean;
	error?: string;
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
	let borderColor = field.focused ? "blue" : "grey";
	if (field.error) {
		borderColor = "red";
	}

	const ErrorText = field.error ? <Text color="red">{field.error}</Text> : null;

	if (field.type === "string") {
		return (
			<Box borderColor={borderColor} borderStyle="round" flexDirection="column">
				<InputWithLabel
					label={field.label}
					focus={field.focused}
					value={(field.value as string) || ""}
					onChange={field.onChange}
				/>
				{ErrorText}
			</Box>
		);
	}

	if (field.type === "boolean") {
		return (
			<Box
				borderColor={borderColor}
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
				{ErrorText}
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
				{ErrorText}
			</Box>
		);
	}

	return null;
};
