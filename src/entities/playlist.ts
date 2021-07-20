/* eslint-disable @typescript-eslint/no-unused-vars */

import { Episode, MediaRef, User } from '~/entities'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Generated, Index,
  JoinTable, ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { generateShortId } from '~/lib/utility'

@Entity('playlists')
export class Playlist {

  @PrimaryColumn('varchar', {
    default: generateShortId(),
    length: 14
  })
  id: string

  @Column()
  @Generated('increment')
  int_id: number

  @Column({ nullable: true })
  description?: string

  @Index()
  @Column({ default: false })
  isPublic: boolean

  @Column({ default: 0 })
  itemCount: number

  @Column('varchar', { array: true })
  itemsOrder: string[]

  @Index()
  @Column({ nullable: true })
  title?: string

  @ManyToMany(type => Episode)
  @JoinTable()
  episodes: Episode[]

  @ManyToMany(type => MediaRef)
  @JoinTable()
  mediaRefs: MediaRef[]

  @ManyToOne(type => User, user => user.playlists, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert () {
    this.id = generateShortId()
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
    if (this.episodes) {
      this.itemCount = this.itemCount + this.episodes.length
    }
  }
}
