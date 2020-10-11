mkdir -p $1/podverse-api/temp
curl -L https://archive.org/download/podcastindex_dump/podcasts_2020-10-02.csv -o $1/podverse-api/temp/podcastIndexFeedUrlsCSVDump.csv
