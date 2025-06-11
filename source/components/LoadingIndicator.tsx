import React from 'react';
import {Text} from 'ink';
import Spinner from 'ink-spinner';

interface Props {
	label: string;
}

export const LoadingIndicator: React.FC<Props> = props => {
	return (
		<Text>
			<Text color="green">
				<Spinner type="dots" />
			</Text>
			{` ${props.label}`}
		</Text>
	);
};
