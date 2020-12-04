/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsUrl } from 'class-validator'
import { Podcast } from '~/entities'
import { BeforeInsert, Column, CreateDateColumn, Entity, Generated, Index, ManyToOne,
  PrimaryColumn, UpdateDateColumn } from 'typeorm'
const shortid = require('shortid')

@Entity('feedUrls')
export class FeedUrl {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column()
  @Generated('increment')
  int_id: number

  @Column({ default: false })
  isAuthority: boolean

  @Index()
  @IsUrl()
  @Column({ unique: true })
  url: string

  @ManyToOne(type => Podcast, podcast => podcast.feedUrls, {
    onDelete: 'CASCADE'
  })
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
