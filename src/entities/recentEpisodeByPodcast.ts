import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity('recentEpisodesByPodcast')
@Index(['podcastId', 'pubDate'])
export class RecentEpisodeByPodcast {
  @PrimaryColumn()
  episodeId: string

  @Column()
  podcastId: string

  @Column({ nullable: true })
  pubDate?: Date
}
