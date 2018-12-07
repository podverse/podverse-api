import { Episode, MediaRef, User } from 'entities'
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinTable,
  ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn,
  BeforeUpdate } from 'typeorm'

const shortid = require('shortid')

@Entity('playlists')
export class Playlist {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column({ nullable: true })
  description?: string

  @Column({ default: false })
  isMyClips: boolean

  @Column({ default: false })
  isPublic: boolean

  @Column({ default: 0 })
  itemCount: number

  @Column('varchar', { array: true })
  itemsOrder: string[]

  @Column({ nullable: true })
  title?: string

  @ManyToMany(type => Episode)
  @JoinTable()
  episodes: Episode[]

  @ManyToMany(type => MediaRef)
  @JoinTable()
  mediaRefs: MediaRef[]

  @ManyToOne(type => User, { nullable: false })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
    this.itemsOrder = this.itemsOrder || []
  }

  @BeforeInsert()
  @BeforeUpdate()
  trimStrings () {
    if (this.description) {
      this.description = this.description.trim() === '' ? undefined : this.description.trim()
    }
    if (this.title) {
      this.title = this.title.trim() === '' ? undefined : this.title.trim()
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  setItemCount () {
    if (this.mediaRefs) {
      this.itemCount = this.mediaRefs.length
    }
  }
}
