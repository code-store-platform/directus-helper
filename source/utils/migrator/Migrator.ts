import { AppSettings } from "../settingsUtils/interface.js";
import { DirectusEnvironmentFabric } from "./DirectusEnvironmentFabric.js";
import { filterFieldsFolder } from "./filters.js";
import { StatusChangeCallback } from "./interfaces.js";

export class Migrator {
	private fabric: DirectusEnvironmentFabric;
	private notifyStatusChange: StatusChangeCallback | undefined;

	constructor(private settings: AppSettings) {
		this.fabric = new DirectusEnvironmentFabric(settings);
	}

	async migrate(srcName: string, targetName: string) {
		const target = await this.fabric.getEnv(targetName);
		const src = await this.fabric.getEnv(srcName);

		if (!target || !src) {
			throw new Error("Environments dont have configuration");
		}

		this.notifyStatusChange?.("Obtaining difference");
		const diff = await target.getDifference(src);

		if (diff) {
			diff.diff.fields = filterFieldsFolder(diff.diff.fields);

			this.notifyStatusChange?.("Applying difference");
			await target.applyDifference(diff);
		}

		if (this.settings.global.should_migrate_flows) {
			this.notifyStatusChange?.("Obtaining flows");
			const flows = await src.getFlows();
			this.notifyStatusChange?.("Appling flows");
			await target.createFlows(flows);
		}

		// this.notifyStatusChange?.('Obtaining roles');
		// const roles = await src.getRoles();
		// this.notifyStatusChange?.('Appending roles');
		// await target.appendRoles(roles);
		//
		// this.notifyStatusChange?.('Obtaining permisssions');
		// const permissions = await src.getPermissions();
		// this.notifyStatusChange?.('Appending permissions');
		// await target.appendPermissions(permissions);

		this.notifyStatusChange?.("Done");
	}

	onStatusChange(callback: StatusChangeCallback) {
		this.notifyStatusChange = callback;
	}
}
