export default `
  type Query {
    category(id: String!): Category
    categorys: [Category]
  }

  type Category {
    id: String
    createdAt: String
    updatedAt: String
    category: Category
    categories: [Category]
    episodes: [Episode]
    mediaRefs: [MediaRef]
    podcast: [Podcast]
    slug: String
    title: String
  }
`
