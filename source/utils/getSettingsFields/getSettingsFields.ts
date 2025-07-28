import { Field } from "../../components/Form/interfaces.js";
import { AppSettings } from "../settingsUtils/interface.js";

export const getProjectSettingsFields = (
	settings: AppSettings["project"],
): Field[] => {
	return [
		{
			name: "src_dir",
			type: "string",
			deafultValue: settings?.src_dir,
			required: true,
			label: "Source dir",
		},
		{
			name: "dev_targets",
			type: "string[]",
			deafultValue: settings?.dev_targets,
			required: true,
			label: "Build folders names",
		},
		{
			name: "targets",
			type: "string[]",
			label: "Build folders for prod",
			deafultValue: settings?.targets,
		},
	];
};
