import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValueTimeSplit } from '@orm/entities/item/itemValueTimeSplit';

@Entity()
export class ItemValueTimeSplitRecipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValueTimeSplit, itemValueTimeSplit => itemValueTimeSplit.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_time_split_id' })
  item_value_time_split!: ItemValueTimeSplit;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  address!: string;

  @Column({ type: 'float' })
  split!: number;

  @Column({ type: 'varchar', nullable: true })
  name?: string | null;

  @Column({ type: 'varchar', nullable: true })
  custom_key?: string | null;

  @Column({ type: 'varchar', nullable: true })
  custom_value?: string | null;

  @Column({ type: 'boolean', default: false })
  fee!: boolean;
}