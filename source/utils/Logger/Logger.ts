import fs from "node:fs/promises";
import path from "node:path";

export class Logger {
	private static path = process.cwd();

	private get logFilePath() {
		if (!Logger.path) {
			return undefined;
		}

		return path.resolve(Logger.path, "logs.log");
	}

	async logText(text: string, prefix = "TEXT") {
		let fileContent = "";

		console.log("path", this.logFilePath);
		if (!this.logFilePath) {
			return;
		}

		try {
			fileContent = (await fs.readFile(this.logFilePath)).toString();
		} catch { }

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

		return `[${prefix} TIME: ${now.toUTCString()}]`;
	}
}
