# podverse-api

Data API, database migration scripts, and backend services for the Podverse ecosystem

- [Getting started](#getting-started)
  * [NPM or Yarn](#npm-or-yarn)
  * [Setup environment variables](#setup-environment-variables)
  * [Install node_modules](#install-node-modules)
  * [Start dev server](#start-dev-server)
  * [Populate database](#populate-database)
  * [Add podcast categories to the database](#add-podcast-categories-to-the-database)
  * [Sync podcast data with Podcast Index API](#sync-podcast-data-with-podcast-index-api)
  * [Matomo page tracking and analytics](#matomo-page-tracking-and-analytics)
  * [More info](#more-info)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>generated with markdown-toc</a></i></small>

## Getting started

If you are looking to run this app or contribute to Podverse for the first time, please read the sections that are relevant for you in our [CONTRIBUTE.md](https://github.com/podverse/podverse-ops/blob/master/CONTRIBUTING.md) file in the podverse-ops repo. Among other things, that file contains instructions for running a local instance of the Podverse database.

### Setup environment variables

For local development, environment variables are provided by a local `.env` file. You can find a link to example `.env` files in the [CONTRIBUTING.md](https://github.com/podverse/podverse-ops/blob/master/CONTRIBUTING.md) file.

### Install node_modules

```sh
yarn
```

### Start dev server

```sh
yarn dev:watch
```

### Populate database

Instructions for this can be found in the [podverse-ops CONTRIBUTING.md file](https://github.com/podverse/podverse-ops/blob/master/CONTRIBUTING.md).

### Add podcast categories to the database

If you are creating a database from scratch, and not using the `populateDatabase` command explained in the CONTRIBUTE.md file, then you will need to populate the database with categories.

```sh
yarn dev:seeds:categories
```

### Sync podcast data with Podcast Index API

Podverse maintains its own podcast directory, and parses RSS feeds to populate it with data.

However, in prod Podverse syncs its database with the [Podcast Index API](https://podcastindex.org/), the world's largest open podcast directory, and the maintainers of the "Podcasting 2.0" RSS spec.

We run scripts in a cron interval that request from PI API a list of all the podcasts that it has detected updates in over the past X minutes, and then add those podcast IDs to an Amazon SQS queue for parsing, and then our parser containers, which run continuously, pull items from the queue, run our parser logic over it, then save the parsed data to our database.

If you'd like to run your own full instance of Podverse and would like a thorough explanation of the processes involved, please contact us and we can document it.

### Matomo page tracking and analytics

TODO: explain the Matomo setup

### More info

We used to have a more detailed README file, but I removed most of the content, since it is unnecessary for most local development workflows, and the information it was getting out-of-date. If you're looking for more info though, you can try digging through our [old README file here](https://github.com/podverse/podverse-api/blob/develop/docs/old/old-readme.md).
