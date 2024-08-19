import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
export class ItemChapter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  textId!: string;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_chapters_file_id' })
  itemChaptersFile!: Item;

  @Column({ type: 'varchar' })
  hash!: string;

  @Column({ type: 'varchar' })
  startTime!: string;

  @Column({ type: 'varchar', nullable: true })
  endTime?: string;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'varchar', nullable: true })
  webUrl?: string;

  @Column({ type: 'boolean', default: true })
  tableOfContents!: boolean;
}