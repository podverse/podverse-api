/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsUrl } from 'class-validator'
import { Podcast } from '~/entities'
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm'
import { generateShortId } from '~/lib/utility'

@Entity('feedUrls')
@Unique('index_feedUrlId_isAuthority', ['id', 'isAuthority'])
@Unique('feedUrl_index_podcastId_isAuthority', ['podcast', 'isAuthority'])
export class FeedUrl {
  @PrimaryColumn('varchar', {
    default: generateShortId(),
    length: 14
  })
  id: string

  @Column()
  @Generated('increment')
  int_id: number

  @Column({ default: null, nullable: true })
  isAuthority: boolean

  @Index()
  @IsUrl()
  @Column({ unique: true })
  url: string

  @ManyToOne((type) => Podcast, (podcast) => podcast.feedUrls, {
    onDelete: 'CASCADE'
  })
  podcast: Podcast

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert() {
    this.id = generateShortId()
  }
}
