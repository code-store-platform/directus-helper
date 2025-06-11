import {AppSettings} from '../settingsUtils/interface.js';
import {DirectusEnvironment} from './DirectusEnvironment.js';

export class DirectusEnvironmentFabric {
	constructor(private readonly settings: AppSettings) {}

	async getEnv(envName: string) {
		const credentials = this.settings.environments[envName];

		if (!credentials) {
			return;
		}

		return new DirectusEnvironment(credentials);
	}
}
