import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { ActionsSelect } from './ActionsSelect.js';
import { Actions } from '../constants.js';
import { EndpointCreationForm } from './EndpointCreationForm.js';
import { DevServerDashboard } from './DevServerDashboard/DevServerDashboard.js';
import { BuildMode } from '../utils/devServer/devServerTasks/interface.js';
import { MigratorDashboard } from './MigratorDashboard/MigratorDashboard.js';
import { useBusy } from '../providers/BusyProvider.js';
import { CopyTokenScreen } from './CopyTokenScreen.js';
import { SettingsScreen } from './SettingsScreen/SettingsScreen.js';

export const AppActionsForm: React.FC = () => {
	const [action, setAction] = useState<Actions>();
	const busy = useBusy();

	useInput(input => {
		if (input === 'q') {
			onClose();
		}
	});

	const handleActionSelection = (action: Actions) => {
		if (action === Actions.Exit) {
			process.exit();
		}

		setAction(action);
	};

	const onClose = () => {
		if (busy.busy) {
			return;
		}

		busy.onDone();
		setAction(undefined);
	};

	return (
		<Box flexDirection="column" width="100%" gap={1}>
			{action === Actions.StartDev && <DevServerDashboard />}
			{action === Actions.Migrate && <MigratorDashboard onFinish={() => setAction(undefined)} />}
			{action == Actions.PreCommit && (
				<DevServerDashboard mode={BuildMode.Prod} />
			)}
			{action === Actions.CreateEndpoint && <EndpointCreationForm />}
			{action === Actions.CopyToken && <CopyTokenScreen onFinish={() => setAction(undefined)} />}
			{action === Actions.Settings && <SettingsScreen onFinish={() => setAction(undefined)} />}
			{!action && <ActionsSelect onSelection={handleActionSelection} />}
			{!busy.busy && action && (
				<Box width="100%" justifyContent="center">
					<Text color="gray">Press (q) to exit to the main menu</Text>
				</Box>
			)}
		</Box>
	);
};
