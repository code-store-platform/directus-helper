import { Box, Text, useInput } from "ink";
import React, { useState } from "react";
import { Actions } from "../constants.js";
import { useBusy } from "../providers/BusyProvider.js";
import { BuildMode } from "../utils/devServer/devServerTasks/interface.js";
import { ActionsSelect } from "./ActionsSelect.js";
import { AddDatabaseForm } from "./AddDatabaseForm.js";
import { CopyTokenScreen } from "./CopyTokenScreen.js";
import { DevServerDashboard } from "./DevServerDashboard/DevServerDashboard.js";
import { MigratorDashboard } from "./MigratorDashboard/MigratorDashboard.js";
import { ProjectCreationDashboard } from "./ProjectCreationDashboard/ProjectCreationDashboard.js";
import { ProjectSettingsScreen } from "./SettingsScreen/SettingsScreen.js";
import { DatabaseMigratorDashboard } from "./DatabaseMigratroDashboard/DatabaseMigratorDashboard.js";

export const AppActionsForm: React.FC = () => {
	const [action, setAction] = useState<Actions>();
	const busy = useBusy();
	const shouldCloseOnPressQ =
		!busy.busy && action && action !== Actions.ProjectSettings;

	useInput(
		(input) => {
			if (input === "q" && shouldCloseOnPressQ) {
				onClose();
			}
		},
		{ isActive: shouldCloseOnPressQ },
	);

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
			{action === Actions.Migrate && (
				<MigratorDashboard onFinish={() => setAction(undefined)} />
			)}
			{action === Actions.BuildExtensions && (
				<DevServerDashboard mode={BuildMode.Prod} />
			)}
			{action === Actions.CopyToken && (
				<CopyTokenScreen onFinish={() => setAction(undefined)} />
			)}
			{action === Actions.MigrateDatabase && (
				<DatabaseMigratorDashboard onFinish={() => setAction(undefined)} />
			)}
			{action === Actions.AddDatabase && (
				<AddDatabaseForm onFinish={() => setAction(undefined)} />
			)}
			{action === Actions.CreateProject && (
				<ProjectCreationDashboard onFinish={() => setAction(undefined)} />
			)}
			{action === Actions.ProjectSettings && (
				<ProjectSettingsScreen onFinish={() => setAction(undefined)} />
			)}
			{!action && <ActionsSelect onSelection={handleActionSelection} />}
			{shouldCloseOnPressQ && (
				<Box width="100%" justifyContent="center">
					<Text color="gray">Press (q) to exit to the main menu</Text>
				</Box>
			)}
		</Box>
	);
};
