import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValue } from '@orm/entities/item/itemValue';

@Entity()
export class ItemValueTimeSplit {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValue, itemValue => itemValue.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_id' })
  item_value!: ItemValue;

  @Column({ type: 'int' })
  start_time!: number;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'int', default: 0 })
  remote_start_time!: number;

  @Column({ type: 'int', default: 100 })
  remote_percentage!: number;
}