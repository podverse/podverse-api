import { Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { ItemSoundbite } from "@/entities/item/itemSoundbite";
import { QueueResourceBase } from "@/entities/queue/queueResourceBase";

@Entity()
@Unique(['queue'])
export class QueueResourceItemSoundbite extends QueueResourceBase {
  @ManyToOne(() => ItemSoundbite, itemSoundbite => itemSoundbite.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'soundbite_id' })
  soundbite!: ItemSoundbite;
}