export default `
  type Query {
    user(id: String!): User
    users: [User]
  }

  type User {
    id: String
    createdAt: String
    updatedAt: String
    email: String
    name: String
    subscribedPodcastIds: [String]
  }
`
