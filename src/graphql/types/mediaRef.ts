export default `

  input CreateMediaRefPatch {
    description: String
    endTime: Int
    episodeMediaUrl: String
    isPublic: Boolean
    podcastFeedUrl: String
    startTime: Int
    title: String
  }

  input UpdateMediaRefPatch {
    description: String
    endTime: Int
    isPublic: Boolean
    startTime: Int
    title: String
  }

  type Mutation {
    createMediaRef(
      patch: CreateMediaRefPatch!
    ): MediaRef

    updateMediaRef(
      id: String!
      patch: UpdateMediaRefPatch!
    ): MediaRef
  }

  type Query {
    mediaRef(id: String!): MediaRef
    mediaRefs: [MediaRef]
  }

  type MediaRef {
    id: String
    createdAt: String
    updatedAt: String
    authors: [Author]
    categories: [Category]
    episode: Episode
    owner: User
    playlists: [Playlist]
    podcast: Podcast
    description: String
    endTime: Int
    episodeDuration: Int
    episodeGuid: String
    episodeId: String
    episodeImageUrl: String
    epiosdeIsExplicit: Boolean
    episodeLinkUrl: String
    episodeMediaUrl: String
    episodePubDate: String
    episodeSummary: String
    episodeTitle: String
    isPublic: Boolean
    ownerId: String
    ownerName: String
    pastAllTimeTotalUniquePageviews: Int
    pastHourTotalUniquePageviews: Int
    pastDayTotalUniquePageviews: Int
    pastWeekTotalUniquePageviews: Int
    pastMonthTotalUniquePageviews: Int
    pastYearTotalUniquePageviews: Int
    podcastFeedUrl: String
    podcastGuid: String
    podcastId: String
    podcastImageUrl: String
    podcastIsExplicit: Boolean
    podcastTitle: String
    startTime: Int
    title: String
  }
`
