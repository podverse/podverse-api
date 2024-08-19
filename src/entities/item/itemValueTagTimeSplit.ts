import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValueTag } from '@/entities/item/itemValueTag';

@Entity()
export class ItemValueTagTimeSplit {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValueTag, itemValueTag => itemValueTag.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_tag_id' })
  itemValueTag!: ItemValueTag;

  @Column({ type: 'int' })
  startTime!: number;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'int', default: 0 })
  remoteStartTime!: number;

  @Column({ type: 'int', default: 100 })
  remotePercentage!: number;
}