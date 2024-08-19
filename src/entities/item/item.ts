import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { Channel } from '@/entities/channel/channel';

@Entity()
@Unique(['id_text'])
@Index('item_slug', ['slug'], { unique: true, where: 'slug IS NOT NULL' })
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', name: 'id_text' })
  idText!: string;

  @Column({ type: 'varchar', name: 'slug', nullable: true })
  slug?: string;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', name: 'guid', nullable: true })
  guid?: string;

  @Column({ type: 'timestamptz', name: 'pub_date', nullable: true })
  pubDate?: Date;

  @Column({ type: 'varchar', name: 'title', nullable: true })
  title?: string;

  @Column({ type: 'boolean', name: 'hidden', default: false })
  hidden!: boolean;

  @Column({ type: 'boolean', name: 'marked_for_deletion', default: false })
  markedForDeletion!: boolean;
}
