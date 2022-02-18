import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Episode } from '.'

@Entity('episodeAlternateEnclosure')
export class EpisodeAlternateEnclosure {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  bitrate: number

  @Column({ nullable: true })
  codecs: string

  @Column({ default: false })
  default: boolean

  @Column({ nullable: true })
  height: number

  /* Use isPublic false to hide EpisodeAlternateEnclosures
    when they're no longer found in a feed item. */
  @Column({ default: false })
  isPublic: boolean

  @Column({ nullable: true })
  lang: string

  @Column()
  length: number

  @Column({ nullable: true })
  rel: string

  @Column({ nullable: true })
  title: string

  @Column()
  type: string

  @Index()
  @ManyToOne((type) => Episode, (episode) => episode.episodeAlternateEnclosures, {
    onDelete: 'CASCADE'
  })
  episode: Episode

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
