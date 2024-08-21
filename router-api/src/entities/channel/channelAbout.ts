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

  @Column({ type: 'varchar', nullable: true })
  author!: string;

  @Column({ type: 'int', nullable: true })
  episode_count!: number;

  @Column({ type: 'boolean', nullable: true })
  explicit!: boolean;

  @ManyToOne(() => ChannelItunesType, channelItunesType => channelItunesType.id, { nullable: true })
  @JoinColumn({ name: 'itunes_type_id' })
  itunes_type!: ChannelItunesType;

  @Column({ type: 'varchar' })
  language!: string;

  @Column({ type: 'varchar', nullable: true })
  website_link_url!: string;
}