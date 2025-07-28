import React from "react";
import { Form } from "../Form/Form.js";
import { Field } from "../Form/interfaces.js";
import { Box, Text } from "ink";
import zod from "zod";
import path from "node:path";
import { usePromise } from "../../hooks/usePromise.js";
import { LoadingIndicator } from "../LoadingIndicator.js";
import { createProject, ProjectCreationPayload } from "./createProject.js";
import { useSettings } from "../../providers/SettingsProvider.js";
import { AppSettings } from "../../utils/settingsUtils/interface.js";

interface Props {
	onFinish: () => void;
}

export const ProjectCreationDashboard: React.FC<Props> = (props) => {
	const [loading, startPromise] = usePromise();
	const { settings, setSettings } = useSettings();

	const onSubmit = (_payload: unknown) =>
		startPromise(async () => {
			const payload = _payload as ProjectCreationPayload;
			await createProject(payload);
			const newSettings: AppSettings = {
				...settings,
				project: {
					src_dir: "src",
					targets: [],
					dev_targets: [payload.devTarget],
				},
			};

			if (payload.shouldAddToGlobalConfigEnvironments) {
				const name = path.basename(process.cwd());
				settings.global.environments[name] = {
					link: `http://localhost:${payload.port}`,
					login: payload.login,
					password: payload.password,
				};
			}

			setSettings(newSettings);
			props.onFinish();
		});

	if (loading) {
		return <LoadingIndicator label="Generating project" />;
	}

	return (
		<Box flexDirection="column" alignItems="center" gap={1}>
			<Form
				title={"Project Creation"}
				fields={fields}
				onSubmit={onSubmit}
				onCancel={props.onFinish}
			/>
			<Text color="gray">
				Submission of this form will generate project in {process.cwd()}
			</Text>
		</Box>
	);
};

const fields: Field[] = [
	{
		type: "string",
		deafultValue: "admin@mail.com",
		label: "Login",
		name: "login",
		validate(value) {
			if (zod.string().email().safeParse(value).success) {
				return undefined;
			}

			return "This field should be an email";
		},
		required: true,
	},
	{
		type: "string",
		deafultValue: "12345",
		label: "Password",
		name: "password",
		required: true,
	},
	{
		type: "string",
		deafultValue: "extensions",
		label: "Build folder",
		name: "devTarget",
		required: true,
	},
	{
		type: "string",
		deafultValue: "8055",
		label: "Port",
		name: "port",
		required: true,
		validate: (value) => {
			if (zod.number().positive().safeParse(Number(value)).success) {
				return undefined;
			}
			return "This field should contain positive number";
		},
	},
	{
		type: "boolean",
		deafultValue: true,
		label: "Add this project to environments list",
		name: "shouldAddToGlobalConfigEnvironments",
	},
];
