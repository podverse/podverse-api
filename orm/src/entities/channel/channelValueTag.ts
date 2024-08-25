import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';

@Entity({ name: 'channel_value_tag' })
export class ChannelValueTag {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', name: 'type' })
  type!: string;

  @Column({ type: 'varchar', name: 'method' })
  method!: string;

  @Column({ type: 'float', name: 'suggested', nullable: true })
  suggested!: number | null;
}
