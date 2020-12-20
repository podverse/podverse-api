/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsInt, IsUrl, Min, ValidateIf } from 'class-validator'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Generated, Index,
  JoinTable,ManyToMany, ManyToOne, OneToMany, PrimaryColumn,
  UpdateDateColumn } from 'typeorm'
import { Author, Category, Episode, User, UserHistoryItem, UserNowPlayingItem,
  UserQueueItem } from '~/entities'

const shortid = require('shortid')

@Entity('mediaRefs')
export class MediaRef {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column()
  @Generated('increment')
  int_id: number

  @ValidateIf(a => a.endTime != null)
  @IsInt()
  @Min(1)
  @Column({ nullable: true })
  endTime: number

  @ValidateIf(a => a.imageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  imageUrl?: string

  @Column({ default: false })
  isOfficialChapter: boolean

  @Column({ default: false })
  isOfficialSoundBite: boolean

  @Index()
  @Column({ default: false })
  isPublic: boolean

  @ValidateIf(a => a.linkUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  linkUrl?: string

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
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  startTime: number

  @Index()
  @Column({ nullable: true })
  title?: string

  @ManyToMany(type => Author)
  @JoinTable()
  authors: Author[]

  @ManyToMany(type => Category)
  @JoinTable()
  categories: Category[]

  @Index()
  @ManyToOne(type => Episode, episode => episode.mediaRefs, {
    onDelete: 'CASCADE'
  })
  episode: Episode

  @ManyToOne(type => User, user => user.mediaRefs, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @OneToMany(type => UserHistoryItem, userHistoryItem => userHistoryItem.mediaRef)
  userHistoryItems: UserHistoryItem[]

  @OneToMany(type => UserNowPlayingItem, userNowPlayingItem => userNowPlayingItem.mediaRef)
  userNowPlayingItems: UserNowPlayingItem[]

  @OneToMany(type => UserQueueItem, userQueueItem => userQueueItem.mediaRef)
  userQueueItems: UserQueueItem[]

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
    if (this.title) {
      this.title = this.title.trim() === '' ? undefined : this.title.trim()
    }
  }
}
