import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React, { useState } from "react";
import { useBoolean } from "../../hooks/useBoolean.js";
import { useBusy } from "../../providers/BusyProvider.js";
import { useSettings } from "../../providers/SettingsProvider.js";
import { DatabaseMigrator } from "../../utils/databaseMigrator/DatabaseMigrator.js";
import { DatabaseMigrationWizard } from "./DatabaseMigrationWizard.js";

interface Props {
	onFinish: () => void;
}

export const DatabaseMigratorDashboard: React.FC<Props> = (props) => {
	const { settings } = useSettings();
	const [status, setStatus] = useState<string>();
	const [error, setError] = useState<string>();
	const inProgress = useBoolean();
	const busy = useBusy();

	const startMigration = (
		srcName: string,
		targetName: string,
		shouldNotifify: boolean,
	) => {
		const migrator = new DatabaseMigrator(settings);

		busy.onBusy();
		migrator.onStatusChange(setStatus);
		inProgress.setTrue();
		setStatus("Starting...");
		migrator
			.migrate(srcName, targetName)
			.then(async () => {
				const notificationHook = settings.global.notification_hook;

				if (notificationHook && shouldNotifify) {
					setStatus("Sending notification...");
					await fetch(notificationHook);
				}

				props.onFinish();
			})
			.catch((e) => {
				setError(e.message);
			})
			.finally(async () => {
				busy.onDone();
			});
	};

	if (!inProgress.value) {
		return <DatabaseMigrationWizard onSetupDone={startMigration} />;
	}

	if (error) {
		return (
			<Box flexDirection="column">
				<Text color="red">Error: {error}</Text>
				<Text color="grey">Last status: {status}</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="row" gap={1}>
			{inProgress.value && <Spinner />}
			<Text>{status}</Text>
		</Box>
	);
};
