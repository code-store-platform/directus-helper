import fs from "node:fs/promises";
import path from "node:path";
import {
	dockerComposeFileTemplate,
	gitIgnoreFileTemplate,
} from "./projectFilesTemplate.js";

export interface ProjectCreationPayload {
	login: string;
	password: string;
	devTarget: string;
	port: string;
	shouldAddToGlobalConfigEnvironments: boolean;
}

export const createProject = async (payload: ProjectCreationPayload) => {
	await fs.writeFile(
		path.resolve(process.cwd(), "./docker-compose.yml"),
		dockerComposeFileTemplate(payload),
	);
	await fs.writeFile(
		path.resolve(process.cwd(), "./.gitignore"),
		gitIgnoreFileTemplate(payload.devTarget),
	);

	await fs.mkdir(path.resolve(process.cwd(), payload.devTarget), {
		recursive: true,
	});
};
