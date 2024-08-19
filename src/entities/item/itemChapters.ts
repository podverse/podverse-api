import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
export class ItemChapters {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar', name: 'url' })
  url!: string;

  @Column({ type: 'varchar', name: 'type' })
  type!: string;

  @Column({ type: 'int', name: 'last_http_status', nullable: true })
  lastHttpStatus?: number;

  @Column({ type: 'timestamp', name: 'last_crawl_time', nullable: true })
  lastCrawlTime?: Date;

  @Column({ type: 'timestamp', name: 'last_good_http_status_time', nullable: true })
  lastGoodHttpStatusTime?: Date;

  @Column({ type: 'timestamp', name: 'last_parse_time', nullable: true })
  lastParseTime?: Date;

  @Column({ type: 'timestamp', name: 'last_update_time', nullable: true })
  lastUpdateTime?: Date;

  @Column({ type: 'int', name: 'crawl_errors', default: 0 })
  crawlErrors!: number;

  @Column({ type: 'int', name: 'parse_errors', default: 0 })
  parseErrors!: number;
}
