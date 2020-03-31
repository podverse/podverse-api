/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsUrl, IsInt, Min, ValidateIf } from 'class-validator'
import { Author, Category, MediaRef, Podcast } from '~/entities'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index,
  JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn,
  UpdateDateColumn } from 'typeorm'

const shortid = require('shortid')

@Entity('episodes')
export class Episode {

  @Index()
  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column({ nullable: true })
  description?: string

  @ValidateIf(a => a.duration != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  duration?: number

  @Column({ nullable: true })
  episodeType?: string

  @Column({ nullable: true })
  guid?: string

  @ValidateIf(a => a.imageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  imageUrl?: string

  @Column({ default: false })
  isExplicit: boolean

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

  @Column({ nullable: true })
  title?: string

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

  // This podcastId field is Mitch's hacky workaround for not knowing how to
  // use the TypeORM query builder with nested relational properties.
  // See the getMediaRefs query in the mediaRef controller for example of where I
  // needed to query for mediaRefs filtered by episode.id and episode.podcast.id.
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
