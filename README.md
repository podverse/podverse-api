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

### Sample database data

If you want to add entities to the database quickly for development purposes only, run the following:

```
npm run dev:seeds:sampleEntities
```

### Add podcast categories to the database

```
npm run dev:seeds:categories
```

### Add feed urls to the database

To add podcasts to the database, you first need to add feed urls to the
database, and then run the podcast parser with those feed urls.

You can pass multiple feed urls as a comma-delimited string parameter to the
`npm run dev:scripts:addFeedUrls` command.

A list of sample podcast feed urls can be found in
[podverse-api/docs/sampleFeedUrls.txt](https://github.com/podverse/podverse-api/tree/deploy/docs/sampleFeedUrls.txt).

```
npm run dev:scripts:addFeedUrls <feed urls>
```

OR you can pass an array of feed urls in the /src/config/parser/addFeedUrlsFile.json file,
then run the `npm run dev:scripts:addFeedUrlsFromFile` command.

```
npm run dev:scripts:addFeedUrlsFromFile
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

### Use SQS to add feed urls to a queue, then parse them

This project uses AWS SQS for its remote queue.

```
npm run dev:scripts:addAllOrphanFeedUrlsToPriorityQueue
```

or:

```
npm run dev:scripts:addAllPublicFeedUrlsToQueue
```

or:

```
npm run dev:scripts:addNonAuthorityFeedUrlsToPriorityQueue
```

or to add all recently updated (according to Podcast Index), public feeds to the priority queue:

```
yarn dev:scripts:addRecentlyUpdatedFeedUrlsToPriorityQueue
```

After you have added feed urls to a queue, you can retrieve and then parse
the feed urls by running:

```
npm run dev:scripts:parseFeedUrlsFromQueue <restartTimeOut> <queueType>
# restartTimeOut in milliseconds; queueType is optional and only acceptable value is "priority"
```

### Request Google Analytics pageview data and save to database

Below are sample commands for requesting unique pageview data from Google
Analytics, which is used throughout the site for sorting by popularity (not a
great/accurate system for popularity sorting...).

```
npm run dev:scripts:queryUniquePageviews -- clips month
npm run dev:scripts:queryUniquePageviews -- episodes week
npm run dev:scripts:queryUniquePageviews -- podcasts allTime
```

See the [podverse-ops repo](https://github.com/podverse/podverse-ops) for a sample
cron configuration for querying the Google API on a timer.
