import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelValueTagTimeSplit } from '@/entities/channel/channelValueTagTimeSplit';

@Entity({ name: 'channel_value_tag_time_split_remote_item' })
export class ChannelValueTagTimeSplitRemoteItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelValueTagTimeSplit, channelValueTagTimeSplit => channelValueTagTimeSplit.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_value_tag_time_split_id' })
  channelValueTagTimeSplit!: ChannelValueTagTimeSplit;

  @Column({ type: 'uuid', name: 'feed_guid' })
  feedGuid!: string;

  @Column({ type: 'varchar', name: 'feed_url' })
  feedUrl!: string;

  @Column({ type: 'varchar', name: 'item_guid' })
  itemGuid!: string;

  @Column({ type: 'varchar', name: 'title' })
  title!: string;
}
