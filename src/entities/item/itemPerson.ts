import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from '@/entities/channel/channel';

@Entity()
export class ItemPerson {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  role!: string;

  @Column({ type: 'varchar', length: 255, default: 'cast' })
  person_group!: string;

  @Column({ type: 'varchar', length: 255 })
  img!: string;

  @Column({ type: 'varchar', length: 255 })
  href!: string;
}