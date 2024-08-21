import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';

@Entity()
export class ChannelCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @ManyToOne(() => ChannelCategory, channelCategory => channelCategory.id, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent!: ChannelCategory | null;
}
