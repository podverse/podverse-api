/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsUrl, IsInt, Min, ValidateIf } from 'class-validator'
import {
  EpisodeAlternateEnclosure,
  EpisodeContentLinks,
  Funding,
  SocialInteraction,
  Transcript,
  ValueTagOriginal
} from 'podverse-shared'
import {
  Author,
  Category,
  LiveItem,
  MediaRef,
  Podcast,
  StatsEpisode,
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
  JoinColumn,
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

  @Index()
  @Column({ nullable: true })
  itunesEpisode?: number

  @Index()
  @Column({ nullable: true })
  itunesEpisodeType?: string

  @Index()
  @Column({ nullable: true })
  itunesSeason?: number

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

  @Column({ nullable: true })
  pubDate?: Date

  @Column('simple-json', { nullable: true })
  socialInteraction: SocialInteraction[]

  @Column({ nullable: true })
  subtitle?: string

  @Index()
  @Column({ nullable: true })
  title?: string

  @Column('simple-json', { nullable: true })
  transcript: Transcript[]

  @Column('simple-json', { nullable: true })
  value: ValueTagOriginal[]

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

  @OneToOne(() => StatsEpisode, { nullable: true })
  @JoinColumn({ name: 'stats_episode_id' })
  stats_episode?: StatsEpisode

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
