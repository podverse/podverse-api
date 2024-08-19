import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelValueTag } from '@/entities/channel/channelValueTag';

@Entity({ name: 'channel_value_tag_receipient' })
export class ChannelValueTagReceipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelValueTag, channelValueTag => channelValueTag.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_value_tag_id' })
  channelValueTag!: ChannelValueTag;

  @Column({ type: 'varchar', length: 255, name: 'type' })
  type!: string;

  @Column({ type: 'varchar', length: 255, name: 'address' })
  address!: string;

  @Column({ type: 'float', name: 'split' })
  split!: number;

  @Column({ type: 'varchar', length: 255, name: 'name', nullable: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, name: 'custom_key', nullable: true })
  customKey!: string;

  @Column({ type: 'varchar', length: 255, name: 'custom_value', nullable: true })
  customValue!: string;

  @Column({ type: 'boolean', name: 'fee', default: false })
  fee!: boolean;
}
