export default `
  type Query {
    episode(id: String!): Episode
    episodes: [Episode]
  }

  type Episode {
    id: String
    createdAt: String
    updatedAt: String
    authors: [Author]
    categories: [Category]
    mediaRefs: [MediaRef]
    podcast: Podcast
    description: String
    duration: Int
    episodeType: String
    guid: String
    imageUrl: String
    isExplicit: Boolean
    isPublic: Boolean
    linkUrl: String
    mediaFilesize: Int
    mediaType: String
    mediaUrl: String
    pastAllTimeTotalUniquePageviews: Int
    pastHourTotalUniquePageviews: Int
    pastDayTotalUniquePageviews: Int
    pastWeekTotalUniquePageviews: Int
    pastMonthTotalUniquePageviews: Int
    pastYearTotalUniquePageviews: Int
    pubDate: String
    title: String
  }
`
