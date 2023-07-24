/* eslint-disable @typescript-eslint/no-unused-vars */

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from '~/entities'

export interface UPEndpointData {
  upEndpoint: string
  upPublicKey: string
  upAuthKey: string
}

@Entity('upDevices')
export class UPDevice {
  @PrimaryColumn()
  upEndpoint: string

  // E2EE
  @Column()
  upPublicKey: string

  // E2EE
  @Column()
  upAuthKey: string

  @ManyToOne((type) => User, (user) => user.upDevices, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
