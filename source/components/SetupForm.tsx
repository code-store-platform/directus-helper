import path from "node:path";
import React from "react";
import { DEFAULT_EXTANSIONS_ROOTS } from "../constants.js";
import { findRoot } from "../utils/findRoot/findRoot.js";
import {
	AppSettings,
	AppSettingsSchema,
} from "../utils/settingsUtils/interface.js";
import { Form } from "./Form/Form.js";

interface Props {
	onSubmit: (settings: AppSettings) => void;
}

export const SetupForm: React.FC<Props> = (props) => {
	const onSubmit = (result: Record<string, unknown>) => {
		const settings = AppSettingsSchema.safeParse({
			...result,
			environments: {},
		});

		if (settings.success) {
			props.onSubmit(settings.data);
		}
	};

	return (
		<Form
			onSubmit={onSubmit}
			title="Setup wizard"
			fields={[
				{
					name: "root",
					type: "string",
					deafultValue: getDefaultRoot(),
					required: true,
					label: "Absolute path to project",
				},
				{
					name: "src_dir",
					type: "string",
					deafultValue: "src",
					required: true,
					label: "Source dir",
				},
				{
					name: "extensions_roots",
					type: "string[]",
					deafultValue: DEFAULT_EXTANSIONS_ROOTS,
					required: true,
					label: "Build folders names",
				},
				{
					name: "prod_extensions_roots",
					type: "string[]",
					label: "Build folders for prod",
				},
				{
					name: "notification_hook",
					type: "string",
					label: "Notification url",
				},
				{
					name: "should_migrate_flows",
					type: "boolean",
					deafultValue: false,
					label: "Should migrate flows",
				},
			]}
		/>
	);
};

const getDefaultRoot = () => {
	const helperRoot = findRoot(process.cwd(), "helper");
	return helperRoot ? path.resolve(helperRoot, "..") : process.cwd();
};
