import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@/entities/channel/channel';
import { ChannelItunesType } from '@/entities/channel/channelItunesType';

@Entity()
export class ChannelAbout {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author!: string;

  @Column({ type: 'int', nullable: true })
  episodeCount!: number;

  @Column({ type: 'boolean', nullable: true })
  explicit!: boolean;

  @ManyToOne(() => ChannelItunesType, channelItunesType => channelItunesType.id, { nullable: true })
  @JoinColumn({ name: 'itunes_type_id' })
  itunesType!: ChannelItunesType;

  @Column({ type: 'varchar', length: 50 })
  language!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  websiteLinkUrl!: string;
}