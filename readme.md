# Directus helper

## Install

```bash
npm ci
npm run build
npm link
```

## How it works?
After helper instalation and first run you can observe a new file in your
* macOS: ~/Library/Preferences/directus-helper-nodejs/.settings.json
* Windows: %APPDATA%\directus-helper-nodejs\Config
* Linux: ~/.config/directus-helper-nodejs (or $XDG_CONFIG_HOME/directus-helper-nodejs )

This config will hold tokens for your environments and settings for migration script

### Schema of directus.helper.settings
```js
zod.object({
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
```

### What is an environment?
In terms of helper - we call environment a combination of link and credentials for it (either token or login&password)
Environments are heavely used for migration process.

### What is a migration?
Migration - is a process of transfering configuration of one environment (such as fields, flows, permissions) and transfering it to another environment

## Projects
This helper allows manage monorepos that contains a lot of extensions. Helper will recognize the folder as a directus project if it contains file `.settings.json`
This file contains some metadata about the project, such as name of src folder

### How create the project
You can create a project by running a helper inside target folder and then selecting option "Create Project", helper will prompt some data and generate all folder structure for you

### How build extensions
If helper recognize current working directory as a project, it will prompt you with options to build extensions and change project settings
Options available in project folder:
- Run dev server: this is a process that will watch for changes in extensions and automaticly trigger build of the extension
- Build extensions: this will build all extensions with minification

## TODO
- [x] Crossplatform for MacOs/Linux/Windows
- [] Generate example api extension in fresh project
- [] Support permissions migration
- [] Support full db migration
- [] Generate github/gitlab pipelines
- [] Support all extension types
