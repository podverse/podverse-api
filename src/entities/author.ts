/* eslint-disable @typescript-eslint/no-unused-vars */

import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index,
  ManyToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { Podcast } from '~/entities'
import { convertToSlug } from '~/lib/utility'
const shortid = require('shortid')

@Entity('authors')
export class Author {

  @Index()
  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Index()
  @Column()
  name: string

  @Index()
  @Column({ unique: true })
  slug: string

  @ManyToMany(type => Podcast, podcast => podcast.authors)
  podcasts: Podcast[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  @BeforeUpdate()
  beforeAll () {
    this.name = this.name.trim()
    this.slug = convertToSlug(this.name)
  }

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
  }
}
