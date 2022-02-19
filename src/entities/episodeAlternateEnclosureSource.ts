import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { EpisodeAlternateEnclosure } from '.'

@Entity('episodeAlternateEnclosureSource')
export class EpisodeAlternateEnclosureSource {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /* Assign a priority to represent the preferred order of sources.  */
  @Column()
  priority: number

  @Column()
  type: string

  @Column()
  uri: string

  @Index()
  @ManyToOne((type) => EpisodeAlternateEnclosure, (episodeAlternateEnclosure) => episodeAlternateEnclosure.sources, {
    onDelete: 'CASCADE'
  })
  episodeAlternateEnclosure: EpisodeAlternateEnclosure

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
