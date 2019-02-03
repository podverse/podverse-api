# podverse-api

Data API, database migration scripts, and backend services for the Podverse ecosystem

## Getting started

### Local Development and Deployment
This repo contains steps for running podverse-api locally for development.

For stage/prod deployment instructions, please refer to the
[podverse-ops docs](https://github.com/podverse/podverse-ops).

### Prereqs

For podverse-api to work you will need a local Postgres database running.

You can setup your own database, or go to the
[podverse-ops repo](https://github.com/podverse/podverse-ops), add the podverse-db-local.env file as explained in the docs, then run this command:

```
docker-compose -f docker-compose.local.yml up -d podverse_db
```

### Setup environment variables

For local development, environment variables are provided by a local .env file. Duplicate the .env.example file, rename it to .env, and update all of the environment variables to match what is needed for your environment.

### Install node_modules

```
npm install
```

### Start dev server

```
npm run dev
```

### Add categories to the database

```
npm run seeds:categories
```

### Add feed urls to the database

To add podcasts to the database, you first need to add feed urls to the
database, and then run the podcast parser with those feed urls.

You can pass multiple feed urls as a comma-delimited string parameter to the
`npm run scripts:addFeedUrls` command.

A list of sample podcast feed urls can be found at
[podverse-api/docs/sampleFeedUrls.txt]
(https://github.com/podverse/podverse-api/tree/deploy/docs/sampleFeedUrls.txt).

```
npm run dev:scripts:addFeedUrls <feed urls>
```

### Parse feed urls to add podcasts and episodes to the database

Orphan feed urls do not have a podcast associated with them.

```
npm run scripts:parseOrphanFeedUrls
```

To parse all non-orphan and public feed urls, you can run:

```
npm run scripts:parsePublicFeedUrls
```
