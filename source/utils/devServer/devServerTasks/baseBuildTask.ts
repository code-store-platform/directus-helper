import { DevServerTaskStatus } from "../interfaces.js";
import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { BuildMode, StatusChangeCallback } from "./interface.js";
import { getSettings } from "../../settingsUtils/settingsUtils.js";

export abstract class BaseBuildTask {
	abstract name: string;
	abstract trigger: string;
	private notifyStatusChange: StatusChangeCallback | undefined;
	private pendingProcesses = 0;

	protected abstract getBuildRoots(
		cwd: string,
		mode: BuildMode,
	): Promise<string[] | null>;
	protected abstract onBuildDone(
		rootPath: string,
		mode: BuildMode,
	): Promise<void>;

	protected getBuildCommand(mode: BuildMode) {
		if (mode === BuildMode.Prod) {
			return "npm run build";
		}

		return "npm run build:q";
	}

	setStatusChangeCallback(callback: StatusChangeCallback) {
		this.notifyStatusChange = callback;
	}

	async perform(changePath: string, mode: BuildMode) {
		if (this.pendingProcesses) {
			return;
		}

		const buildRoots = await this.getBuildRoots(changePath, mode);

		if (!buildRoots?.length) {
			return;
		}

		const promises: Promise<void>[] = [];

		for (const buildRoot of buildRoots) {
			if (buildRoot.endsWith(".DS_Store")) {
				continue;
			}

			promises.push(this.startBuildProcess(buildRoot, mode));
		}

		await Promise.all(promises);
	}

	protected async getExtensionsRoots(mode: BuildMode) {
		const settings = await getSettings();
		const projectSettings = settings.project;

		if (!projectSettings) {
			return;
		}

		let targets = projectSettings.dev_targets;

		if (mode === BuildMode.Prod) {
			targets = targets.concat(projectSettings.targets || []);
		}

		return targets.map((folder) => path.resolve(process.cwd(), folder));
	}

	protected async copyBuild(targetPath: string, srcPath: string) {
		const buildPath = path.resolve(srcPath, "dist");
		const packageJsonPath = path.resolve(srcPath, "package.json");

		await fs.mkdir(path.resolve(targetPath, "dist"), { recursive: true });

		await fs.cp(buildPath, path.resolve(targetPath, "dist"), {
			recursive: true,
		});
		await fs.copyFile(
			packageJsonPath,
			path.resolve(targetPath, "package.json"),
		);
	}

	private async startBuildProcess(buildRoot: string, mode: BuildMode) {
		this.incrementPendingProcessesAmount();

		const hasNodeModules = await this.hasNodeModules(buildRoot);

		if (!hasNodeModules) {
			await this.installPackages(buildRoot);
		}

		this.notifyStatusChange?.({
			status: DevServerTaskStatus.Building,
		});

		const childProcess = exec(
			this.getBuildCommand(mode),
			{
				cwd: buildRoot,
			},
			async (err) => {
				this.decrementPendingProcessesAmount();

				if (!err) {
					try {
						await this.onBuildDone(buildRoot, mode);
						this.notifyStatusChange?.({
							status: DevServerTaskStatus.Done,
						});
					} catch {
						this.notifyStatusChange?.({
							status: DevServerTaskStatus.Error,
							message: "Post build job failed",
						});
					}

					return;
				}

				this.notifyStatusChange?.({
					status: DevServerTaskStatus.Error,
					message: err.message,
				});
			},
		);

		childProcess.stdout?.on("data", (data) => {
			this.notifyStatusChange?.({
				status: DevServerTaskStatus.Building,
				message: data.toString("utf-8"),
			});
		});
	}

	private async hasNodeModules(root: string) {
		const nodeModulesPath = path.resolve(root, "node_modules");

		try {
			await fs.access(nodeModulesPath);
			return true;
		} catch {
			return false;
		}
	}

	private installPackages(root: string) {
		this.incrementPendingProcessesAmount();

		this.notifyStatusChange?.({
			status: DevServerTaskStatus.InstallingPackages,
		});

		return new Promise<void>((res, rej) => {
			const childProcess = exec(
				"npm install",
				{
					cwd: root,
				},
				async (err) => {
					this.decrementPendingProcessesAmount();

					if (!err) {
						res();
						return;
					}

					rej();
				},
			);

			childProcess.stdout?.on("data", (data) => {
				this.notifyStatusChange?.({
					status: DevServerTaskStatus.InstallingPackages,
					message: data.toString("utf-8"),
				});
			});
		});
	}

	private incrementPendingProcessesAmount() {
		this.pendingProcesses += 1;
	}

	private decrementPendingProcessesAmount() {
		this.pendingProcesses = Math.max(this.pendingProcesses - 1, 0);
	}
}
