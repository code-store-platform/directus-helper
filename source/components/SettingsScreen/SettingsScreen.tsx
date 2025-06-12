import React from "react";
import { useSettings } from "../../providers/SettingsProvider.js";
import { getSettingsFields } from "../../utils/getSettingsFields/getSettingsFields.js";
import { AppSettingsSchema } from "../../utils/settingsUtils/interface.js";
import { Form } from "../Form/Form.js";

interface Props {
	onFinish: () => void;
}

export const SettingsScreen: React.FC<Props> = (props) => {
	const { settings, setSettings } = useSettings();
	const environments = settings.environments;
	const onSubmit = (result: Record<string, unknown>) => {
		const settings = AppSettingsSchema.safeParse({
			...result,
			environments: {},
		});

		if (!settings.success) {
			return;
		}

		setSettings({
			...settings.data,
			environments,
		});
		props.onFinish();
	};

	return (
		<Form
			onSubmit={onSubmit}
			title="Settings"
			clearable
			onCancel={props.onFinish}
			fields={getSettingsFields(settings)}
		/>
	);
};
