import {
	AppGlobalSettingsSchema,
	AppProjectSettingsSchema,
	AppSettings,
} from './interface.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {safeTryPromise} from '../safeTry/safeTry.js';
import envPaths from 'env-paths';

const configFolder = envPaths('directus-helper').config;
const globalSettingsPath = path.resolve(configFolder, '.settings.json');
const projectSettingsPath = path.resolve(process.cwd(), '.settings.json');
let settingsPreloaded: AppSettings | null = null;

const ensureConfigFolderExists = async () => {
	await fs.mkdir(configFolder, {recursive: true});
};

export const getSettings = async (): Promise<AppSettings> => {
	if (settingsPreloaded) {
		return settingsPreloaded;
	}

	let [globalSettings] = await safeTryPromise(async () =>
		AppGlobalSettingsSchema.parse(
			JSON.parse((await fs.readFile(globalSettingsPath)).toString('utf-8')),
		),
	);

	const [projectSettings] = await safeTryPromise(async () =>
		AppProjectSettingsSchema.parse(
			JSON.parse((await fs.readFile(projectSettingsPath)).toString('utf-8')),
		),
	);

	if (!globalSettings) {
		globalSettings = {
			environments: {},
		};

		await ensureConfigFolderExists();
		await fs.writeFile(globalSettingsPath, JSON.stringify(globalSettings));
	}

	return {global: globalSettings, project: projectSettings};
};

export const setSettings = async (settings: AppSettings) => {
	await ensureConfigFolderExists();
	await fs.writeFile(globalSettingsPath, JSON.stringify(settings.global));
	if (settings.project) {
		await fs.writeFile(projectSettingsPath, JSON.stringify(settings.project));
	}

	settingsPreloaded = settings;
};
