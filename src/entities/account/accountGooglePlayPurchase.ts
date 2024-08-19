import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';

@Entity()
export class AccountGooglePlayPurchase {
  @PrimaryColumn()
  transactionId!: string;

  @Column({ nullable: true })
  acknowledgementState?: number;

  @Column({ nullable: true })
  consumptionState?: number;

  @Column({ nullable: true })
  developerPayload?: string;

  @Column({ nullable: true })
  kind?: string;

  @Column()
  productId!: string;

  @Column({ nullable: true })
  purchaseTimeMillis?: string;

  @Column({ nullable: true })
  purchaseState?: number;

  @Column({ unique: true })
  purchaseToken!: string;

  @Column()
  accountId!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}