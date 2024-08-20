import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
export class ItemChapter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  text_id!: string;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_chapters_file_id' })
  item_chapters_file!: Item;

  @Column({ type: 'varchar' })
  hash!: string;

  @Column({ type: 'varchar' })
  start_time!: string;

  @Column({ type: 'varchar', nullable: true })
  end_time?: string;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'varchar', nullable: true })
  web_url?: string;

  @Column({ type: 'boolean', default: true })
  table_of_contents!: boolean;
}