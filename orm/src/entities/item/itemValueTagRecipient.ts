import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValueTag } from '@orm/entities/item/itemValueTag';

@Entity()
export class ItemValueTagRecipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValueTag, itemValueTag => itemValueTag.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_tag_id' })
  item_value_tag!: ItemValueTag;

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