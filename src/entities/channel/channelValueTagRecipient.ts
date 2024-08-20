import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelValueTag } from '@/entities/channel/channelValueTag';

@Entity({ name: 'channel_value_tag_receipient' })
export class ChannelValueTagReceipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelValueTag, channelValueTag => channelValueTag.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_value_tag_id' })
  channel_value_tag!: ChannelValueTag;

  @Column({ type: 'varchar', length: 255, name: 'type' })
  type!: string;

  @Column({ type: 'varchar', length: 255, name: 'address' })
  address!: string;

  @Column({ type: 'float', name: 'split' })
  split!: number;

  @Column({ type: 'varchar', length: 255, name: 'name', nullable: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, name: 'custom_key', nullable: true })
  custom_key!: string;

  @Column({ type: 'varchar', length: 255, name: 'custom_value', nullable: true })
  custom_value!: string;

  @Column({ type: 'boolean', name: 'fee', default: false })
  fee!: boolean;
}
