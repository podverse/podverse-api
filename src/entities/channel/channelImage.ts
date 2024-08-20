import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@/entities/channel/channel';

@Entity()
export class ChannelImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', length: 255 })
  url!: string;

  @Column({ type: 'int', nullable: true })
  image_width_size!: number;

  @Column({ type: 'boolean', default: false })
  is_resized!: boolean;
}