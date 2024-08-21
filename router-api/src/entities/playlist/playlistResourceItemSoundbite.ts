import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ItemSoundbite } from '@/entities/item/itemSoundbite';
import { PlaylistResourceBase } from '@/entities/playlist/playlistResourceBase';

@Entity()
export class PlaylistResourceItemSoundbite extends PlaylistResourceBase {
  @ManyToOne(() => ItemSoundbite, itemSoundbite => itemSoundbite.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'soundbite_id' })
  soundbite!: ItemSoundbite;
}
