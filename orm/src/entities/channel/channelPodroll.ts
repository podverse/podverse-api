import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';

@Entity()
export class ChannelPodroll {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;
}
