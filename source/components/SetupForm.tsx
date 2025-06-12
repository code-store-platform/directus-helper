import path from "node:path";
import React from "react";
import { DEFAULT_EXTANSIONS_ROOTS } from "../constants.js";
import { findRoot } from "../utils/findRoot/findRoot.js";
import {
	AppSettings,
	AppSettingsSchema,
} from "../utils/settingsUtils/interface.js";
import { Form } from "./Form/Form.js";
import { getSettingsFields } from "../utils/getSettingsFields/getSettingsFields.js";

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
			clearable
			fields={getSettingsFields({
				root: getDefaultRoot(),
				src_dir: "src",
				extensions_roots: DEFAULT_EXTANSIONS_ROOTS,
			})}
		/>
	);
};

const getDefaultRoot = () => {
	const helperRoot = findRoot(process.cwd(), "helper");
	return helperRoot ? path.resolve(helperRoot, "..") : process.cwd();
};
