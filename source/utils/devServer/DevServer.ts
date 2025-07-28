import chokidar from "chokidar";
import path from "node:path";
import { HookBuildTask } from "./devServerTasks/hooksBuildTask.js";
import { EndpointBuildTask } from "./devServerTasks/endpointBuildTask.js";
import {
	DevServerStatusChangeCallback,
	StatusChangePayload,
} from "./interfaces.js";
import { BaseBuildTask } from "./devServerTasks/baseBuildTask.js";
import { BuildMode } from "./devServerTasks/interface.js";
import { InterfaceBuildTask } from "./devServerTasks/interfaceBuildTask.js";
import { OperaionsBuildTask } from "./devServerTasks/operationsBuildTask.js";
import { getSettings } from "../settingsUtils/settingsUtils.js";

export class DevServer {
	private readonly tasks: BaseBuildTask[] = [
		new HookBuildTask(),
		new EndpointBuildTask(),
		new InterfaceBuildTask(),
		new OperaionsBuildTask(),
	];
	private statuses: Record<string, StatusChangePayload> = {};
	private onStatusChangeCallback: DevServerStatusChangeCallback | undefined;

	async start() {
		const settings = await getSettings();
		const projectSettings = settings.project;

		if (!projectSettings) {
			return;
		}

		for (const task of this.tasks) {
			task.setStatusChangeCallback((status) => {
				this.statuses[task.name] = status;
				this.onStatusChangeCallback?.(this.statuses);
			});

			chokidar
				.watch(
					path.resolve(process.cwd(), projectSettings.src_dir, task.trigger),
					{
						ignored: ["**/node_modules/**/*", "**/.git/**/*", "**/dist/**/*"],
						ignoreInitial: true,
					},
				)
				.on("all", (_, path) => {
					task.perform(path, BuildMode.Dev);
				});
		}
	}

	async buildProd() {
		const settings = await getSettings();
		const projectSettings = settings.project;

		if (!projectSettings) {
			return;
		}

		for (const task of this.tasks) {
			const taskRoot = path.resolve(
				process.cwd(),
				projectSettings.src_dir,
				task.trigger,
			);
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
