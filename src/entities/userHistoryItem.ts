/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsInt, Min } from 'class-validator'
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn,
  UpdateDateColumn } from 'typeorm'
import { Episode, MediaRef, User } from '~/entities'

@Entity('userHistoryItems')
export class UserHistoryItem {

  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  orderChangedDate: Date

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  userPlaybackPosition: number

  @ManyToOne(type => Episode, episode => episode.userHistoryItems, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  episode: Episode

  @ManyToOne(type => MediaRef, mediaRef => mediaRef.userHistoryItems, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  mediaRef: MediaRef

  @Index()
  @ManyToOne(type => User, user => user.userHistoryItems, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

}
