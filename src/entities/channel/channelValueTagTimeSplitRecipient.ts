import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelValueTagTimeSplit } from '@/entities/channel/channelValueTagTimeSplit';

@Entity({ name: 'channel_value_tag_time_split_receipient' })
export class ChannelValueTagTimeSplitReceipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelValueTagTimeSplit, channelValueTagTimeSplit => channelValueTagTimeSplit.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_value_tag_time_split_id' })
  channelValueTagTimeSplit!: ChannelValueTagTimeSplit;

  @Column({ type: 'varchar', length: 255, name: 'type' })
  type!: string;

  @Column({ type: 'varchar', length: 255, name: 'address' })
  address!: string;

  @Column({ type: 'float', name: 'split' })
  split!: number;

  @Column({ type: 'varchar', length: 255, name: 'name', nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 255, name: 'custom_key', nullable: true })
  customKey?: string;

  @Column({ type: 'varchar', length: 255, name: 'custom_value', nullable: true })
  customValue?: string;

  @Column({ type: 'boolean', name: 'fee', default: false })
  fee!: boolean;
}
