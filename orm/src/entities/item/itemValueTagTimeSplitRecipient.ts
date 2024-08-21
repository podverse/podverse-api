import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValueTagTimeSplit } from '@orm/entities/item/itemValueTagTimeSplit';

@Entity()
export class ItemValueTagTimeSplitRecipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValueTagTimeSplit, itemValueTagTimeSplit => itemValueTagTimeSplit.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_tag_time_split_id' })
  item_value_tag_time_split!: ItemValueTagTimeSplit;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  address!: string;

  @Column({ type: 'float' })
  split!: number;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'varchar', nullable: true })
  custom_key?: string;

  @Column({ type: 'varchar', nullable: true })
  custom_value?: string;

  @Column({ type: 'boolean', default: false })
  fee!: boolean;
}