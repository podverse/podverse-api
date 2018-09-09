import { Episode, MediaRef, Podcast } from 'entities'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity,
  ManyToMany, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn }
  from 'typeorm'

const shortid = require('shortid')

@Entity('categories')
export class Category {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(type => Category, category => category.categories)
  category: Category

  @OneToMany(type => Category, category => category.category)
  categories: Category[]

  @ManyToMany(type => Episode, episode => episode.categories)
  episodes: Episode[]

  @ManyToMany(type => MediaRef, mediaRef => mediaRef.categories)
  mediaRefs: MediaRef[]

  @ManyToMany(type => Podcast, podcast => podcast.categories)
  podcasts: Podcast[]

  @Column()
  slug: string

  @Column({ unique: true })
  title: string

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
