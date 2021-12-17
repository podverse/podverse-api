/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsUrl, IsInt, Min, ValidateIf } from 'class-validator'
import type { PodcastMedium } from 'podverse-shared'
import { Author, Category, Episode, FeedUrl } from '~/entities'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Generated, Index,
  JoinTable, ManyToMany, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { generateShortId } from '~/lib/utility'

type Funding = {
  url: string
  value?: string
}

export type Value = {
  method: string
  suggested?: string
  type: string
  recipients: ValueRecipient[]
}

type ValueRecipient = {
  address: string
  customKey?: string
  customValue?: string
  fee?: boolean
  name?: string
  split: string
  type: string
}

@Entity('podcasts')
export class Podcast {

  @PrimaryColumn('varchar', {
    default: generateShortId(),
    length: 14
  })
  id: string

  @Column()
  @Generated('increment')
  int_id: number

  @Index()
  @Column({ nullable: true, unique: true })
  podcastIndexId?: string

  @Index()
  @Column({ nullable: true, unique: true })
  authorityId?: string

  @Column({ default: false })
  alwaysFullyParse?: boolean

  @Column({ default: false })
  credentialsRequired?: boolean

  @Column({ nullable: true })
  description?: string

  @Column({ default: false })
  feedLastParseFailed?: boolean

  @Index()
  @Column({ nullable: true })
  feedLastUpdated?: Date

  @Column('simple-json', { nullable: true })
  funding: Funding[]

  @Column({ nullable: true })
  guid?: string

  @Column({ default: false })
  hasVideo: boolean

  @Column({ default: false })
  hideDynamicAdsWarning?: boolean

  @ValidateIf(a => a.imageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  imageUrl?: string

  @Column({ default: false })
  isExplicit: boolean

  @Index()
  @Column({ default: false })
  isPublic: boolean

  @Column({ nullable: true })
  language?: string

  @Index()
  @Column({ nullable: true })
  lastEpisodePubDate?: Date

  @Column({ nullable: true })
  lastEpisodeTitle?: string

  @Column({ nullable: true })
  lastFoundInPodcastIndex?: Date

  @ValidateIf(a => a.linkUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  linkUrl?: string

  @Index()
  @Column({
    type: 'enum',
    enum: ['podcast', 'music', 'video', 'film', 'audiobook', 'newsletter', 'blog', 'music-video'],
    default: 'podcast'
  })
  medium: PodcastMedium

  @Index()
  @ValidateIf(a => a.pastAllTimeTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastAllTimeTotalUniquePageviews: number

  @Index()
  @ValidateIf(a => a.pastHourTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastHourTotalUniquePageviews: number

  @Index()
  @ValidateIf(a => a.pastDayTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastDayTotalUniquePageviews: number

  @Index()
  @ValidateIf(a => a.pastWeekTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastWeekTotalUniquePageviews: number

  @Index()
  @ValidateIf(a => a.pastMonthTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastMonthTotalUniquePageviews: number

  @Index()
  @ValidateIf(a => a.pastYearTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastYearTotalUniquePageviews: number

  @ValidateIf(a => a.shrunkImageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  shrunkImageUrl?: string

  @Index()
  @Column({ nullable: true })
  shrunkImageLastUpdated?: Date

  @Index()
  @Column({ nullable: true })
  sortableTitle?: string

  @Index()
  @Column({ nullable: true })
  title?: string

  @Column({ nullable: true })
  type?: string

  @Column('simple-json', { nullable: true })
  value: Value[]

  @ManyToMany(type => Author, author => author.podcasts)
  @JoinTable()
  authors: Author[]

  @ManyToMany(type => Category, category => category.podcasts)
  @JoinTable()
  categories: Category[]

  @OneToMany(type => Episode, episode => episode.podcast)
  episodes: Episode[]

  @OneToMany(type => FeedUrl, feedUrl => feedUrl.podcast)
  feedUrls: FeedUrl[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert () {
    this.id = generateShortId()
  }

  @BeforeInsert()
  @BeforeUpdate()
  beforeAll () {
    if (this.description) {
      this.description = this.description.trim() === '' ? undefined : this.description.trim()
    }
    if (this.guid) {
      this.guid = this.guid.trim() === '' ? undefined : this.guid.trim()
    }
    if (this.title) {
      this.title = this.title.trim() === '' ? undefined : this.title.trim()
    }
  }

}
