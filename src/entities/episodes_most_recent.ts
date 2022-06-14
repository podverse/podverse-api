/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  EpisodeAlternateEnclosure,
  EpisodeContentLinks,
  Funding,
  SocialInteraction,
  Transcript,
  ValueTag
} from 'podverse-shared'
import { JoinTable, ManyToMany, ManyToOne, ViewColumn, ViewEntity } from 'typeorm'
import { Author, Category, Podcast } from '~/entities'

@ViewEntity('episodes_most_recent')
export class EpisodeMostRecent {
  @ViewColumn()
  id: string

  @ViewColumn()
  int_id: number

  @ViewColumn()
  alternateEnclosures: EpisodeAlternateEnclosure[]

  @ViewColumn()
  chaptersType?: string

  @ViewColumn()
  chaptersUrl?: string

  @ViewColumn()
  chaptersUrlLastParsed: Date

  @ViewColumn()
  contentLinks: EpisodeContentLinks[]

  @ViewColumn()
  credentialsRequired?: boolean

  @ViewColumn()
  description?: string

  @ViewColumn()
  episodeType?: string

  @ViewColumn()
  funding: Funding[]

  @ViewColumn()
  guid?: string

  @ViewColumn()
  imageUrl?: string

  @ViewColumn()
  isExplicit: boolean

  @ViewColumn()
  isPublic: boolean

  @ViewColumn()
  linkUrl?: string

  @ViewColumn()
  mediaType?: string

  @ViewColumn()
  mediaUrl: string

  @ViewColumn()
  pastHourTotalUniquePageviews: number

  @ViewColumn()
  pastDayTotalUniquePageviews: number

  @ViewColumn()
  pastWeekTotalUniquePageviews: number

  @ViewColumn()
  pastMonthTotalUniquePageviews: number

  @ViewColumn()
  pastYearTotalUniquePageviews: number

  @ViewColumn()
  pastAllTimeTotalUniquePageviews: number

  @ViewColumn()
  pubDate?: Date

  @ViewColumn()
  socialInteraction: SocialInteraction[]

  @ViewColumn()
  subtitle?: string

  @ViewColumn()
  title?: string

  @ViewColumn()
  transcript: Transcript[]

  @ViewColumn()
  value: ValueTag[]

  @ManyToMany((type) => Author)
  @JoinTable()
  authors: Author[]

  @ManyToMany((type) => Category)
  @JoinTable()
  categories: Category[]

  @ManyToOne((type) => Podcast, (podcast) => podcast.episodes)
  podcast: Podcast

  @ViewColumn()
  podcastId: string

  @ViewColumn()
  createdAt: Date

  @ViewColumn()
  updatedAt: Date
}
