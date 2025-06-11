import fs from "fs/promises";
import path from "path";

export class Logger {
	private static path = "/";

	private get logFilePath() {
		return path.resolve(Logger.path, "logs.log");
	}

	static setPath(path: string) {
		Logger.path = path;
	}

	async logText(text: string, prefix = "TEXT") {
		let fileContent = "";

		try {
			fileContent = (await fs.readFile(this.logFilePath)).toString();
		} catch {}

		const newContent = [
			fileContent.toString(),
			this.generateLogHeader(prefix),
			text,
		]
			.filter(Boolean)
			.join("\n");

		await fs.writeFile(this.logFilePath, newContent);
	}

	async logError(error: string) {
		await this.logText(error, "ERROR");
	}

	async logObject(obj: unknown, prefix = "OBJ") {
		await this.logText(JSON.stringify(obj, null, 2), prefix);
	}

	async logResponse(response: { json: () => Promise<unknown> }) {
		const json = await response.json();
		await this.logObject(json, "RES");
	}

	private generateLogHeader(prefix: string) {
		const now = new Date();

		return `[${prefix} TIme: ${now.toUTCString()}]`;
	}
}
