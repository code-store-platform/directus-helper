import React from 'react';
import {Box, Text, TextProps} from 'ink';

interface Props extends TextProps {
	content?: string;
}

export const DashboardBudge: React.FC<Props> = props => {
	const {content, children, ...rest} = props;

	return (
		<Box width="100%" justifyContent="flex-end">
			<Box
				width="25%"
				justifyContent="center"
				borderTop
				borderLeft
				borderRight
				borderBottom
				borderStyle="round"
				borderColor={rest.color || 'blue'}
			>
				{content ? <Text {...rest}>{content}</Text> : null}
				{children}
			</Box>
		</Box>
	);
};
