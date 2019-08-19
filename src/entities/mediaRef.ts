import { IsInt, Min, ValidateIf } from 'class-validator'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index,
  JoinTable,ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { Author, Category, Episode, User } from '~/entities'

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

  @Column({ default: false })
  isPublic: boolean

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
  episode: Episode

  @ManyToOne(type => User, user => user.mediaRefs, {
    onDelete: 'CASCADE'
  })
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
    if (this.title) {
      this.title = this.title.trim() === '' ? undefined : this.title.trim()
    }
  }
}
