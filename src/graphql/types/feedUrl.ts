export default `
  type Query {
    feedUrl(id: String!): FeedUrl
    feedUrls: [FeedUrl]
  }

  type FeedUrl {
    url: String
    createdAt: String
    updatedAt: String
    isAuthority: Boolean
    podcast: Podcast
  }
`
