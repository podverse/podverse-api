import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Item } from '@orm/entities/item/item';
import { ItemChaptersFeedLog } from '@orm/entities/item/itemChaptersFeedLog';

@Entity('item_chapters_feed')
export class ItemChaptersFeed {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar', name: 'url' })
  url!: string;

  @Column({ type: 'varchar', name: 'type' })
  type!: string;

  @OneToOne(() => ItemChaptersFeedLog, item_chapters_feed_log => item_chapters_feed_log.item_chapters_feed)
  item_chapters_feed_log!: ItemChaptersFeedLog;
}
