import { IsUrl, IsInt, Min, IsNotEmpty, ValidateIf } from 'class-validator'
// import { Episode } from 'entities/episode'
// import { Podcast } from 'entities/podcast'
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn,
  UpdateDateColumn} from 'typeorm'

const shortid = require('shortid')

@Entity('mediaRefs')
export class MediaRef {

  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ValidateIf(a => a.allTimeTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  allTimeTotalUniquePageviews: number

  @Column({ nullable: true })
  dateCreated: Date

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

  // @ManyToOne(type => Episode, { nullable: false })
  // episode: Episode

  @ValidateIf(a => a.episodeImageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  episodeImageUrl: string

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
  lastUpdated: Date

  @Column({ nullable: true })
  ownerId: string

  @Column({ nullable: true })
  ownerName: string

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

  // @ManyToOne(type => Podcast, { nullable: false })
  // podcast: Podcast

  @IsUrl()
  @Column()
  podcastFeedUrl: string

  @ValidateIf(a => a.podcastImageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  podcastImageUrl: string

  @Column({ nullable: true })
  podcastTitle: string

  @Column('text', { default: shortid.generate() })
  shortId: string

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  startTime: number

  @Column({ nullable: true })
  title: string

  @BeforeInsert()
  trimStrings () {
    if (this.description) {
      this.description = this.description.trim() === '' ? null : this.description.trim()
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
    if (this.podcastTitle) {
      this.podcastTitle = this.podcastTitle.trim() === '' ? null : this.podcastTitle.trim()
    }
    if (this.shortId) {
      this.shortId = this.shortId.trim() === '' ? null : this.shortId.trim()
    }
    if (this.title) {
      this.title = this.title.trim() === '' ? null : this.title.trim()
    }
  }

}
