import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValueTagTimeSplit } from '@/entities/item/itemValueTagTimeSplit';

@Entity()
export class ItemValueTagTimeSplitRecipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValueTagTimeSplit, itemValueTagTimeSplit => itemValueTagTimeSplit.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_tag_time_split_id' })
  item_value_tag_time_split!: ItemValueTagTimeSplit;

  @Column({ type: 'varchar', length: 255 })
  type!: string;

  @Column({ type: 'varchar', length: 1024 })
  address!: string;

  @Column({ type: 'float' })
  split!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  custom_key?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  custom_value?: string;

  @Column({ type: 'boolean', default: false })
  fee!: boolean;
}