import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelValue } from '@orm/entities/channel/channelValue';

@Entity({ name: 'channel_value_time_split' })
export class ChannelValueTimeSplit {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelValue, channelValue => channelValue.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_value_id' })
  channel_value!: ChannelValue;

  @Column({ type: 'int', name: 'start_time' })
  start_time!: number;

  @Column({ type: 'int', name: 'duration' })
  duration!: number;

  @Column({ type: 'int', name: 'remote_start_time', default: 0 })
  remote_start_time!: number;

  @Column({ type: 'int', name: 'remote_percentage', default: 100 })
  remote_percentage!: number;
}
