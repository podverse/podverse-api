import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@orm/entities/account/account';

@Entity()
export class AccountFollowingAddByRssChannel {
  @PrimaryColumn()
  account_id!: number;

  @PrimaryColumn()
  feed_url!: string;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', nullable: true })
  image_url!: string | null;
}