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
      POSTGRES_USER: "directus"
      POSTGRES_PASSWORD: "directus"
      POSTGRES_DB: "directus"
    healthcheck:
      test: ["CMD", "pg_isready", "--host=localhost", "--username=directus"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_interval: 5s
      start_period: 30s
  cache:
    image: redis:6
    healthcheck:
      test: ["CMD-SHELL", "[ $$(redis-cli ping) = 'PONG' ]"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_interval: 5s
      start_period: 30s
  directus:
    image: directus/directus:latest
    volumes:
      - ./uploads:/directus/uploads
      - ./${payload.devTarget}:/directus/extensions
    ports:
      - ${payload.port}:8055
    depends_on:
      database:
        condition: service_healthy
      cache:
        condition: service_healthy
    environment:
      KEY: '${key}'
      SECRET: '${secret}'
      ADMIN_EMAIL: '${payload.login}'
      ADMIN_PASSWORD: '${payload.password}'
      DB_CLIENT: "pg"
      DB_HOST: "database"
      DB_PORT: "5432"
      DB_DATABASE: "directus"
      DB_USER: "directus"
      DB_PASSWORD: "directus"
      CACHE_ENABLED: "true"
      CACHE_AUTO_PURGE: "true"
      CACHE_STORE: "redis"
      REDIS: "redis://cache:6379"
      EXTENSIONS_AUTO_RELOAD: true
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
