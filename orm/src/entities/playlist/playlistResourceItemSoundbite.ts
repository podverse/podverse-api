import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ItemSoundbite } from '@orm/entities/item/itemSoundbite';
import { PlaylistResourceBase } from '@orm/entities/playlist/playlistResourceBase';

@Entity()
export class PlaylistResourceItemSoundbite extends PlaylistResourceBase {
  @ManyToOne(() => ItemSoundbite, itemSoundbite => itemSoundbite.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'soundbite_id' })
  soundbite!: ItemSoundbite;
}
