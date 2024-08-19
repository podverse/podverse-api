import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
export class ItemTranscript {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar', length: 255 })
  url!: string;

  @Column({ type: 'varchar', length: 255 })
  type!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  language?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rel?: string;
}