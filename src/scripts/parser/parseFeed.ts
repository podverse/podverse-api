import { parseFeed } from 'services/parser'

parseFeed(
  process.env.PARSE_FEED_URL,
  process.env.PARSE_FEED_PODCAST_ID,
  process.env.PARSE_FEED_SHOULD_CREATE
)
