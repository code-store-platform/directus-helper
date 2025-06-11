import type {DirectusEnvironmentCredentials} from './interfaces.js';

export class UrlBuilder {
	private path = '';
	private searchParams: Record<string, string> = {};

	constructor(private readonly credentials: DirectusEnvironmentCredentials) {
		this.setQueryParameter('access_token', credentials.token);
	}

	setPath(path: string) {
		this.path = path;

		return this;
	}

	setQueryParameter(key: string, value: string) {
		this.searchParams[key] = value;

		return this;
	}

	build() {
		const searchParamsParts = [];

		for (const entry of Object.entries(this.searchParams)) {
			const [key, value] = entry;

			searchParamsParts.push(`${key}=${value}`);
		}

		const searchParamsString = searchParamsParts.length
			? '?' + searchParamsParts.join('&')
			: '';
		const url = new URL(this.credentials.link + this.path + searchParamsString);

		return url.toString();
	}
}
