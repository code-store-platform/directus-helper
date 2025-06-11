import React, { useContext, useState } from 'react';
import { AppSettings } from '../utils/settingsUtils/interface.js';
import { setSettings as persistSettings } from '../utils/settingsUtils/settingsUtils.js';
import { DEFAULT_EXTANSIONS_ROOTS } from '../constants.js';

interface ContextValue {
	settings: AppSettings;
	changeOption: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
	addEnv: (
		envName: string,
		configuration: AppSettings['environments'][string],
	) => void;
}

const initialValue: ContextValue = {
	settings: {
		root: '/',
		src_dir: 'src',
		extensions_roots: DEFAULT_EXTANSIONS_ROOTS,
		environments: {},
	},
	addEnv: () => { },
	changeOption: () => { },
};

const SettingsContext = React.createContext(initialValue);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<
	React.PropsWithChildren<{ settings: AppSettings }>
> = props => {
	const { children } = props;
	const [settings, setSettings] = useState(props.settings);

	const addEnv: ContextValue['addEnv'] = (name, config) => {
		updateSettings(prevState => ({
			...prevState,
			environments: {
				...prevState.environments,
				[name]: config,
			},
		}));
	};

	const changeOption: ContextValue['changeOption'] = (key, value) => {
		updateSettings(prevSettings => {
			return {
				...prevSettings,
				[key]: value,
			}
		})
	}


	const updateSettings = (update: (prev: AppSettings) => AppSettings) => {
		setSettings(prevState => {
			const newState = update(prevState);

			persistSettings(newState);

			return newState;
		});
	};

	const value: ContextValue = {
		settings,
		addEnv,
		changeOption,
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};
