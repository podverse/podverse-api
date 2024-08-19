import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Check } from 'typeorm';
import { Channel } from '@/entities/channel/channel';

@Entity()
@Check(`(geo IS NOT NULL AND osm IS NULL) OR (geo IS NULL AND osm IS NOT NULL)`)
export class ChannelLocation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', length: 255, nullable: true })
  geo!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  osm!: string;
}