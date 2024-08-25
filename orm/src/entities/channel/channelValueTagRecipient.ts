import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelValueTag } from '@orm/entities/channel/channelValueTag';

@Entity({ name: 'channel_value_tag_receipient' })
export class ChannelValueTagReceipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelValueTag, channelValueTag => channelValueTag.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_value_tag_id' })
  channel_value_tag!: ChannelValueTag;

  @Column({ type: 'varchar', name: 'type' })
  type!: string;

  @Column({ type: 'varchar', name: 'address' })
  address!: string;

  @Column({ type: 'float', name: 'split' })
  split!: number;

  @Column({ type: 'varchar', name: 'name', nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', name: 'custom_key', nullable: true })
  custom_key!: string | null;

  @Column({ type: 'varchar', name: 'custom_value', nullable: true })
  custom_value!: string | null;

  @Column({ type: 'boolean', name: 'fee', default: false })
  fee!: boolean;
}
