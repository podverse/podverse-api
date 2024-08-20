import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValueTagTimeSplit } from '@/entities/item/itemValueTagTimeSplit';

@Entity()
export class ItemValueTagTimeSplitRemoteItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValueTagTimeSplit, itemValueTagTimeSplit => itemValueTagTimeSplit.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_tag_time_split_id' })
  item_value_tag_time_split!: ItemValueTagTimeSplit;

  @Column({ type: 'uuid' })
  feed_guid!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  feed_url?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  item_guid?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;
}