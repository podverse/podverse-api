/* eslint-disable @typescript-eslint/no-unused-vars */

import { Column, Entity, Index, PrimaryGeneratedColumn  } from 'typeorm'

@Entity('recentCategoryEpisodes')
@Index(['categoryId', 'podcastId', 'episodeId'], { unique: true })
export class RecentCategoryEpisodes {

  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  categoryId: string

  @Column()
  podcastId: string

  @Column()
  episodeId: string
}
