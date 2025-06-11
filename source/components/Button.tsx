import { Box, Text, useFocus, useInput } from "ink";
import React from "react";

interface Props {
	text: string;
	onClick: () => void;
}

export const Button: React.FC<Props> = (props) => {
	const { isFocused } = useFocus();

	useInput((_, key) => {
		if (key.return && isFocused) {
			props.onClick();
		}
	});

	return (
		<Box
			paddingX={1}
			borderColor={isFocused ? "blue" : "grey"}
			borderTop
			borderLeft
			borderRight
			borderBottom
			borderStyle="single"
		>
			<Text>{props.text}</Text>
		</Box>
	);
};
