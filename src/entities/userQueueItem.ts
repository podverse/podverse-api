/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsInt, Min } from 'class-validator'
import { PodcastMedium } from 'podverse-shared'
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Episode, MediaRef, User } from '~/entities'
import { podcastMediumAllowedValues } from '~/lib/constants'

@Entity('userQueueItems')
export class UserQueueItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  queuePosition: number

  @Column({
    type: 'enum',
    enum: podcastMediumAllowedValues,
    default: 'mixed'
  })
  medium: PodcastMedium

  @ManyToOne((type) => Episode, (episode) => episode.userQueueItems, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  episode: Episode

  @ManyToOne((type) => MediaRef, (mediaRef) => mediaRef.userQueueItems, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  mediaRef: MediaRef

  @Index()
  @ManyToOne((type) => User, (user) => user.userQueueItems, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
