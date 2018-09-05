export default `
  input CreatePlaylistPatch {
    description: String
    isPublic: Boolean
    itemsOrder: [String]
    title: String
  }

  input UpdatePlaylistPatch {
    description: String
    isPublic: Boolean
    itemsOrder: [String]
    title: String
  }

  type Mutation {
    createPlaylist(
      patch: CreatePlaylistPatch!
    ): Playlist

    updatePlaylist(
      id: String!
      patch: UpdatePlaylistPatch!
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
