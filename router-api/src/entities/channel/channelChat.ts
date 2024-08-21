import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@/entities/channel/channel';

@Entity()
export class ChannelChat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar' })
  server!: string;

  @Column({ type: 'varchar', nullable: true })
  protocol!: string;

  @Column({ type: 'varchar', nullable: true })
  account_id!: string;

  @Column({ type: 'varchar', nullable: true })
  space!: string;
}
