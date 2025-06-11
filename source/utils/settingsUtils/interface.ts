import zod from "zod";

export type AppSettings = zod.infer<typeof AppSettingsSchema>;
export type EnvironmentConfiguration = AppSettings["environments"][string];

export const AppSettingsSchema = zod.object({
	root: zod.string().min(1),
	src_dir: zod.string().min(1),
	notification_hook: zod.string().optional(),
	should_migrate_flows: zod.boolean().optional(),
	extensions_roots: zod.array(zod.string()),
	prod_extensions_roots: zod.array(zod.string()).optional(),
	environments: zod.record(
		zod.string(),
		zod.object({
			link: zod.string().url(),
			token: zod.string(),
		}),
	),
});
