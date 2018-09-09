import { IsUrl } from 'class-validator'
import { Podcast } from 'entities'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn,
  UpdateDateColumn } from 'typeorm'

@Entity('feedUrls')
export class FeedUrl {

  @IsUrl()
  @PrimaryColumn('varchar')
  url: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(type => Podcast, podcast => podcast.feedUrls)
  podcast: Podcast

  @Column({ default: false })
  isAuthority: boolean

}
