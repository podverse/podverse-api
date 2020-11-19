/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsUrl, IsInt, Min, ValidateIf } from 'class-validator'
import { Author, Category, MediaRef, Podcast } from '~/entities'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index,
  JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn,
  UpdateDateColumn } from 'typeorm'

const shortid = require('shortid')

type Funding = {
  url: string
  value: string
}

type Transcript = {
  language?: string
  rel?: string
  type?: string
  value?: string
}

@Entity('episodes')
export class Episode {

  @Index()
  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column({ nullable: true })
  chaptersType?: string

  @ValidateIf(a => a.chaptersUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  chaptersUrl?: string

  @Column({ nullable: true })
  chaptersUrlLastParsed: Date

  @Column({ nullable: true })
  description?: string

  @ValidateIf(a => a.duration != null)
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

  @ValidateIf(a => a.imageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  imageUrl?: string

  @Column({ default: false })
  isExplicit: boolean

  @Index()
  @Column({ default: false })
  isPublic: boolean

  @ValidateIf(a => a.linkUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  linkUrl?: string

  @ValidateIf(a => a.mediaFilesize != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  mediaFilesize: number

  @Column({ nullable: true })
  mediaType?: string

  @Index()
  @IsUrl()
  @Column({ unique: true })
  mediaUrl: string

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

  @Index()
  @ValidateIf(a => a.pastAllTimeTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastAllTimeTotalUniquePageviews: number

  @Index()
  @Column({ nullable: true })
  pubDate?: Date

  @Index()
  @Column({ nullable: true })
  title?: string

  @Column('simple-json', { nullable: true })
  transcript: Transcript[]

  @ManyToMany(type => Author)
  @JoinTable()
  authors: Author[]

  @ManyToMany(type => Category)
  @JoinTable()
  categories: Category[]

  @OneToMany(type => MediaRef, mediaRef => mediaRef.episode)
  mediaRefs: MediaRef[]

  @Index()
  @ManyToOne(type => Podcast, podcast => podcast.episodes, {
    onDelete: 'CASCADE'
  })
  podcast: Podcast

  // TODO: can/should this be removed?
  @Index()
  @Column()
  podcastId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
    this.podcastId = this.podcast.id
  }

  @BeforeInsert()
  @BeforeUpdate()
  beforeAll () {
    if (this.guid) {
      this.guid = this.guid.trim() === '' ? '' : this.guid.trim()
    }
  }

}
