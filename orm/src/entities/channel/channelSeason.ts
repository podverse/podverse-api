import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';

@Entity({ name: 'channel_season' })
@Unique(['channel_id', 'number'])
export class ChannelSeason {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', name: 'channel_id' })
  channel_id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'integer', name: 'number' })
  number!: number;

  @Column({ type: 'varchar', name: 'name' })
  name!: string;
}
