import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelSeason } from './channelSeason';

@Entity({ name: 'channel_trailer' })
export class ChannelTrailer {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', name: 'title', nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', name: 'url' })
  url!: string | null;

  @Column({ type: 'timestamptz', name: 'pubdate' })
  pubdate!: Date;

  @Column({ type: 'integer', name: 'length', nullable: true })
  length!: number | null;

  @Column({ type: 'varchar', name: 'type', nullable: true })
  type!: string | null;
  
  @ManyToOne(() => ChannelSeason, channel_season => channel_season.id, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_season_id' })
  channel_season!: ChannelSeason | null;
}
