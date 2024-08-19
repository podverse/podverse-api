import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemChapter } from '@/entities/item/itemChapter';

@Entity()
export class ItemChapterImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemChapter, itemChapter => itemChapter.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_chapter_id' })
  itemChapter!: ItemChapter;

  @Column({ type: 'varchar', name: 'url' })
  url!: string;

  @Column({ type: 'int', name: 'image_width_size', nullable: true })
  imageWidthSize?: number;

  @Column({ type: 'boolean', name: 'is_resized', default: false })
  isResized!: boolean;
}
