/* eslint-disable @typescript-eslint/no-unused-vars */

import { CreateDateColumn, Entity, ManyToOne, UpdateDateColumn, Unique } from 'typeorm'
import { Podcast, User } from '~/entities'

@Entity('notifications')
@Unique('notifications_pkey', ['podcast', 'user'])
export class Notification {
  // there is a uni
  @ManyToOne((type) => Podcast, (podcast) => podcast.notifications, {
    nullable: false,
    onDelete: 'CASCADE',
    primary: true
  })
  podcast: Podcast

  @ManyToOne((type) => User, (user) => user.notifications, {
    nullable: false,
    onDelete: 'CASCADE',
    primary: true
  })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
