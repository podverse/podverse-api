import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelValueTimeSplit } from '@orm/entities/channel/channelValueTimeSplit';

@Entity({ name: 'channel_value_time_split_receipient' })
export class ChannelValueTimeSplitReceipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelValueTimeSplit, channelValueTimeSplit => channelValueTimeSplit.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_value_time_split_id' })
  channel_value_time_split!: ChannelValueTimeSplit;

  @Column({ type: 'varchar', name: 'type' })
  type!: string;

  @Column({ type: 'varchar', name: 'address' })
  address!: string;

  @Column({ type: 'float', name: 'split' })
  split!: number;

  @Column({ type: 'varchar', name: 'name', nullable: true })
  name?: string | null;

  @Column({ type: 'varchar', name: 'custom_key', nullable: true })
  custom_key?: string | null;

  @Column({ type: 'varchar', name: 'custom_value', nullable: true })
  custom_value?: string | null;

  @Column({ type: 'boolean', name: 'fee', default: false })
  fee!: boolean;
}
