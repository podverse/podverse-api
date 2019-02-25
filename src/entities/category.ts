import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity,
  ManyToMany, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn }
  from 'typeorm'
import { Podcast } from '~/entities'
const shortid = require('shortid')

@Entity('categories')
export class Category {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column({ unique: true })
  fullPath: string

  @Column()
  slug: string

  @Column({ unique: true })
  title: string

  @ManyToOne(type => Category, category => category.categories)
  category: Category

  @OneToMany(type => Category, category => category.category)
  categories: Category[]

  @ManyToMany(type => Podcast, podcast => podcast.categories)
  podcasts: Podcast[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  @BeforeUpdate()
  addSlug () {
    this.slug = this.title.replace(/\s+/g, '-').toLowerCase()
  }

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
  }
}
