/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsInt, Min } from 'class-validator'
import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToMany,
  ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Episode, MediaRef, User } from '~/entities'

@Entity('userHistoryItems')
export class UserHistoryItem {

  @PrimaryGeneratedColumn('uuid')
  id: string

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  lastPlaybackPosition: number

  @ManyToOne(type => Episode, episode => episode.userHistoryItems, { nullable: false })
  episode: Episode

  @ManyToMany(type => MediaRef)
  @JoinTable()
  mediaRefs: MediaRef[]

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
