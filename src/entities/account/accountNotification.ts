import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';
import { Channel } from '@/entities/channel/channel';

@Entity()
export class AccountNotification {
  @PrimaryColumn()
  channelId!: number;

  @PrimaryColumn()
  accountId!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}