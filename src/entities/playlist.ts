import { MediaRef } from 'entities/mediaRef'
import { User } from 'entities/user'
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany,
  ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'

const shortid = require('shortid')

@Entity('playlists')
export class Playlist {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToMany(type => MediaRef, mediaRef => mediaRef.playlists)
  @JoinColumn()
  mediaRefs: MediaRef[]

  @ManyToOne(type => User, { nullable: false })
  owner: User

  @Column({ nullable: true })
  description: string

  @Column({ default: false })
  isMyClips: boolean

  @Column({ default: false })
  isPublic: boolean

  @Column('varchar', { array: true })
  itemsOrder: string[]

  @Column({ nullable: true })
  title: string

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
    this.itemsOrder = this.itemsOrder || []
  }

  @BeforeInsert()
  trimStrings () {
    if (this.description) {
      this.description = this.description.trim() === '' ? null : this.description.trim()
    }
    if (this.title) {
      this.title = this.title.trim() === '' ? null : this.title.trim()
    }
  }

}
