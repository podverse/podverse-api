import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ItemValue } from '@orm/entities/item/itemValue';

@Entity()
export class ItemValueTimeSplit {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValue, itemValue => itemValue.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_id' })
  item_value!: ItemValue;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  start_time!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  duration!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  remote_start_time!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 100 })
  remote_percentage!: string;
}
