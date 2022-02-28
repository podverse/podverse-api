/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsUrl, IsInt, Min, ValidateIf } from 'class-validator'
import {
  EpisodeAlternateEnclosure,
  EpisodeContentLinks,
  Funding,
  SocialInteraction,
  Transcript,
  ValueTag
} from 'podverse-shared'
import {
  Author,
  Category,
  LiveItem,
  MediaRef,
  Podcast,
  UserHistoryItem,
  UserNowPlayingItem,
  UserQueueItem
} from '~/entities'
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { generateShortId } from '~/lib/utility'

@Entity('episodes')
@Index(['isPublic', 'pubDate'])
@Index(['mediaType', 'pastAllTimeTotalUniquePageviews'])
@Index(['mediaType', 'pastHourTotalUniquePageviews'])
@Index(['mediaType', 'pastDayTotalUniquePageviews'])
@Index(['mediaType', 'pastWeekTotalUniquePageviews'])
@Index(['mediaType', 'pastMonthTotalUniquePageviews'])
@Index(['mediaType', 'pastYearTotalUniquePageviews'])
export class Episode {
  @PrimaryColumn('varchar', {
    default: generateShortId(),
    length: 14
  })
  id: string

  // TODO: generate this column without server downtime
  // @Column()
  // @Generated('increment')
  // int_id: number

  @Column('simple-json', { nullable: true })
  alternateEnclosures: EpisodeAlternateEnclosure[]

  @Column({ nullable: true })
  chaptersType?: string

  @ValidateIf((a) => a.chaptersUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  chaptersUrl?: string

  @Column({ nullable: true })
  chaptersUrlLastParsed: Date

  @Column('simple-json', { nullable: true })
  contentLinks: EpisodeContentLinks[]

  @Column({ default: false })
  credentialsRequired?: boolean

  @Column({ nullable: true })
  description?: string

  @ValidateIf((a) => a.duration != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  duration?: number

  @Column({ nullable: true })
  episodeType?: string

  @Column('simple-json', { nullable: true })
  funding: Funding[]

  @Index()
  @Column({ nullable: true })
  guid?: string

  @ValidateIf((a) => a.imageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  imageUrl?: string

  @Column({ default: false })
  isExplicit: boolean

  @Index()
  @Column({ default: false })
  isPublic: boolean

  @ValidateIf((a) => a.linkUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  linkUrl?: string

  @ValidateIf((a) => a.mediaFilesize != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  mediaFilesize: number

  @Index()
  @Column({ nullable: true })
  mediaType?: string

  @Index()
  @IsUrl()
  @Column()
  mediaUrl: string

  @Index()
  @ValidateIf((a) => a.pastHourTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastHourTotalUniquePageviews: number

  @Index()
  @ValidateIf((a) => a.pastDayTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastDayTotalUniquePageviews: number

  @Index()
  @ValidateIf((a) => a.pastWeekTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastWeekTotalUniquePageviews: number

  @Index()
  @ValidateIf((a) => a.pastMonthTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastMonthTotalUniquePageviews: number

  @Index()
  @ValidateIf((a) => a.pastYearTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastYearTotalUniquePageviews: number

  @Index()
  @ValidateIf((a) => a.pastAllTimeTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastAllTimeTotalUniquePageviews: number

  @Column({ nullable: true })
  pubDate?: Date

  @Column('simple-json', { nullable: true })
  socialInteraction: SocialInteraction[]

  @Index()
  @Column({ nullable: true })
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

  @OneToOne((type) => LiveItem, (liveItem) => liveItem.episode, {
    cascade: true,
    nullable: true
  })
  liveItem: LiveItem | null

  @OneToMany((type) => MediaRef, (mediaRef) => mediaRef.episode)
  mediaRefs: MediaRef[]

  @Index()
  @ManyToOne((type) => Podcast, (podcast) => podcast.episodes, {
    onDelete: 'CASCADE'
  })
  podcast: Podcast

  // TODO: can/should this be removed?
  @Index()
  @Column()
  podcastId: string

  @OneToMany((type) => UserHistoryItem, (userHistoryItem) => userHistoryItem.episode)
  userHistoryItems: UserHistoryItem[]

  @OneToMany((type) => UserNowPlayingItem, (userNowPlayingItem) => userNowPlayingItem.episode, { nullable: true })
  userNowPlayingItems: UserNowPlayingItem[]

  @OneToMany((type) => UserQueueItem, (userQueueItem) => userQueueItem.episode)
  userQueueItems: UserQueueItem[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert() {
    this.id = generateShortId()
    this.podcastId = this.podcast.id
  }

  @BeforeInsert()
  @BeforeUpdate()
  beforeAll() {
    if (this.guid) {
      this.guid = this.guid.trim() === '' ? '' : this.guid.trim()
    }
  }
}
