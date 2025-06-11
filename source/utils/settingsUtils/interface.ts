import zod from 'zod';

export type AppSettings = zod.infer<typeof AppSettingsSchema>;
export type EnvironmentConfiguration = AppSettings['environments'][string];

export const AppSettingsSchema = zod.object({
	root: zod.string(),
	notification_hook: zod.string().optional(),
	should_migrate_flows: zod.boolean().optional(),
	environments: zod.record(
		zod.string(),
		zod.object({
			link: zod.string().url(),
			token: zod.string(),
		}),
	),
});
