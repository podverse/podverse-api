import { IsDate, IsUrl, IsInt, Min } from 'class-validator'
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

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  allTimeTotalUniquePageviews: number

  @Column({ nullable: true })
  dateCreated: Date

  @Column({ nullable: true })
  description: string

  @IsInt()
  @Min(1)
  @Column({ nullable: true })
  endTime: number

  @IsInt()
  @Min(0)
  @Column({ nullable: true })
  episodeDuration: number

  @Column()
  episodeId: string

  @IsUrl()
  @Column({ nullable: true })
  episodeImageUrl: string

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

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastHourTotalUniquePageviews: number

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastDayTotalUniquePageviews: number

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastWeekTotalUniquePageviews: number

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastMonthTotalUniquePageviews: number

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastYearTotalUniquePageviews: number

  @IsUrl()
  @Column()
  podcastFeedUrl: string

  @IsUrl()
  @Column({ nullable: true })
  podcastImageUrl: string

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
