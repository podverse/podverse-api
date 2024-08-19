import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Playlist } from '@/entities/playlist/playlist';

@Entity()
@Unique(['playlist', 'listPosition'])
export class PlaylistResourceBase {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Playlist, playlist => playlist.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playlist_id' })
  playlist!: Playlist;

  @Column({ type: 'numeric' })
  listPosition!: number;
}