export default `
  type Query {
    podcast(id: String!): Podcast
    podcasts: [Podcast]
  }

  type Podcast {
    id: String
    createdAt: String
    updatedAt: String
    authors: [Author]
    categories: [Category]
    episodes: [Episode]
    feedUrls: FeedUrl[]
    description: String
    imageUrl: String
    isExplicit: Boolean
    pastAllTimeTotalUniquePageviews: Int
    pastHourTotalUniquePageviews: Int
    pastDayTotalUniquePageviews: Int
    pastWeekTotalUniquePageviews: Int
    pastMonthTotalUniquePageviews: Int
    pastYearTotalUniquePageviews: Int
    title: String
  }
`
