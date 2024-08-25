import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelItunesType } from '@orm/entities/channel/channelItunesType';

@Entity()
export class ChannelAbout {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', nullable: true })
  author!: string | null;

  @Column({ type: 'int', nullable: true })
  episode_count!: number | null;

  @Column({ type: 'boolean', nullable: true })
  explicit!: boolean | null;

  @ManyToOne(() => ChannelItunesType, channelItunesType => channelItunesType.id, { nullable: true })
  @JoinColumn({ name: 'itunes_type_id' })
  itunes_type!: ChannelItunesType | null;

  @Column({ type: 'varchar', nullable: true })
  language!: string | null;

  @Column({ type: 'varchar', nullable: true })
  website_link_url!: string | null;
}