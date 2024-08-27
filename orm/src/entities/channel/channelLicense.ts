import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';

@Entity()
@Unique(['channel'])
export class ChannelLicense {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar' })
  identifier!: string;

  @Column({ type: 'varchar', nullable: true })
  url!: string | null;
}
