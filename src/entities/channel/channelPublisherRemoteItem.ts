import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelPublisher } from '@/entities/channel/channelPublisher';
import { MediumValue } from '@/entities/mediumValue';

@Entity({ name: 'channel_publisher_remote_item' })
export class ChannelPublisherRemoteItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelPublisher, channelPublisher => channelPublisher.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_publisher_id' })
  channel_publisher!: ChannelPublisher;

  @Column({ type: 'uuid', name: 'feed_guid' })
  feed_guid!: string;

  @Column({ type: 'varchar', name: 'feed_url', nullable: true })
  feed_url!: string;

  @Column({ type: 'varchar', name: 'item_guid', nullable: true })
  item_guid!: string;

  @Column({ type: 'varchar', name: 'title', nullable: true })
  title!: string;

  @ManyToOne(() => MediumValue, mediumValue => mediumValue.id, { nullable: true })
  @JoinColumn({ name: 'medium_value_id' })
  medium_value!: MediumValue;
}
