import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Channel } from '@/entities/channel/channel';

@Entity()
@Unique(['channel'])
export class ChannelLicense {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', length: 255 })
  type!: string;

  @Column({ type: 'varchar', length: 255 })
  url!: string;
}
