import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { ItemChaptersFeed } from './itemChaptersFeed';

const shortid = require('shortid');

@Entity()
export class ItemChapter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  id_text!: string;

  @ManyToOne(() => ItemChaptersFeed, item_chapters_feed => item_chapters_feed.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_chapters_feed_id' })
  item_chapters_feed!: ItemChaptersFeed;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  start_time!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  end_time?: string | null;

  @Column({ type: 'varchar', nullable: true })
  title?: string | null;

  @Column({ type: 'varchar', nullable: true })
  img?: string | null;

  @Column({ type: 'varchar', nullable: true })
  web_url?: string | null;

  @Column({ type: 'boolean', default: true })
  table_of_contents!: boolean;

  @BeforeInsert()
  setIdText() {
    this.id_text = shortid.generate();
  }
}