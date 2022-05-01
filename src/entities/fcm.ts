/* eslint-disable @typescript-eslint/no-unused-vars */

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Podcast, User } from '~/entities'

@Entity('fcms')
export class FCM {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  fcm: string

  @ManyToOne((type) => Podcast, (podcast) => podcast.fcms, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  podcast: Podcast

  @ManyToOne((type) => User, (user) => user.fcms, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
