import { Box, Text } from "ink";
import React from "react";
import TextInput, { Props as OriginalProps } from "ink-text-input";

interface Props extends OriginalProps {
	label?: string;
	validateRegExp?: RegExp;
}

export const InputWithLabel: React.FC<Props> = (props) => {
	const { label, onChange, ...rest } = props;

	const handleChange = (value: string) => {
		if (!props.validateRegExp || !value) {
			onChange(value);
			return;
		}

		if (!props.validateRegExp.test(value)) {
			return;
		}

		onChange(value);
	};

	if (!label) {
		return <TextInput {...rest} onChange={handleChange} />;
	}

	return (
		<Box>
			<Box marginRight={1}>
				<Text color="grey">{label}</Text>
			</Box>

			<TextInput {...rest} onChange={handleChange} />
		</Box>
	);
};
