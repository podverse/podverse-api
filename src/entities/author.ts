/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { Podcast } from '~/entities'
import { convertToSlug } from '~/lib/utility'
import { generateShortId } from '~/lib/utility'

@Entity('authors')
export class Author {
  @PrimaryColumn('varchar', {
    default: generateShortId(),
    length: 14
  })
  id: string

  @Column()
  @Generated('increment')
  int_id: number

  @Index()
  @Column()
  name: string

  @Index()
  @Column({ unique: true })
  slug: string

  @ManyToMany((type) => Podcast, (podcast) => podcast.authors)
  podcasts: Podcast[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  @BeforeUpdate()
  beforeAll() {
    this.name = this.name.trim()
    this.slug = convertToSlug(this.name)
  }

  @BeforeInsert()
  beforeInsert() {
    this.id = generateShortId()
  }
}
