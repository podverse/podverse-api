/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  EpisodeAlternateEnclosure,
  EpisodeContentLinks,
  Funding,
  SocialInteraction,
  Transcript,
  ValueTag
} from 'podverse-shared'
import { Column, JoinTable, ManyToMany, ManyToOne, ViewColumn, ViewEntity } from 'typeorm'
import { Author, Category, Podcast } from '~/entities'

@ViewEntity('episodes_most_recent')
export class EpisodeMostRecent {
  @ViewColumn()
  id: string

  @ViewColumn()
  int_id: number

  @Column('simple-json', { nullable: true })
  alternateEnclosures: EpisodeAlternateEnclosure[]

  @ViewColumn()
  chaptersType?: string

  @ViewColumn()
  chaptersUrl?: string

  @ViewColumn()
  chaptersUrlLastParsed: Date

  @Column('simple-json', { nullable: true })
  contentLinks: EpisodeContentLinks[]

  @ViewColumn()
  credentialsRequired?: boolean

  @ViewColumn()
  duration?: number

  @ViewColumn()
  episodeType?: string

  @Column('simple-json', { nullable: true })
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
  itunesEpisode?: number

  @ViewColumn()
  itunesEpisodeType?: string

  @ViewColumn()
  itunesSeason?: number

  @ViewColumn()
  linkUrl?: string

  @ViewColumn()
  mediaFilesize: number

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

  @Column('simple-json', { nullable: true })
  socialInteraction: SocialInteraction[]

  @ViewColumn()
  subtitle?: string

  @ViewColumn()
  title?: string

  @Column('simple-json', { nullable: true })
  transcript: Transcript[]

  @Column('simple-json', { nullable: true })
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
