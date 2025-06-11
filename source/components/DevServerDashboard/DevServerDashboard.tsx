import React, { useEffect, useRef, useState } from 'react';
import { Box, Text } from 'ink';
import { DevServer } from '../../utils/devServer/DevServer.js';
import { StatusChangePayload } from '../../utils/devServer/interfaces.js';
import { DashboardTask } from './DashboardTask.js';
import { BuildMode } from '../../utils/devServer/devServerTasks/interface.js';
import { DashboardBudge } from './DashboardBudge.js';
import { DirectusStatusBudge } from './DirectusStatusBudge.js';
import { useBusy } from '../../providers/BusyProvider.js';

interface Props {
	mode?: BuildMode;
}

export const DevServerDashboard: React.FC<Props> = props => {
	const devServer = useRef(new DevServer());
	const [statuses, setStatuses] = useState<Record<string, StatusChangePayload>>(
		{},
	);
	const busy = useBusy();

	useEffect(() => {
		devServer.current.onStatusChange(statuses => {
			setStatuses({ ...statuses });
		});

		if (props.mode === BuildMode.Prod) {
			busy.onBusy();
			devServer.current.buildProd().finally(busy.onDone);
			return;
		}

		devServer.current.start();
	}, []);

	return (
		<Box flexDirection="column" width="100%">
			{props.mode === BuildMode.Prod && (
				<DashboardBudge content="Precommit build" color="blueBright" />
			)}
			{props.mode !== BuildMode.Prod && <DirectusStatusBudge />}
			<Box
				alignItems="center"
				justifyContent="center"
				flexDirection="column"
				height={8}
				width="100%"
				gap={1}
			>
				<Text color="green">Dev server</Text>
				<Box gap={3}>
					{Object.keys(statuses).map(name => (
						<DashboardTask
							key={name}
							name={name}
							payload={statuses[name] as StatusChangePayload}
						/>
					))}
				</Box>
			</Box>
		</Box>
	);
};
