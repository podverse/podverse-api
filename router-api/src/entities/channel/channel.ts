import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, Index } from 'typeorm';
import { Feed } from '@/entities/feed/feed'; 
import { MediumValue } from '@/entities/mediumValue';

@Entity('channel')
@Unique(['id_text'])
@Unique(['podcast_index_id'])
@Unique(['podcast_guid'])
@Index('channel_podcast_guid_unique', ['podcast_guid'], { where: 'podcast_guid IS NOT NULL' })
@Index('channel_slug', ['slug'], { where: 'slug IS NOT NULL' })
export class Channel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  id_text!: string;

  @Column({ type: 'varchar', nullable: true })
  slug!: string | null;

  @ManyToOne(() => Feed, feed => feed.id, { onDelete: 'CASCADE' })
  feed_id!: Feed;

  @Column({ type: 'int' })
  podcast_index_id!: number;

  @Column({ type: 'uuid', nullable: true })
  podcast_guid!: string | null;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', nullable: true })
  sortable_title!: string | null;

  @ManyToOne(() => MediumValue, mediumValue => mediumValue.id, { nullable: true })
  medium_value_id!: MediumValue | null;

  @Column({ type: 'boolean', default: false })
  has_podcast_index_value_tags!: boolean;

  @Column({ type: 'boolean', default: false })
  hidden!: boolean;

  @Column({ type: 'boolean', default: false })
  marked_for_deletion!: boolean;
}