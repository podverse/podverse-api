import { IsUrl } from 'class-validator'
import { Podcast } from 'entities'
import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne,
  PrimaryColumn, UpdateDateColumn } from 'typeorm'
const shortid = require('shortid')

@Entity('feedUrls')
export class FeedUrl {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column({ default: false })
  isAuthority: boolean

  @IsUrl()
  @Column({ unique: true })
  url: string

  @ManyToOne(type => Podcast, podcast => podcast.feedUrls)
  podcast: Podcast

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
  }

}
