import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValueTimeSplit } from '@orm/entities/item/itemValueTimeSplit';

@Entity()
export class ItemValueTimeSplitRemoteItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValueTimeSplit, itemValueTimeSplit => itemValueTimeSplit.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_time_split_id' })
  item_value_time_split!: ItemValueTimeSplit;

  @Column({ type: 'uuid' })
  feed_guid!: string;

  @Column({ type: 'varchar', nullable: true })
  feed_url?: string | null;

  @Column({ type: 'varchar', nullable: true })
  item_guid?: string | null;

  @Column({ type: 'varchar', nullable: true })
  title?: string | null;
}