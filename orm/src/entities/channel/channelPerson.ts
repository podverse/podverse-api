import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';

@Entity()
export class ChannelPerson {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  role!: string;

  @Column({ type: 'varchar', default: 'cast' })
  person_group!: string;

  @Column({ type: 'varchar' })
  img!: string;

  @Column({ type: 'varchar' })
  href!: string;
}