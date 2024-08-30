import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelValue } from '@orm/entities/channel/channelValue';

@Entity({ name: 'channel_value_recipient' })
export class ChannelValueRecipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelValue, channelValue => channelValue.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_value_id' })
  channel_value!: ChannelValue;

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
