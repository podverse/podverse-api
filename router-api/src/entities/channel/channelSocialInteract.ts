import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@/entities/channel/channel';

@Entity({ name: 'channel_social_interact' })
export class ChannelSocialInteract {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', name: 'protocol' })
  protocol!: string;

  @Column({ type: 'varchar', name: 'uri' })
  uri!: string;

  @Column({ type: 'varchar', name: 'account_id', nullable: true })
  account_id!: string;

  @Column({ type: 'varchar', name: 'account_url', nullable: true })
  account_url!: string;

  @Column({ type: 'integer', name: 'priority', nullable: true })
  priority!: number;
}