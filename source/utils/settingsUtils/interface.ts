import zod from "zod";

export type AppSettings = zod.infer<typeof AppSettingsSchema>;
export type EnvironmentConfiguration =
	AppSettings["global"]["environments"][string];

export const AppGlobalSettingsSchema = zod.object({
	notification_hook: zod.string().optional(),
	should_migrate_flows: zod.boolean().optional(),
	environments: zod.record(
		zod.string(),
		zod
			.object({
				link: zod.string().url(),
				token: zod.string(),
			})
			.or(
				zod.object({
					link: zod.string().url(),
					login: zod.string().email(),
					password: zod.string(),
				}),
			),
	),
});

export const AppProjectSettingsSchema = zod.object({
	src_dir: zod.string().min(1),
	dev_targets: zod.array(zod.string()),
	targets: zod.array(zod.string()).optional(),
});

export const AppSettingsSchema = zod.object({
	global: AppGlobalSettingsSchema,
	project: AppProjectSettingsSchema.nullable(),
});
