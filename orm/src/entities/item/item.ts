import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';

@Entity()
@Unique(['id_text'])
@Index('item_slug', ['slug'], { unique: true, where: 'slug IS NOT NULL' })
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', name: 'id_text' })
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

  @Column({ type: 'boolean', name: 'hidden', default: false })
  hidden!: boolean;

  @Column({ type: 'boolean', name: 'marked_for_deletion', default: false })
  marked_for_deletion!: boolean;
}
