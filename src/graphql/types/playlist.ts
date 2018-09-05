export default `
  type Query {
    playlist(id: String!): Playlist
    playlists: [Playlist]
  }

  type Playlist {
    id: String,
    createdAt: String,
    updatedAt: String,
    mediaRefs: [MediaRef]
    owner: User
    description: String
    isMyClips: Boolean
    isPublic: Boolean
    itemsOrder: [String]
    title: String
  }
`
