import { Entity, PrimaryGeneratedColumn, Column, Unique, Check } from 'typeorm';

@Entity()
@Unique(['itunesEpisodeType'])
@Check(`"itunesEpisodeType" IN ('full', 'trailer', 'bonus')`)
export class ItemItunesEpisodeType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', name: 'itunes_episode_type' })
  itunes_episode_type!: string;
}
