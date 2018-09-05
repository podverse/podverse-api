export default `
  input UserPatch {
    name: String
    subscribedPodcastIds: [String]
  }

  type Mutation {
    updateUser(
      id: String!
      patch: UserPatch!
    ): User
  }

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
