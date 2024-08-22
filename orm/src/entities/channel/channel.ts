import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, Index, OneToOne, JoinColumn } from 'typeorm';
import { Feed } from '@orm/entities/feed/feed'; 
import { MediumValue } from '@orm/entities/mediumValue';

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

  @OneToOne(() => Feed, { cascade: true })
  @JoinColumn({ name: 'feed_id' })
  feed!: Feed;

  @Column({ type: 'int', nullable: false })
  feed_id!: number;

  @Column({ type: 'int' })
  podcast_index_id!: number;

  @Column({ type: 'uuid', nullable: true })
  podcast_guid!: string | null;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', nullable: true })
  sortable_title!: string | null;

  @ManyToOne(() => MediumValue, medium_value => medium_value.id, { nullable: true })
  medium_value!: MediumValue | null;

  @Column({ type: 'boolean', default: false })
  has_podcast_index_value_tags!: boolean;

  @Column({ type: 'boolean', default: false })
  hidden!: boolean;

  @Column({ type: 'boolean', default: false })
  marked_for_deletion!: boolean;
}
