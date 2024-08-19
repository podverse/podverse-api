import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValueTagTimeSplit } from '@/entities/item/itemValueTagTimeSplit';

@Entity()
export class ItemValueTagTimeSplitRemoteItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValueTagTimeSplit, itemValueTagTimeSplit => itemValueTagTimeSplit.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_tag_time_split_id' })
  itemValueTagTimeSplit!: ItemValueTagTimeSplit;

  @Column({ type: 'uuid' })
  feedGuid!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  feedUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  itemGuid?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;
}