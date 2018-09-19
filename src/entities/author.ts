import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity,
  PrimaryColumn, UpdateDateColumn } from 'typeorm'

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

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  @BeforeUpdate()
  beforeAll () {
    this.slug = this.name.replace(/\s+/g, '-').toLowerCase()
    this.name = this.name.trim()
  }

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
  }

}
