export default `
  type Query {
    category(id: String!): Category
    categories: [Category]
  }

  type Category {
    id: String
    createdAt: String
    updatedAt: String
    category: Category
    categories: [Category]
    episodes: [Episode]
    mediaRefs: [MediaRef]
    podcasts: [Podcast]
    slug: String
    title: String
  }
`
