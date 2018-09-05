import { IsUrl, IsInt, Min, ValidateIf } from 'class-validator'
import { Author } from 'entities/author'
import { Category } from 'entities/category'
import { Episode } from 'entities/episode'
import { FeedUrl } from 'entities/feedUrl'
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinTable,
  ManyToMany, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'

const shortid = require('shortid')

@Entity('podcasts')
export class Podcast {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToMany(type => Author, author => author.podcasts)
  @JoinTable()
  authors: Author[]

  @ManyToMany(type => Category, category => category.podcasts)
  @JoinTable()
  categories: Category[]

  @OneToMany(type => Episode, episode => episode.podcast)
  episodes: Episode[]

  @OneToMany(type => FeedUrl, feedUrl => feedUrl.podcast)
  feedUrls: FeedUrl[]

  @Column({ nullable: true })
  description: string

  @ValidateIf(a => a.imageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  imageUrl: string

  @Column({ default: false })
  isExplicit: boolean

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
  title: string

  @BeforeInsert()
  ensureUniqueIds () {
    this.id = shortid.generate()
  }

  @BeforeInsert()
  trimStrings () {
    if (this.description) {
      this.description = this.description.trim() === '' ? null : this.description.trim()
    }
    if (this.title) {
      this.title = this.title.trim() === '' ? null : this.title.trim()
    }
  }

}
