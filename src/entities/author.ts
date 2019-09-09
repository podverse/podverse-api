import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity,
  ManyToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { Podcast } from '~/entities'
import { convertToSlug } from '~/lib/utility'
const shortid = require('shortid')

@Entity('authors')
export class Author {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column({ unique: true })
  name: string

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
    this.slug = convertToSlug(this.name)
    this.name = this.name.trim()
  }

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
  }
}
