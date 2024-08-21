import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelValueTag } from '@/entities/channel/channelValueTag';

@Entity({ name: 'channel_value_tag_time_split' })
export class ChannelValueTagTimeSplit {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelValueTag, channelValueTag => channelValueTag.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_value_tag_id' })
  channel_value_tag!: ChannelValueTag;

  @Column({ type: 'int', name: 'start_time' })
  start_time!: number;

  @Column({ type: 'int', name: 'duration' })
  duration!: number;

  @Column({ type: 'int', name: 'remote_start_time', default: 0 })
  remote_start_time!: number;

  @Column({ type: 'int', name: 'remote_percentage', default: 100 })
  remote_percentage!: number;
}
