import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity('recentEpisodesByCategory')
@Index(['categoryId', 'episodeId'], { unique: true })
export class RecentEpisodeByCategory {
  @PrimaryColumn()
  categoryId: string

  @PrimaryColumn()
  episodeId: string

  @Index()
  @Column({ nullable: true })
  pubDate?: Date
}
