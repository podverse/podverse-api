export default `
  type Query {
    author(id: String!): Author
    authors: [Author]
  }

  type Author {
    id: String,
    createdAt: String,
    updatedAt: String,
    episodes: [Episode],
    mediaRefs: [MediaRef],
    podcasts: [Podcast],
    name: String,
    slug: String
  }
`
