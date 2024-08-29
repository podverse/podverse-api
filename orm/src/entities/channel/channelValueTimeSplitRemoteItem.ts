import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelValueTimeSplit } from '@orm/entities/channel/channelValueTimeSplit';

@Entity({ name: 'channel_value_time_split_remote_item' })
export class ChannelValueTimeSplitRemoteItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelValueTimeSplit, channelValueTimeSplit => channelValueTimeSplit.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_value_time_split_id' })
  channel_value_time_split!: ChannelValueTimeSplit;

  @Column({ type: 'uuid', name: 'feed_guid' })
  feed_guid!: string;

  @Column({ type: 'varchar', name: 'feed_url' })
  feed_url!: string;

  @Column({ type: 'varchar', name: 'item_guid' })
  item_guid!: string;

  @Column({ type: 'varchar', name: 'title' })
  title!: string;
}
