import {findRoot} from '../../findRoot/findRoot.js';
import {BaseBuildTask} from './baseBuildTask.js';
import path from 'path';
import {BuildMode} from './interface.js';

export class EndpointBuildTask extends BaseBuildTask {
	name = 'Endpoints';
	trigger = './api';

	protected async getBuildRoots(start: string) {
		const root = findRoot(start, 'api');

		if (!root) {
			return null;
		}

		return [root];
	}

	protected override async onBuildDone(
		srcPath: string,
		mode: BuildMode,
	): Promise<void> {
		const roots = await this.getExtensionsRoots(mode);

		if (!roots?.length) {
			throw new Error('cant build to path to the extension folder');
		}

		for (const root of roots) {
			const targetPath = path.resolve(root, './directus-extension-api');

			await this.copyBuild(targetPath, srcPath);
		}
	}
}
