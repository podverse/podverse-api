import { Episode, MediaRef, Podcast } from 'entities'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity,
  JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn }
  from 'typeorm'

const shortid = require('shortid')

@Entity('categories')
export class Category {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column()
  slug: string

  @Column({ unique: true })
  title: string

  @ManyToOne(type => Category, category => category.categories)
  category: Category

  @OneToMany(type => Category, category => category.category)
  categories: Category[]

  @ManyToMany(type => Episode)
  @JoinTable()
  episodes: Episode[]

  @ManyToMany(type => MediaRef)
  @JoinTable()
  mediaRefs: MediaRef[]

  @ManyToMany(type => Podcast)
  @JoinTable()
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
