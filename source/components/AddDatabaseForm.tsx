import React from "react";
import { useSettings } from "../providers/SettingsProvider.js";
import { getDatabaseSettingsFields } from "../utils/database/getDatabaseSettingsFields.js";
import { DatabaseSettings } from "../utils/settingsUtils/interface.js";
import { Form } from "./Form/Form.js";
import { Box } from "ink";

interface Props {
	onFinish: () => void;
}

export const AddDatabaseForm: React.FC<Props> = (props) => {
	const { settings, setSettings } = useSettings();

	const onSubmit = (result: Record<string, unknown>) => {
		const connection = DatabaseSettings.safeParse(result);
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		const connectionName = result["connectionName"] as string;

		if (!connection.success) {
			return;
		}

		setSettings({
			...settings,
			global: {
				...settings.global,
				databases: {
					...settings.global.databases,
					[connectionName]: connection.data,
				},
			},
		});
		props.onFinish();
	};

	return (
		<Box>
			<Form
				onSubmit={onSubmit}
				title="Add Database"
				clearable
				onCancel={props.onFinish}
				fields={getDatabaseSettingsFields()}
			/>
		</Box>
	);
};
