import { Column, Entity, Index, PrimaryColumn  } from 'typeorm'

@Entity('recentEpisodesByPodcast')
@Index(['podcastId', 'episodeId'], { unique: true })
export class RecentEpisodeByPodcast {
  @PrimaryColumn()
  podcastId: string

  @PrimaryColumn()
  episodeId: string

  @Index()
  @Column({ nullable: true })
  pubDate?: Date
}
