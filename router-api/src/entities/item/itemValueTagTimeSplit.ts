import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValueTag } from '@/entities/item/itemValueTag';

@Entity()
export class ItemValueTagTimeSplit {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValueTag, itemValueTag => itemValueTag.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_tag_id' })
  item_value_tag!: ItemValueTag;

  @Column({ type: 'int' })
  start_time!: number;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'int', default: 0 })
  remote_start_time!: number;

  @Column({ type: 'int', default: 100 })
  remote_percentage!: number;
}