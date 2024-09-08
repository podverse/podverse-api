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
