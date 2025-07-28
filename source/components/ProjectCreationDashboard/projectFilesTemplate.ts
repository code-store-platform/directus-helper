interface DockerComposeFileConfiguration {
	login: string;
	password: string;
	devTarget: string;
	port: string;
}

export const dockerComposeFileTemplate = (
	payload: DockerComposeFileConfiguration,
) => {
	const key = crypto.randomUUID();
	const secret = crypto.randomUUID();

	return `
services:
  database:
    image: postgis/postgis:13-master
    # Required when running on platform other than amd64, like Apple M1/M2:
    # platform: linux/amd64
    volumes:
      - ./data/database:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: 'directus'
      POSTGRES_PASSWORD: 'directus'
      POSTGRES_DB: 'directus'
  directus:
    image: directus/directus:latest
    volumes:
      - ./${payload.devTarget}:/directus/extensions
    ports:
      - ${payload.port}:8055
    depends_on:
      database:
        condition: service_started
    environment:
      KEY: '${key}'
      SECRET: '${secret}'
      ADMIN_EMAIL: '${payload.login}'
      ADMIN_PASSWORD: '${payload.password}'
      DB_CLIENT: 'pg'
      DB_PORT: '5432'
      DB_HOST: 'database'
      DB_DATABASE: 'directus'
      DB_USER: 'directus'
      DB_PASSWORD: 'directus'
      EXTENSIONS_AUTO_RELOAD: true
      MAX_PAYLOAD_SIZE: '100mb'
`.trim();
};

export const gitIgnoreFileTemplate = (devTarget: string) => {
	return `
${devTarget}
data
/.idea/
**/.settings.json
**/logs.log
.DS_Store
`.trim();
};
