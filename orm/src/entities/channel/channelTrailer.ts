import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';

@Entity({ name: 'channel_trailer' })
export class ChannelTrailer {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', name: 'title', nullable: true })
  title!: string;

  @Column({ type: 'varchar', name: 'url' })
  url!: string;

  @Column({ type: 'timestamptz', name: 'pub_date' })
  pubDate!: Date;

  @Column({ type: 'integer', name: 'length', nullable: true })
  length!: number;

  @Column({ type: 'varchar', name: 'type', nullable: true })
  type!: string;

  @Column({ type: 'integer', name: 'season', nullable: true })
  season!: number;
}
