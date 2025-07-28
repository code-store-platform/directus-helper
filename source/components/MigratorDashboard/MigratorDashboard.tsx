import { Box, Text } from "ink";
import React, { useState } from "react";
import { Migrator } from "../../utils/migrator/Migrator.js";
import { useSettings } from "../../providers/SettingsProvider.js";
import { useBoolean } from "../../hooks/useBoolean.js";
import Spinner from "ink-spinner";
import { useBusy } from "../../providers/BusyProvider.js";
import { MigrationWizard } from "./MigrationWizard.js";

interface Props {
	onFinish: () => void;
}

export const MigratorDashboard: React.FC<Props> = (props) => {
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
		const migrator = new Migrator(settings);

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
		return <MigrationWizard onSetupDone={startMigration} />;
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
