import React from 'react';
import {Box, Text} from 'ink';
import {
	DevServerTaskStatus,
	StatusChangePayload,
} from '../../utils/devServer/interfaces.js';
import {ForegroundColorName} from 'chalk';
import Spinner from 'ink-spinner';

interface Props {
	name: string;
	payload: StatusChangePayload;
}

export const DashboardTask: React.FC<Props> = props => {
	const {name, payload} = props;
	const status = statusMessage[payload.status];

	return (
		<Box flexDirection="column">
			<Box gap={2}>
				<Text color="blue">{name}</Text>
				<Text color={status.color}>{status.title}</Text>
				{payload.status === DevServerTaskStatus.Building && <Spinner />}
			</Box>
			{payload.message ? <Text color="grey">{payload.message}</Text> : null}
		</Box>
	);
};

const statusMessage: Record<
	DevServerTaskStatus,
	{title: string; color: ForegroundColorName}
> = {
	[DevServerTaskStatus.Building]: {
		title: 'Building',
		color: 'grey',
	},
	[DevServerTaskStatus.Error]: {
		title: 'Error occured while build',
		color: 'red',
	},
	[DevServerTaskStatus.Done]: {
		title: 'Build done',
		color: 'green',
	},
	[DevServerTaskStatus.InstallingPackages]: {
		title: 'Installing packgaes',
		color: 'yellow'
	}
};
