import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelPublisher } from '@orm/entities/channel/channelPublisher';

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
  feed_url!: string | null;

  @Column({ type: 'varchar', name: 'item_guid', nullable: true })
  item_guid!: string | null;

  @Column({ type: 'varchar', name: 'title', nullable: true })
  title!: string | null;
}
