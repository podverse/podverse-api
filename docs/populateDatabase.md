# How to populate the database for QA and development

The purpose of the `src/seeds/qa/populateDatabase.ts` script is to populate a local database for QA and development purposes.

## podverse-ops

To create a local database, within the podverse-ops repo run:

```bash
make local_db_up
```

If you need to teardown and recreate the local database, then in podverse-ops run:
NOTE: this command will destroy _all_ your local Podverse docker containers.

```bash
make local_down_docker_compose
make local_db_up
```

## podverse-api

### One-time setup

#### Create local env var file

Copy the `podverse-api-local.env.example` file [from podverse-ops](https://github.com/podverse/podverse-ops/blob/master/config/podverse-api-local.env.example), name the copied file `.env`, and put the file at the root of your podverse-api repo.

Within the `.env` file you will need to add a Podcast Index API auth and secret key, and assign them as `PODCAST_INDEX_AUTH_KEY` and `PODCAST_INDEX_SECRET_KEY`.

Also, you will need to set `SUPER_USER_ID=jISAEEgXa` (due to [this Github issue](https://github.com/podverse/podverse-api/issues/569)).

#### Install node modules

```bash
yarn
```

### Populate database

#### Full run

To populate the database:

```bash
yarn dev:seeds:qa:populateDatabase
```

The full run will take 3+ minutes, mostly due to network requests to Podcast Index API to use real podcast data to populate the database.

#### Quick run

To populate the database faster (with fewer podcasts), you can pass a `quick` flag to the populateDatabase script:

```bash
yarn dev:seeds:qa:populateDatabase quick
```
