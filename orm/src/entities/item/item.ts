import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, BeforeInsert, OneToOne } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';
import { LiveItem } from '../liveItem/liveItem';
import { ItemChaptersFeed } from './itemChaptersFeed';
const shortid = require('shortid');

@Entity()
@Index('item_slug', ['slug'], { unique: true, where: 'slug IS NOT NULL' })
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  id_text!: string;
  
  @Column({ type: 'varchar', name: 'slug', nullable: true })
  slug?: string | null;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;
  
  @Column({ type: 'varchar', name: 'guid', nullable: true })
  guid?: string | null;

  @Column({ type: 'varchar', name: 'guid_enclosure_url' })
  guid_enclosure_url!: string;

  @Column({ type: 'timestamptz', name: 'pubdate', nullable: true })
  pubdate?: Date | null;

  @Column({ type: 'varchar', name: 'title', nullable: true })
  title?: string | null;

  @OneToOne(() => LiveItem, liveItem => liveItem.item, { nullable: true })
  live_item!: LiveItem | null;

  @OneToOne(() => ItemChaptersFeed, item_chapters_feed => item_chapters_feed.item, { nullable: true })
  item_chapters_feed!: ItemChaptersFeed | null;

  @Column({ type: 'boolean', name: 'hidden', default: false })
  hidden!: boolean;

  @Column({ type: 'boolean', name: 'marked_for_deletion', default: false })
  marked_for_deletion!: boolean;

  @BeforeInsert()
  generateIdText() {
    this.id_text = shortid.generate();
  }
}
