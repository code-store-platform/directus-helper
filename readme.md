     _ _            _             _        _
  __| (_)_ _ ___ __| |_ _  _ ___ | |_  ___| |_ __  ___ _ _
 / _` | | '_/ -_) _|  _| || (_-< | ' \/ -_) | '_ \/ -_) '_|
 \__,_|_|_| \___\__|\__|\_,_/__/ |_||_\___|_| .__/\___|_|
                                            |_|
## Description
Directus Helper is a command-line tui utility designed to simplify the development workflow around Directus projects.
It helps you manage multi-environment configurations, streamline migrations, organize monorepos with many extensions, and automate common development tasks such as building or watching extensions.

Whether you're working with multiple Directus instances (dev/stage/prod), maintaining a large repository, or simply want an easier way to sync configuration between environments, Directus Helper provides a consistent and developer-friendly toolset.

## What it is

* Directus Helper is a CLI tool that:
* Stores and manages Directus environment credentials (tokens or login/password).
* Supports configuration migration across environments (fields, flows, permissions, etc.).
* Recognizes Directus monorepo projects and automates building and managing extensions.
* Provides tools for developing extensions with automatic rebuild and project scaffolding.

## Install

```bash
npm install -g directus-helper
```

## Run from source

```bash
npm ci
npm run dev

# to run the package
node ./dist/cli.js
```

## How it works?
After you install and run the helper for the first time, a new configuration file is created:
* macOS: ~/Library/Preferences/directus-helper-nodejs/.settings.json
* Windows: %APPDATA%\directus-helper-nodejs\Config
* Linux: ~/.config/directus-helper-nodejs (or $XDG_CONFIG_HOME/directus-helper-nodejs )

This configuration file stores:
    * Environment tokens or credentials
    * Migration settings
    * Global helper preferences

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
In the context of this helper, an environment is a Directus instance configuration consisting of:
    * link — URL of the Directus environment
    * token, or login + password
Environments are essential for migration operations.

### What is a migration?
A migration is the process of transferring configuration from one Directus environment to another.
This may include:
    * Fields
    * Flows
    * ~~Permissions~~ (not yet*)
It allows you to keep environments in sync

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
- [x] Support all extensions types
- [ ] Support permissions migration
- [ ] Support full db migration
- [ ] Generate github/gitlab pipelines
