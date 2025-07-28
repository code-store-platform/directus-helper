import {
	AppGlobalSettingsSchema,
	AppProjectSettingsSchema,
	AppSettings,
} from "./interface.js";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { safeTryPromise } from "../safeTry/safeTry.js";

export const globalSettingsPath = path.resolve(
	os.homedir(),
	"./.config/.directus.helper.settings",
); // todo: make cross platform;
const projectSettingsPath = path.resolve(process.cwd(), ".settings.json");
let settingsPreloaded: AppSettings | null = null;

export const getSettings = async (): Promise<AppSettings> => {
	if (settingsPreloaded) {
		return settingsPreloaded;
	}

	let [globalSettings] = await safeTryPromise(async () =>
		AppGlobalSettingsSchema.parse(
			JSON.parse((await fs.readFile(globalSettingsPath)).toString("utf-8")),
		),
	);

	const [projectSettings] = await safeTryPromise(async () =>
		AppProjectSettingsSchema.parse(
			JSON.parse((await fs.readFile(projectSettingsPath)).toString("utf-8")),
		),
	);

	if (!globalSettings) {
		globalSettings = {
			environments: {},
		};
		await fs.writeFile(globalSettingsPath, JSON.stringify(globalSettings));
	}

	return { global: globalSettings, project: projectSettings };
};

export const setSettings = async (settings: AppSettings) => {
	await fs.writeFile(globalSettingsPath, JSON.stringify(settings.global));
	if (settings.project) {
		await fs.writeFile(projectSettingsPath, JSON.stringify(settings.project));
	}

	settingsPreloaded = settings;
};
