import React from "react";
import { useSettings } from "../../providers/SettingsProvider.js";
import { AppProjectSettingsSchema } from "../../utils/settingsUtils/interface.js";
import { Form } from "../Form/Form.js";
import { getProjectSettingsFields } from "../../utils/getSettingsFields/getSettingsFields.js";

interface Props {
	onFinish: () => void;
}

export const ProjectSettingsScreen: React.FC<Props> = (props) => {
	const { settings, setSettings } = useSettings();
	const onSubmit = (result: Record<string, unknown>) => {
		const projectSettings = AppProjectSettingsSchema.safeParse(result);

		if (!projectSettings.success) {
			return;
		}

		setSettings({
			...settings,
			project: projectSettings.data,
		});
		props.onFinish();
	};

	return (
		<Form
			onSubmit={onSubmit}
			title="Project Settings"
			clearable
			onCancel={props.onFinish}
			fields={getProjectSettingsFields(settings.project)}
		/>
	);
};
