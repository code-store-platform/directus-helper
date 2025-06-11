import React, {useEffect, useState} from 'react';
import {usePromise} from './hooks/usePromise.js';
import {LoadingIndicator} from './components/LoadingIndicator.js';
import {AppSettings} from './utils/settingsUtils/interface.js';
import {
	getSettings,
	setSettings as persistSettings,
} from './utils/settingsUtils/settingsUtils.js';
import {SetupForm} from './components/SetupForm.js';
import {SettingsProvider} from './providers/SettingsProvider.js';
import {AppActionsForm} from './components/AppActionsForm.js';
import {BusyProvider} from './providers/BusyProvider.js';
import { Logger } from './utils/Logger/Logger.js';

export default function App() {
	const [loading, startPromise] = usePromise();
	const [settings, setSettings] = useState<AppSettings>();

	useEffect(() => {
		startPromise(async () => {
			const settings = await getSettings();

			if (!settings) {
				return;
			}

			Logger.setPath(settings.root);
			setSettings(settings);
		});
	}, []);

	const onSettingsSet = async (settings: AppSettings) => {
		startPromise(async () => {
			await persistSettings(settings);
			setSettings(settings);
		});
	};

	if (loading) {
		return <LoadingIndicator label="Loading settings" />;
	}

	if (!settings) {
		return <SetupForm onSubmit={onSettingsSet} />;
	}

	return (
		<SettingsProvider settings={settings}>
			<BusyProvider>
				<AppActionsForm />
			</BusyProvider>
		</SettingsProvider>
	);
}
