import { IsEmail } from 'class-validator'
import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany,
  PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { Playlist } from 'entities'

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

  @Column({ nullable: true })
  name: string

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

}
