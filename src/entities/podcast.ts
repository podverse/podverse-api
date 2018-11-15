import { IsUrl, IsInt, Min, ValidateIf } from 'class-validator'
import { Author, Category, Episode, FeedUrl } from 'entities'
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinTable,
  ManyToMany, OneToMany, PrimaryColumn, UpdateDateColumn, BeforeUpdate } from 'typeorm'

const shortid = require('shortid')

@Entity('podcasts')
export class Podcast {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column({ nullable: true })
  description?: string

  @Column({ nullable: true })
  feedLastUpdated?: Date

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

  @Column({ nullable: true })
  language?: string

  @Column({ nullable: true })
  lastEpisodePubDate?: Date

  @Column({ nullable: true })
  lastEpisodeTitle?: String

  @ValidateIf(a => a.linkUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  linkUrl?: string

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
  title?: string

  @Column({ nullable: true })
  type?: string

  @ManyToMany(type => Author)
  @JoinTable()
  authors: Author[]

  @ManyToMany(type => Category)
  @JoinTable()
  categories: Category[]

  @OneToMany(type => Episode, episode => episode.podcast, {
    cascade: true
  })
  episodes: Episode[]

  @OneToMany(type => FeedUrl, feedUrl => feedUrl.podcast, {
    cascade: true
  })
  feedUrls: FeedUrl[]

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
