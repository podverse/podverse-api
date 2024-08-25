import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@orm/entities/item/item';

@Entity()
export class ItemEnclosure {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'int', nullable: true })
  length?: number | null;

  @Column({ type: 'int', nullable: true })
  bitrate?: number | null;

  @Column({ type: 'int', nullable: true })
  height?: number | null;

  @Column({ type: 'varchar', nullable: true })
  language?: string | null;

  @Column({ type: 'varchar', nullable: true })
  title?: string | null;

  @Column({ type: 'varchar', nullable: true })
  rel?: string | null;

  @Column({ type: 'varchar', nullable: true })
  codecs?: string | null;

  @Column({ type: 'boolean', default: false })
  item_enclosure_default!: boolean;
}