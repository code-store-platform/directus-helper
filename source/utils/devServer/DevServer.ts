import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import chokidar from "chokidar";
import { safeTryPromise } from "../safeTry/safeTry.js";
import { getSettings } from "../settingsUtils/settingsUtils.js";
import {
	BuildMode,
	DevServerStatusChangeCallback,
	DevServerTaskStatus,
	StatusChangePayload,
} from "./interfaces.js";

export class DevServer {
	private statuses: Record<string, StatusChangePayload> = {};
	private onStatusChangeCallback: DevServerStatusChangeCallback | undefined;

	async start() {
		for (const folder of await this.getExtensionsFolders()) {
			chokidar
				.watch(folder, {
					ignored: ["**/node_modules/**/*", "**/.git/**/*", "**/dist/**/*"],
					ignoreInitial: true,
				})
				.on("all", () => {
					this.buildExtension(folder, BuildMode.Dev);
				});
		}
	}

	private async getExtensionsFolders() {
		const settings = await getSettings();
		const projectSettings = settings.project;

		if (!projectSettings) {
			return [];
		}

		const srcDir = path.resolve(process.cwd(), projectSettings.src_dir);
		const extensions = await fs.readdir(srcDir);

		return extensions.filter(folder => !folder.includes('.DS_Store')).map((folderBaseName) =>
			path.resolve(srcDir, folderBaseName),
		);
	}

	async buildProd() {
		const settings = await getSettings();
		const projectSettings = settings.project;

		if (!projectSettings) {
			return;
		}

		for (const folder of await this.getExtensionsFolders()) {
			this.buildExtension(folder, BuildMode.Prod);
		}
	}

	onStatusChange(callback: DevServerStatusChangeCallback) {
		this.onStatusChangeCallback = callback;
	}

	async buildExtension(extensionPath: string, mode: BuildMode) {
		const extensionName = path.basename(extensionPath);
		const status = this.statuses[extensionName];
		const settings = await getSettings();
		const targets =
			mode === BuildMode.Dev
				? settings.project?.dev_targets
				: settings.project?.targets;

		if (!targets?.length) {
			return;
		}

		const finishedBuildStatuses = [
			DevServerTaskStatus.Done,
			DevServerTaskStatus.Error,
		];
		const isPreviousBuildFinished =
			!status || finishedBuildStatuses.includes(status.status);

		if (!isPreviousBuildFinished) {
			return;
		}

		const hasNodeModules = await this.hasNodeModules(extensionPath);

		if (!hasNodeModules) {
			await this.installPackages(extensionPath);
		}

		this.setStatus(extensionName, {
			status: DevServerTaskStatus.Building,
		});

		const [_, err] = await safeTryPromise(() =>
			this.run(this.getBuildCommand(mode), extensionPath, (data) => {
				this.setStatus(extensionName, {
					status: DevServerTaskStatus.Building,
					message: data,
				});
			}),
		);

		if (err) {
			this.setStatus(extensionName, {
				status: DevServerTaskStatus.Error,
				message: (err as Error)?.message,
			});

			return;
		}

		const [, buildCopyError] = await safeTryPromise(() =>
			this.copyBuild(extensionPath, targets),
		);

		if (buildCopyError) {
			this.setStatus(extensionName, {
				status: DevServerTaskStatus.Error,
				message: `Build copy error: ${(buildCopyError as Error).message}`,
			});

			return;
		}

		this.setStatus(extensionName, {
			status: DevServerTaskStatus.Done,
		});
	}

	private async installPackages(root: string) {
		this.setStatus(root, { status: DevServerTaskStatus.InstallingPackages });

		await this.run("npm ci", root, (data) => {
			this.setStatus(root, {
				status: DevServerTaskStatus.InstallingPackages,
				message: data,
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

	private setStatus(extension: string, payload: StatusChangePayload) {
		const name = path.basename(extension);
		this.statuses[name] = payload;
		this.onStatusChangeCallback?.(this.statuses);
	}

	protected getBuildCommand(mode: BuildMode) {
		if (mode === BuildMode.Prod) {
			return "npm run build";
		}

		return "npm run build --no-minify";
	}

	protected async copyBuild(extensionPath: string, targets: string[]) {
		const buildPath = path.resolve(extensionPath, "dist");
		const packageJsonPath = path.resolve(extensionPath, "package.json");

		for (const target of targets) {
			const targetPath = path.resolve(
				process.cwd(),
				target,
				`directus-extension-${path.basename(extensionPath)}`,
			);

			await fs.mkdir(path.resolve(targetPath, "dist"), { recursive: true });

			await fs.cp(buildPath, path.resolve(targetPath, "dist"), {
				recursive: true,
			});
			await fs.copyFile(
				packageJsonPath,
				path.resolve(targetPath, "package.json"),
			);
		}
	}

	private run(command: string, cwd: string, onData?: (data: string) => void) {
		return new Promise<void>((res, rej) => {
			const childProcess = exec(
				command,
				{
					cwd,
				},
				async (err: unknown) => {
					if (!err) {
						res();
						return;
					}

					rej(err);
				},
			);

			if (onData) {
				childProcess.stdout?.on("data", (data) => {
					onData(data.toString("utf-8"));
				});
			}
		});
	}
}
