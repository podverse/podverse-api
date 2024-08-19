import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@/entities/channel/channel';
import { MediumValue } from '@/entities/mediumValue';

@Entity({ name: 'channel_remote_item' })
export class ChannelRemoteItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'uuid', name: 'feed_guid' })
  feedGuid!: string;

  @Column({ type: 'varchar', name: 'feed_url', nullable: true })
  feedUrl!: string;

  @Column({ type: 'varchar', name: 'item_guid', nullable: true })
  itemGuid!: string;

  @Column({ type: 'varchar', name: 'title', nullable: true })
  title!: string;

  @ManyToOne(() => MediumValue, mediumValue => mediumValue.id, { nullable: true })
  @JoinColumn({ name: 'medium_value_id' })
  mediumValue!: MediumValue;
}
