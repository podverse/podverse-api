import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';

@Entity()
export class AccountFollowingAccount {
  @PrimaryColumn()
  accountId!: number;

  @PrimaryColumn()
  followingAccountId!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_account_id' })
  followingAccount!: Account;
}
