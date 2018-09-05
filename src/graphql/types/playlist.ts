export default `
  input PlaylistPatch {
    description: String
    isPublic: Boolean
    itemsOrder: [String]
    title: String
  }

  type Mutation {
    updatePlaylist(
      id: String!
      patch: PlaylistPatch!
    ): Playlist
  }

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
