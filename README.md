# podverse-api

Data API, database migration scripts, and backend services for the Podverse ecosystem

## Getting started

### Local Development and Deployment

This repo contains steps for running podverse-api locally for development.

For stage/prod deployment instructions, please refer to the
[podverse-ops docs](https://github.com/podverse/podverse-ops).

### Prereqs

Before you can run podverse-api you will need a local Postgres version 11.5 database running.

You can setup your own database, or go to the
[podverse-ops repo](https://github.com/podverse/podverse-ops), add the podverse-db-local.env file as explained in the docs, then run this command:

```bash
docker-compose -f docker-compose.local.yml up -d podverse_db
```

### Setup environment variables

For local development, environment variables are provided by a local .env file. Duplicate the .env.example file, rename it to .env, and update all of the environment variables to match what is needed for your environment.

### Install node_modules

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

### Sample database data

**TODO: Sample db instructions are out of date**
The [podverse-ops repo](https://github.com/podverse/podverse-ops) contains the qa-database.sql file to help you get started quickly with a development database. You can clone the podverse-ops repo, then run the following command after the Postgres database is running:

```bash
psql -h 0.0.0.0 -p 5432 -U postgres -W -f ./sample-database/qa-database.sql
```

The password for the .sql file is: mysecretpw

### Add podcast categories to the database

```bash
npm run dev:seeds:categories
```

### Add feed urls to the database

To add podcasts to the database, you first need to add feed urls to the
database, and then run the podcast parser with those feed urls.

You can pass multiple feed urls as a comma-delimited string parameter to the
`npm run dev:scripts:addFeedUrls` command.

A list of sample podcast feed urls can be found in
[podverse-api/docs/sampleFeedUrls.txt](https://github.com/podverse/podverse-api/tree/deploy/docs/sampleFeedUrls.txt).

```bash
npm run dev:scripts:addFeedUrls <feed urls>
```

### Parse feed urls to add podcasts and episodes to the database

Orphan feed urls do not have a podcast associated with them.

```bash
npm run dev:scripts:parseOrphanFeedUrls
```

To parse all non-orphan and public feed urls, you can run:

```bash
npm run dev:scripts:parsePublicFeedUrls
```

### Use SQS to add feed urls to a queue, then parse them

This project uses AWS SQS for its remote queue.

```bash
npm run dev:scripts:addAllOrphanFeedUrlsToPriorityQueue
```

or:

```bash
npm run dev:scripts:addAllPublicFeedUrlsToQueue
```

or:

```bash
npm run dev:scripts:addNonPodcastIndexFeedUrlsToPriorityQueue
```

or to add all recently updated (according to Podcast Index), public feeds to the priority queue:

```bash
yarn dev:scripts:addRecentlyUpdatedFeedUrlsToPriorityQueue
```

After you have added feed urls to a queue, you can retrieve and then parse
the feed urls by running:

```bash
npm run dev:scripts:parseFeedUrlsFromQueue <restartTimeOut> <queueType>
# restartTimeOut in milliseconds; queueType is optional and only acceptable value is "priority"
```

We also have a self-managed parsing queue, where we manually mark podcasts to be added to a separate queue for parsing at a regular cadence. The property is `Podcast.parsingPriority` and the `parsingPriority` is a value between 0-5. 0 is the default, and means the podcast should not be added to the self-managed queue. 1 is the most frequent, and 5 is the least frequent parsing.

At the time of writing this, 3 is the value we are using the most, which adds the feeds to the queue every 30 minutes.

The `offset` value is optional, and probably not needed.

```bash
npm run dev:scripts:addFeedsToQueueByPriority <parsingPriority> <offset>
```


### Request Google Analytics pageview data and save to database

Below are sample commands for requesting unique pageview data from Google
Analytics, which is used throughout the site for sorting by popularity (not a
great/accurate system for popularity sorting...).

```bash
npm run dev:scripts:queryUniquePageviews -- clips month
npm run dev:scripts:queryUniquePageviews -- episodes week
npm run dev:scripts:queryUniquePageviews -- podcasts allTime
```

See the [podverse-ops repo](https://github.com/podverse/podverse-ops) for a sample
cron configuration for querying the Google API on a timer.
