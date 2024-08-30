import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ItemChaptersFeed } from '@orm/entities/item/itemChaptersFeed';

@Entity('item_chapters_feed_log')
export class ItemChaptersFeedLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemChaptersFeed, item_chapters_feed => item_chapters_feed.id, { onDelete: 'CASCADE' })
  item_chapters_feed!: ItemChaptersFeed;

  @Column({ type: 'int', nullable: true })
  last_http_status!: number | null;

  @Column({ type: 'timestamp', nullable: true })
  last_crawl_time!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_good_http_status_time!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_parse_time!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_update_time!: Date | null;

  @Column({ type: 'int', default: 0 })
  crawl_errors!: number;

  @Column({ type: 'int', default: 0 })
  parse_errors!: number;
}
