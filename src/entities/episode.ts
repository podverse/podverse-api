import { IsUrl, IsInt, Min, ValidateIf } from 'class-validator'
import { Author } from 'entities/author'
import { Category } from 'entities/category'
import { MediaRef } from 'entities/mediaRef'
import { Podcast } from 'entities/podcast'
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinTable, ManyToMany,
  ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'

const shortid = require('shortid')

@Entity('episodes')
export class Episode {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToMany(type => Author, author => author.episodes)
  @JoinTable()
  authors: Author[]

  @ManyToMany(type => Category, category => category.episodes)
  @JoinTable()
  categories: Category[]

  @OneToMany(type => MediaRef, mediaRef => mediaRef.episode)
  mediaRefs: MediaRef[]

  @ManyToOne(type => Podcast, podcast => podcast.episodes)
  podcast: Podcast

  @Column({ nullable: true })
  description: string

  @ValidateIf(a => a.duration != null)
  @IsInt()
  @Min(0)
  @Column({ nullable: true })
  duration: number

  @ValidateIf(a => a.imageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  imageUrl: string

  @Column({ default: false })
  isExplicit: boolean

  @Column({ default: false })
  isPublic: boolean

  @ValidateIf(a => a.linkUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  linkUrl: string

  @IsUrl()
  @Column({ unique: true })
  mediaUrl: string

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

  @Column({ nullable: true })
  pubDate: Date

  @Column({ nullable: true })
  title: string

  @BeforeInsert()
  beforeInsert() {
    this.id = shortid.generate()
  }

}
