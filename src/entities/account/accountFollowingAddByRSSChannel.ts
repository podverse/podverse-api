import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';

@Entity()
export class AccountFollowingAddByRssChannel {
  @PrimaryColumn()
  accountId!: number;

  @PrimaryColumn()
  feedUrl!: string;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column({ type: 'varchar', nullable: true })
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl!: string;
}