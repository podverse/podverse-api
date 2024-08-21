import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@orm/entities/account/account';
import { Channel } from '@orm/entities/channel/channel';

@Entity()
export class AccountNotification {
  @PrimaryColumn()
  channel_id!: number;

  @PrimaryColumn()
  account_id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}