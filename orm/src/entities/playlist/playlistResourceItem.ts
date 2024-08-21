import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { PlaylistResourceBase } from "@orm/entities/playlist/playlistResourceBase";
import { Item } from "../item/item";

@Entity()
export class PlaylistResourceItem extends PlaylistResourceBase {
  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;
}