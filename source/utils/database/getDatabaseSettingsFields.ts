import { z } from "zod";
import { Field } from "../../components/Form/interfaces.js";
import { DatabaseSettings, MAX_PORT } from "../settingsUtils/interface.js";

export const getDatabaseSettingsFields = (
	settings?: z.infer<typeof DatabaseSettings>,
): Field[] => {
	return [
		{
			name: "connectionName",
			type: "string",
			required: true,
			label: "Connection name",
		},
		{
			name: "host",
			type: "string",
			deafultValue: settings?.host,
			required: true,
			label: "Host",
		},
		{
			name: "database",
			type: "string",
			deafultValue: settings?.database,
			required: true,
			label: "Database name",
		},
		{
			name: "port",
			type: "number",
			int: true,
			deafultValue: settings?.port || 5432,
			required: true,
			validate: (value) => {
				if (value < 1 || value > MAX_PORT) {
					return "Invalid port found";
				}

				return;
			},
			label: "Build folders names",
		},
		{
			name: "username",
			type: "string",
			deafultValue: settings?.username,
			required: true,
			label: "User",
		},
		{
			name: "password",
			type: "string",
			deafultValue: settings?.password,
			required: true,
			label: "Password",
		},
	];
};
