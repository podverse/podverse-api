import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';

@Entity()
export class ChannelChat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar' })
  server!: string;

  @Column({ type: 'varchar' })
  protocol!: string;

  @Column({ type: 'varchar', nullable: true })
  account_id!: string | null;

  @Column({ type: 'varchar', nullable: true })
  space!: string | null;
}
