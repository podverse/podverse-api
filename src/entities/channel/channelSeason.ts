import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Channel } from '@/entities/channel/channel';

@Entity({ name: 'channel_season' })
@Unique(['channelId', 'number'])
export class ChannelSeason {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', name: 'channel_id' })
  channelId!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'integer', name: 'number' })
  number!: number;

  @Column({ type: 'varchar', name: 'name' })
  name!: string;
}
