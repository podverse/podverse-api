import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
export class ItemEnclosure {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar', length: 255 })
  type!: string;

  @Column({ type: 'int', nullable: true })
  length?: number;

  @Column({ type: 'int', nullable: true })
  bitrate?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  language?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rel?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  codecs?: string;

  @Column({ type: 'boolean', default: false })
  item_enclosure_default!: boolean;
}