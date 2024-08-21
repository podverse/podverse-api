import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelPodroll } from '@/entities/channel/channelPodroll';
import { MediumValue } from '@/entities/mediumValue';

@Entity({ name: 'channel_podroll_remote_item' })
export class ChannelPodrollRemoteItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelPodroll, channelPodroll => channelPodroll.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_podroll_id' })
  channel_podroll!: ChannelPodroll;

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
