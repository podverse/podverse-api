import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@orm/entities/item/item';

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
  last_http_status?: number | null;

  @Column({ type: 'timestamp', name: 'last_crawl_time', nullable: true })
  last_crawl_time?: Date | null;

  @Column({ type: 'timestamp', name: 'last_good_http_status_time', nullable: true })
  last_good_http_status_time?: Date | null;

  @Column({ type: 'timestamp', name: 'last_parse_time', nullable: true })
  last_parse_time?: Date | null;

  @Column({ type: 'timestamp', name: 'last_update_time', nullable: true })
  last_update_time?: Date | null;

  @Column({ type: 'int', name: 'crawl_errors', default: 0 })
  crawl_errors!: number;

  @Column({ type: 'int', name: 'parse_errors', default: 0 })
  parse_errors!: number;
}
