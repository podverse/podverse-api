# podverse-api

Data API, database migration scripts, and backend services for the Podverse ecosystem

## Dev Setup

### Environment Variables

Create a .env file in the root of this project, based on the example found in [podverse-ops/config/podverse-api.env.example](https://github.com/podverse/podverse-ops/tree/database-schema/config).

### Local Dev Workflow

Podverse uses many modules that are maintained in separate repos, and they need to be linked and running for a local dev workflow. Please read the `podverse-ops/dev/local-dev-setup.md` file to set up the required dependencies and module linking.

### Running Locally

Install the node_modules:

```
npm install
```

Then run:

```
npm run dev
```

Or if you want the app to auto-reload on saved changes:

```
npm run dev:watch
```

## Deploying

To deploy, build the docker image using the Dockerfile, and deploy the image on your server using the `podverse-ops/docker-compose.yml` file. See the `podverse-ops/dev/deploying.md` file for more info.

## Building & Running Locally (Docker)

The repository includes a multi-stage `Dockerfile` that mirrors the CI workflow. The build stage optionally installs several `@alpha` prerelease packages and runs `npm clean-install` before building the TypeScript output. The runtime stage contains the compiled `dist/` files and a default command to start the server.

Basic local build (default installs alpha packages like CI):

```bash
docker build -t podverse-api:local .
```

Skip installing alpha prerelease packages (faster):

```bash
docker build --build-arg INSTALL_ALPHA=false -t podverse-api:local .
```

Run the container (exposes port 1234):

```bash
docker run --rm -p 1234:1234 \
	-e AUTH_JWT_SECRET=supersecret \
	-e DB_HOST=127.0.0.1 -e DB_PORT=5432 -e DB_USER=postgres -e DB_PASSWORD=postgres -e DB_NAME=podverse \
	podverse-api:local
```

Notes:
- The app initializes database and message-queue connections at startup. Provide working services or adjust env vars to avoid startup failures.
- The app listens on port `1234` by default; override with `API_PORT` / `API_PORT` environment variable if needed.

Quick docker-compose example (Postgres + API) — adapt env keys to your setup:

```yaml
version: "3.8"
services:
	db:
		image: postgres:15
		environment:
			POSTGRES_USER: postgres
			POSTGRES_PASSWORD: postgres
			POSTGRES_DB: podverse
		ports:
			- "5432:5432"
		volumes:
			- pgdata:/var/lib/postgresql/data

	api:
		image: podverse-api:local
		depends_on:
			- db
		ports:
			- "1234:1234"
		environment:
			NODE_ENV: development
			AUTH_JWT_SECRET: supersecret
			DB_HOST: db
			DB_PORT: 5432
			DB_USER: postgres
			DB_PASSWORD: postgres
			DB_NAME: podverse
		command: ["node", "dist/index.js"]

volumes:
	pgdata:
```

Pushing to GitHub Container Registry (GHCR):

```bash
# Tag the local image with the GHCR name
docker tag podverse-api:local ghcr.io/<OWNER>/<REPO>/podverse-api:<tag>

# Login (use a PAT with write:packages)
echo $GHCR_PAT | docker login ghcr.io -u <GITHUB_USERNAME> --password-stdin

# Push
docker push ghcr.io/<OWNER>/<REPO>/podverse-api:<tag>
```

If you want me to add a ready-to-run `docker-compose.yml` to this repo with sensible defaults, or to add an example `make` target for building and pushing, tell me which you prefer.
