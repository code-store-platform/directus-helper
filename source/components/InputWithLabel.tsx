import { Box, Text } from "ink";
import React from "react";
import TextInput, { Props as OriginalProps } from "ink-text-input";

interface Props extends OriginalProps {
	label?: string;
}

export const InputWithLabel: React.FC<Props> = (props) => {
	const { label, ...rest } = props;

	if (!label) {
		return <TextInput {...rest} />;
	}

	return (
		<Box>
			<Box marginRight={1}>
				<Text>{label}</Text>
			</Box>

			<TextInput {...rest} />
		</Box>
	);
};
