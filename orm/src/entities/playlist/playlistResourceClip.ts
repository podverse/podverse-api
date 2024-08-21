import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Clip } from '@orm/entities/clip';
import { PlaylistResourceBase } from '@orm/entities/playlist/playlistResourceBase';

@Entity()
export class PlaylistResourceClip extends PlaylistResourceBase {
  @ManyToOne(() => Clip, clip => clip.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clip_id' })
  clip!: Clip;
}