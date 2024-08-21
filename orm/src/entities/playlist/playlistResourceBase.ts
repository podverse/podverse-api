import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Playlist } from '@orm/entities/playlist/playlist';

@Entity()
@Unique(['playlist', 'list_position'])
export class PlaylistResourceBase {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Playlist, playlist => playlist.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playlist_id' })
  playlist!: Playlist;

  @Column({ type: 'numeric' })
  list_position!: number;
}