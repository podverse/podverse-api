export default `

  input CreateUserPatch {
    email: String
    name: String
    subscribedPodcastIds: [String]
  }

  input UpdateUserPatch {
    email: String
    name: String
    subscribedPodcastIds: [String]
  }

  type Mutation {
    createUser(
      patch: CreateUserPatch!
    ): User

    updateUser(
      id: String!
      patch: UpdateUserPatch!
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
