/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsInt, Min } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm'
import { Episode, MediaRef, User } from '~/entities'

@Entity('userHistoryItems')
@Unique('index_episode_owner', ['episode', 'owner'])
@Unique('index_mediaRef_owner', ['mediaRef', 'owner'])
export class UserHistoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ default: false })
  completed: boolean

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  mediaFileDuration: number

  @Column()
  orderChangedDate: Date

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  userPlaybackPosition: number

  @ManyToOne((type) => Episode, (episode) => episode.userHistoryItems, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  episode: Episode

  @ManyToOne((type) => MediaRef, (mediaRef) => mediaRef.userHistoryItems, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  mediaRef: MediaRef

  @Index()
  @ManyToOne((type) => User, (user) => user.userHistoryItems, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
