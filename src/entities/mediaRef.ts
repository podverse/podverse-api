import { IsUrl, IsInt, Min, IsNotEmpty, ValidateIf } from 'class-validator'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn,
  UpdateDateColumn } from 'typeorm'

const shortid = require('shortid')

@Entity('mediaRefs')
export class MediaRef {

  @PrimaryGeneratedColumn('uuid')
  id: string

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

  @IsNotEmpty()
  @Column()
  episodeId: string

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

  @IsUrl()
  @Column()
  podcastFeedUrl: string

  @ValidateIf(a => a.podcastImageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  podcastImageUrl: string

  @IsNotEmpty()
  @Column()
  podcastId: string

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

}
