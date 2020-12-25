/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsInt, Min } from 'class-validator'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Episode, MediaRef } from '~/entities'
import { User } from './user'

@Entity('userNowPlayingItems')
export class UserNowPlayingItem {

  @PrimaryGeneratedColumn('uuid')
  id: string

  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  userPlaybackPosition: number

  @ManyToOne(type => Episode, episode => episode.userNowPlayingItems)
  episode: Episode

  @ManyToOne(type => MediaRef, mediaRef => mediaRef.userNowPlayingItems, { nullable: true })
  mediaRef: MediaRef

  @OneToOne(
    type => User,
    user => user.userNowPlayingItem,
    { nullable: false }
  )
  @JoinColumn()
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

}
