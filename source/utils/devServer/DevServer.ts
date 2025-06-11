import chokidar from "chokidar";
import path from "path";
import { HookBuildTask } from "./devServerTasks/hooksBuildTask.js";
import { EndpointBuildTask } from "./devServerTasks/endpointBuildTask.js";
import {
	DevServerStatusChangeCallback,
	StatusChangePayload,
} from "./interfaces.js";
import { BaseBuildTask } from "./devServerTasks/baseBuildTask.js";
import { BuildMode } from "./devServerTasks/interface.js";
import { InterfaceBuildTask } from "./devServerTasks/interfaceBuildTask.js";
// import { AssetsBuildTask } from "./devServerTasks/assetsBuildTask.js";
import { OperaionsBuildTask } from "./devServerTasks/operationsBuildTask.js";

export class DevServer {
	private readonly tasks: BaseBuildTask[] = [
		new HookBuildTask(),
		new EndpointBuildTask(),
		new InterfaceBuildTask(),
		// new AssetsBuildTask(),
		new OperaionsBuildTask(),
	];
	private statuses: Record<string, StatusChangePayload> = {};
	private onStatusChangeCallback: DevServerStatusChangeCallback | undefined;

	start(root: string) {
		for (const task of this.tasks) {
			task.setStatusChangeCallback((status) => {
				this.statuses[task.name] = status;
				this.onStatusChangeCallback?.(this.statuses);
			});

			chokidar
				.watch(path.resolve(root, "iamexpat-extensions", task.trigger), {
					ignored: ["**/node_modules/**/*", "**/.git/**/*", "**/dist/**/*"],
					ignoreInitial: true,
				})
				.on("all", (_, path) => {
					task.perform(path, BuildMode.Dev);
				});
		}
	}

	async buildProd(root: string) {
		for (const task of this.tasks) {
			const taskRoot = path.resolve(root, "iamexpat-extensions", task.trigger);
			this.appendStatusListener(task);
			task.perform(taskRoot, BuildMode.Prod);
		}
	}

	onStatusChange(callback: DevServerStatusChangeCallback) {
		this.onStatusChangeCallback = callback;
	}

	private appendStatusListener(task: BaseBuildTask) {
		task.setStatusChangeCallback((status) => {
			this.statuses[task.name] = status;
			this.onStatusChangeCallback?.(this.statuses);
		});
	}
}
