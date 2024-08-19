import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValueTag } from '@/entities/item/itemValueTag';

@Entity()
export class ItemValueTagRecipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValueTag, itemValueTag => itemValueTag.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_tag_id' })
  itemValueTag!: ItemValueTag;

  @Column({ type: 'varchar', length: 255 })
  type!: string;

  @Column({ type: 'varchar', length: 1024 })
  address!: string;

  @Column({ type: 'float' })
  split!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  customKey?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  customValue?: string;

  @Column({ type: 'boolean', default: false })
  fee!: boolean;
}