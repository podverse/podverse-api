import { IsUrl, IsInt, Min, ValidateIf } from 'class-validator'
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, JoinTable,
  ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { Author } from 'entities/author'
import { Category } from 'entities/category'
import { Episode } from 'entities/episode'
import { Playlist } from 'entities/playlist'
import { Podcast } from 'entities/podcast'
import { User } from 'entities/user'

import { entityRelationships } from 'config'
const { mustHavePodcast, mustHaveUser } = entityRelationships.mediaRef

const shortid = require('shortid')

@Entity('mediaRefs')
export class MediaRef {
  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToMany(type => Author, author => author.mediaRefs)
  @JoinTable()
  authors: Author[]

  @ManyToMany(type => Category, category => category.mediaRefs)
  @JoinTable()
  categories: Category[]

  @ManyToOne(type => Episode, { nullable: !mustHavePodcast })
  @JoinColumn({ name: '_episodeId' })
  episode: Episode

  @ManyToOne(type => User, { nullable: !mustHaveUser })
  @JoinColumn({ name: '_ownerId' })
  owner: User

  @ManyToMany(type => Playlist, playlist => playlist.mediaRefs)
  playlists: Playlist[]

  @ManyToOne(type => Podcast, { nullable: !mustHavePodcast })
  @JoinColumn({ name: '_podcastId' })
  podcast: Podcast

  @Column({ nullable: true })
  description: string

  @ValidateIf(a => a.endTime != null)
  @IsInt()
  @Min(1)
  @Column({ nullable: true })
  endTime: number

  @ValidateIf(a => a.episodeDuration != null)
  @IsInt()
  @Min(0)
  @Column({ nullable: true })
  episodeDuration: number

  @Column({ nullable: true })
  episodeGuid: string

  @Column({ nullable: true })
  episodeId: string

  @ValidateIf(a => a.episodeImageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  episodeImageUrl: string

  @Column({ default: false })
  episodeIsExplicit: boolean

  @ValidateIf(a => a.episodeLinkUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  episodeLinkUrl: string

  @IsUrl()
  @Column()
  episodeMediaUrl: string

  @Column({ nullable: true })
  episodePubDate: Date

  @Column({ nullable: true })
  episodeSummary: string

  @Column({ nullable: true })
  episodeTitle: string

  @Column({ default: false })
  isPublic: boolean

  @Column({ nullable: true })
  ownerId: string

  @Column({ nullable: true })
  ownerName: string

  @ValidateIf(a => a.pastAllTimeTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastAllTimeTotalUniquePageviews: number

  @ValidateIf(a => a.pastHourTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastHourTotalUniquePageviews: number

  @ValidateIf(a => a.pastDayTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastDayTotalUniquePageviews: number

  @ValidateIf(a => a.pastWeekTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastWeekTotalUniquePageviews: number

  @ValidateIf(a => a.pastMonthTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastMonthTotalUniquePageviews: number

  @ValidateIf(a => a.pastYearTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastYearTotalUniquePageviews: number

  @IsUrl()
  @Column()
  podcastFeedUrl: string

  @Column({ nullable: true })
  podcastGuid: string

  @Column({ nullable: true })
  podcastId: string

  @ValidateIf(a => a.podcastImageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  podcastImageUrl: string

  @Column({ default: false })
  podcastIsExplicit: boolean

  @Column({ nullable: true })
  podcastTitle: string

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  startTime: number

  @Column({ nullable: true })
  title: string

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
  }

  @BeforeInsert()
  trimStrings () {
    if (this.description) {
      this.description = this.description.trim() === '' ? null : this.description.trim()
    }
    if (this.episodeGuid) {
      this.episodeGuid = this.episodeGuid.trim() === '' ? null : this.episodeGuid.trim()
    }
    if (this.episodeId) {
      this.episodeId = this.episodeId.trim() === '' ? null : this.episodeId.trim()
    }
    if (this.episodeSummary) {
      this.episodeSummary = this.episodeSummary.trim() === '' ? null : this.episodeSummary.trim()
    }
    if (this.episodeTitle) {
      this.episodeTitle = this.episodeTitle.trim() === '' ? null : this.episodeTitle.trim()
    }
    if (this.ownerId) {
      this.ownerId = this.ownerId.trim() === '' ? null : this.ownerId.trim()
    }
    if (this.ownerName) {
      this.ownerName = this.ownerName.trim() === '' ? null : this.ownerName.trim()
    }
    if (this.podcastGuid) {
      this.podcastGuid = this.podcastGuid.trim() === '' ? null : this.podcastGuid.trim()
    }
    if (this.podcastId) {
      this.podcastId = this.podcastId.trim() === '' ? null : this.podcastId.trim()
    }
    if (this.podcastTitle) {
      this.podcastTitle = this.podcastTitle.trim() === '' ? null : this.podcastTitle.trim()
    }
    if (this.title) {
      this.title = this.title.trim() === '' ? null : this.title.trim()
    }
  }
}
