import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Clip } from '@/entities/clip';
import { PlaylistResourceBase } from '@/entities/playlist/playlistResourceBase';

@Entity()
export class PlaylistResourceClip extends PlaylistResourceBase {
  @ManyToOne(() => Clip, clip => clip.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clip_id' })
  clip!: Clip;
}