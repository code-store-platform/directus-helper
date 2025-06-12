import { Field } from "../../components/Form/interfaces.js";
import { AppSettings } from "../settingsUtils/interface.js";
import zod from "zod";

export const getSettingsFields = (
	settings: Omit<AppSettings, "environments">,
): Field[] => {
	return [
		{
			name: "root",
			type: "string",
			deafultValue: settings.root,
			required: true,
			label: "Absolute path to project",
		},
		{
			name: "src_dir",
			type: "string",
			deafultValue: settings.src_dir,
			required: true,
			label: "Source dir",
		},
		{
			name: "extensions_roots",
			type: "string[]",
			deafultValue: settings.extensions_roots,
			required: true,
			label: "Build folders names",
		},
		{
			name: "prod_extensions_roots",
			type: "string[]",
			label: "Build folders for prod",
			deafultValue: settings.prod_extensions_roots,
		},
		{
			name: "notification_hook",
			type: "string",
			label: "Notification url",
			deafultValue: settings.notification_hook,
			validate: (url) => {
				if (!url) {
					return;
				}

				const valid = zod.string().url().safeParse(url).success;

				if (valid) {
					return;
				}

				return "This field should contain URL";
			},
		},
		{
			name: "should_migrate_flows",
			type: "boolean",
			deafultValue: !!settings.should_migrate_flows,
			label: "Should migrate flows",
		},
	];
};
