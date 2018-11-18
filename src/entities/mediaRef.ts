import { IsUrl, IsInt, Min, ValidateIf } from 'class-validator'
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn,
  JoinTable,ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn,
  BeforeUpdate } from 'typeorm'
import { Author, Category, Episode, User } from 'entities'

const shortid = require('shortid')

@Entity('mediaRefs')
export class MediaRef {
  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @ValidateIf(a => a.endTime != null)
  @IsInt()
  @Min(1)
  @Column({ nullable: true })
  endTime: number

  @Column({ nullable: true })
  episodeDescription?: string

  @ValidateIf(a => a.episodeDuration != null)
  @IsInt()
  @Min(0)
  @Column({ nullable: true })
  episodeDuration?: number

  @Column({ nullable: true })
  episodeGuid?: string

  @Column({ nullable: true })
  episodeId?: string

  @ValidateIf(a => a.episodeImageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  episodeImageUrl?: string

  @Column({ default: false })
  episodeIsExplicit: boolean

  @ValidateIf(a => a.episodeLinkUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  episodeLinkUrl?: string

  @IsUrl()
  @Column()
  episodeMediaUrl: string

  @Column({ nullable: true })
  episodePubDate?: Date

  @Column({ nullable: true })
  episodeTitle?: string

  @Column({ default: false })
  isPublic: boolean

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

  @ValidateIf(a => a.podcastFeedUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  podcastFeedUrl: string

  @Column({ nullable: true })
  podcastGuid?: string

  @Column({ nullable: true })
  podcastId?: string

  @ValidateIf(a => a.podcastImageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  podcastImageUrl?: string

  @Column({ default: false })
  podcastIsExplicit: boolean

  @Column({ nullable: true })
  podcastTitle?: string

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  startTime: number

  @Column({ nullable: true })
  title?: string

  @ManyToMany(type => Author)
  @JoinTable()
  authors: Author[]

  @ManyToMany(type => Category)
  @JoinTable()
  categories: Category[]

  @ManyToOne(type => Episode, episode => episode.mediaRefs, {
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  episode: Episode

  @ManyToOne(type => User, user => user.mediaRefs, {
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
  }

  @BeforeInsert()
  @BeforeUpdate()
  trimStrings () {
    if (this.episodeGuid) {
      this.episodeGuid = this.episodeGuid.trim() === '' ? undefined : this.episodeGuid.trim()
    }
    if (this.episodeId) {
      this.episodeId = this.episodeId.trim() === '' ? undefined : this.episodeId.trim()
    }
    if (this.episodeDescription) {
      this.episodeDescription = this.episodeDescription.trim() === '' ? undefined : this.episodeDescription.trim()
    }
    if (this.episodeTitle) {
      this.episodeTitle = this.episodeTitle.trim() === '' ? undefined : this.episodeTitle.trim()
    }
    if (this.podcastGuid) {
      this.podcastGuid = this.podcastGuid.trim() === '' ? undefined : this.podcastGuid.trim()
    }
    if (this.podcastId) {
      this.podcastId = this.podcastId.trim() === '' ? undefined : this.podcastId.trim()
    }
    if (this.podcastTitle) {
      this.podcastTitle = this.podcastTitle.trim() === '' ? undefined : this.podcastTitle.trim()
    }
    if (this.title) {
      this.title = this.title.trim() === '' ? undefined : this.title.trim()
    }
  }
}
