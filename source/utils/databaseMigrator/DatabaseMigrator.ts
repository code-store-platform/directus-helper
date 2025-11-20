import envPaths from "env-paths";
import path from "node:path";
import { AppSettings } from "../settingsUtils/interface.js";
import { pgDump, pgRestore } from "pg-dump-restore";
import fs from "node:fs/promises";

type StatusChangeCallback = (status: string) => void;

const dataPath = envPaths("directus-helper").data;
const databaseDumpsFolder = path.join(dataPath, "./db_dumps");

export class DatabaseMigrator {
	private notifyStatusChange: StatusChangeCallback | undefined;

	constructor(private settings: AppSettings) {}

	async migrate(srcName: string, targetName: string) {
		const targetSettings = this.settings.global.databases[targetName];
		const srcSettings = this.settings.global.databases[srcName];

		if (!targetSettings || !srcSettings) {
			throw new Error("Environments dont have configuration");
		}

		await fs.mkdir(databaseDumpsFolder, { recursive: true });

		const dumpPath = path.resolve(databaseDumpsFolder, `${Date.now()}.sql`);
		this.notifyStatusChange?.("Making backup of src");

		try {
			await pgDump(srcSettings, { filePath: dumpPath });
		} catch {
			throw Error("Failed to make a backup of src");
		}

		try {
			await pgRestore(targetSettings, { filePath: dumpPath });
		} catch {
			throw Error("Failed to restore backup");
		}

		this.notifyStatusChange?.("Done");
	}

	onStatusChange(callback: StatusChangeCallback) {
		this.notifyStatusChange = callback;
	}
}
