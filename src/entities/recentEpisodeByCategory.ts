import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity('recentEpisodesByCategory')
@Index(['categoryId', 'pubDate'])
export class RecentEpisodeByCategory {
  @PrimaryColumn()
  episodeId: string

  @Column()
  categoryId: string

  @Column({ nullable: true })
  pubDate?: Date
}
