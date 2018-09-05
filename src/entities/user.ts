import { IsEmail } from 'class-validator'
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn,
  UpdateDateColumn } from 'typeorm'

const shortid = require('shortid')

@Entity('users')
export class User {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @IsEmail()
  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  name: string

  @Column('varchar', { array: true })
  subscribedPodcastIds: string[]

  @BeforeInsert()
  ensureUniqueIds () {
    this.id = shortid.generate()
  }

}
