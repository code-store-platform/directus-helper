import {findRoot} from '../../findRoot/findRoot.js';
import {BaseBuildTask} from './baseBuildTask.js';
import path from 'path';
import fs from 'fs/promises';
import {BuildMode} from './interface.js';

export class InterfaceBuildTask extends BaseBuildTask {
	public readonly trigger = './interfaces';
	public readonly name = 'Interfaces';

	protected async getBuildRoots(cwd: string, mode: BuildMode) {
		if (mode === BuildMode.Dev) {
			return [findRoot(cwd, 'interfaces', 1)].filter(Boolean) as string[];
		}

		const interfaces = await fs.readdir(cwd);

		return interfaces.map(hook => path.resolve(cwd, hook));
	}

	protected override async onBuildDone(
		srcPath: string,
		mode: BuildMode,
	): Promise<void> {
		const roots = await this.getExtensionsRoots(mode);
		const interfacesName = srcPath.split(path.sep).at(-1);

		if (!roots?.length || !interfacesName) {
			throw new Error('cant build to path to the extension folder');
		}

		for (const root of roots) {
			const targetPath = path.resolve(
				root,
				`directus-extension-${interfacesName}`,
			);
			await this.copyBuild(targetPath, srcPath);
		}
	}
}
