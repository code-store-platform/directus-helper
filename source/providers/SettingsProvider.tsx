import React, { useContext, useState } from "react";
import {
	AppSettings,
	EnvironmentConfiguration,
} from "../utils/settingsUtils/interface.js";
import { setSettings as persistSettings } from "../utils/settingsUtils/settingsUtils.js";
interface ContextValue {
	settings: AppSettings;
	changeOption: <K extends keyof AppSettings>(
		key: K,
		value: AppSettings[K],
	) => void;
	addEnv: (envName: string, configuration: EnvironmentConfiguration) => void;
	setSettings: (settings: AppSettings) => void;
}

const initialValue: ContextValue = {
	settings: {
		project: null,
		global: {
			environments: {},
		},
	},
	addEnv: () => { },
	changeOption: () => { },
	setSettings: () => { },
};

const SettingsContext = React.createContext(initialValue);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<
	React.PropsWithChildren<{ settings: AppSettings }>
> = (props) => {
	const { children } = props;
	const [settings, setSettings] = useState(props.settings);

	const addEnv: ContextValue["addEnv"] = (name, config) => {
		updateSettings((prevState) => ({
			...prevState,
			global: {
				...prevState.global,
				environments: {
					...prevState.global.environments,
					[name]: config,
				},
			},
		}));
	};

	const changeOption: ContextValue["changeOption"] = (key, value) => {
		updateSettings((prevSettings) => {
			return {
				...prevSettings,
				[key]: value,
			};
		});
	};

	const updateSettings = (update: (prev: AppSettings) => AppSettings) => {
		setSettings((prevState) => {
			const newState = update(prevState);

			persistSettings(newState);

			return newState;
		});
	};

	const value: ContextValue = {
		settings,
		addEnv,
		changeOption,
		setSettings(settings) {
			persistSettings(settings);
			setSettings(settings);
		},
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};
