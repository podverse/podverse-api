/* eslint-disable @typescript-eslint/no-unused-vars */

import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from '~/entities'

@Entity('fcmDevices')
export class FCMDevice {
  @PrimaryColumn()
  fcmToken: string

  @ManyToOne((type) => User, (user) => user.fcmDevices, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
