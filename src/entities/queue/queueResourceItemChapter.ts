import { Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { ItemChapter } from "@/entities/item/itemChapter";
import { QueueResourceBase } from "@/entities/queue/queueResourceBase";

@Entity()
@Unique(['queue'])
export class QueueResourceItemChapter extends QueueResourceBase {
  @ManyToOne(() => ItemChapter, itemChapter => itemChapter.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_chapter_id' })
  itemChapter!: ItemChapter;
}
