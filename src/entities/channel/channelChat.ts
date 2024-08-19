import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@/entities/channel/channel';

@Entity()
export class ChannelChat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', length: 255 })
  server!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  protocol!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  space!: string;
}
