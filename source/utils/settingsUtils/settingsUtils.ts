import {AppSettings, AppSettingsSchema} from './interface.js';
import fs from 'fs/promises';
import path from 'path';

const settingPath = path.resolve(process.cwd(), '.settings.json');
let settingsPreloaded: AppSettings | null = null;

export const getSettings = async () => {
	if (settingsPreloaded) {
		return settingsPreloaded;
	}

	let settingsRaw: object = {};

	try {
		settingsRaw = JSON.parse(
			(await fs.readFile(settingPath)).toString('utf-8'),
		);
	} catch {
		return null;
	}

	const settings = AppSettingsSchema.safeParse(settingsRaw);

	if (!settings.success) {
		console.error('Settings are corupted');
		return null;
	}

	settingsPreloaded = settings.data;
	return settings.data;
};

export const setSettings = async (setting: AppSettings) => {
	await fs.writeFile(settingPath, JSON.stringify(setting));
};
