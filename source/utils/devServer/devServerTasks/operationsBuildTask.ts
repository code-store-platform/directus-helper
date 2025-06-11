import { findRoot } from "../../findRoot/findRoot.js";
import { BaseBuildTask } from "./baseBuildTask.js";
import path from "path";
import fs from "fs/promises";
import { BuildMode } from "./interface.js";

export class OperaionsBuildTask extends BaseBuildTask {
	public readonly trigger = "./operations";
	public readonly name = "Operations";

	protected async getBuildRoots(cwd: string, mode: BuildMode) {
		if (mode === BuildMode.Dev) {
			return [findRoot(cwd, "operations", 1)].filter(Boolean) as string[];
		}

		const hooks = await fs.readdir(cwd);

		return hooks.map((hook) => path.resolve(cwd, hook));
	}

	protected override async onBuildDone(
		srcPath: string,
		mode: BuildMode,
	): Promise<void> {
		const roots = await this.getExtensionsRoots(mode);
		const operationName = srcPath.split(path.sep).at(-1);

		if (!roots?.length || !operationName) {
			throw new Error("cant build to path to the extension folder");
		}

		for (const root of roots) {
			const targetPath = path.resolve(
				root,
				`directus-extension-${operationName}`,
			);
			await this.copyBuild(targetPath, srcPath);
		}
	}
}
