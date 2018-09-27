import { hash } from 'bcryptjs'
import { IsEmail, Validate } from 'class-validator'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity,
  OneToMany, PrimaryColumn, UpdateDateColumn, Generated } from 'typeorm'
import { saltRounds } from 'lib/constants'
import { Playlist } from 'entities'
import { ValidatePassword } from 'entities/validation/password'

const shortid = require('shortid')

@Entity('users')
export class User {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @IsEmail()
  @Column({ unique: true })
  email: string

  @Column({ unique: true })
  @Generated('uuid')
  emailVerificationToken: string

  @Column({ default: false })
  emailVerified: boolean

  @Column({ nullable: true })
  name: string

  @Validate(ValidatePassword)
  @Column()
  password: string

  @Column('varchar', { array: true })
  subscribedPodcastIds: string[]

  @OneToMany(type => Playlist, playlist => playlist.owner, {
    cascade: true
  })
  playlists: Playlist[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
    this.subscribedPodcastIds = this.subscribedPodcastIds || []
  }

  @BeforeInsert()
  @BeforeUpdate()
  async beforeAll () {
    this.password = await hash(this.password, saltRounds)
  }

}
