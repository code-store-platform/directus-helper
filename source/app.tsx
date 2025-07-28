import React, { useEffect, useState } from "react";
import { usePromise } from "./hooks/usePromise.js";
import { LoadingIndicator } from "./components/LoadingIndicator.js";
import { AppSettings } from "./utils/settingsUtils/interface.js";
import { getSettings } from "./utils/settingsUtils/settingsUtils.js";
import { SettingsProvider } from "./providers/SettingsProvider.js";
import { AppActionsForm } from "./components/AppActionsForm.js";
import { BusyProvider } from "./providers/BusyProvider.js";

export default function App() {
	const [loading, startPromise] = usePromise();
	const [settings, setSettings] = useState<AppSettings>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		startPromise(async () => {
			const settings = await getSettings();

			setSettings(settings);
		});
	}, []);

	if (loading) {
		return <LoadingIndicator label="Loading settings" />;
	}

	if (!settings) {
		return null;
	}

	return (
		<SettingsProvider settings={settings}>
			<BusyProvider>
				<AppActionsForm />
			</BusyProvider>
		</SettingsProvider>
	);
}
