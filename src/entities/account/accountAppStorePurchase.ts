import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';

@Entity()
export class AccountAppStorePurchase {
  @PrimaryColumn()
  transactionId!: string;

  @Column({ nullable: true })
  cancellationDate?: string;

  @Column({ nullable: true })
  cancellationDateMs?: string;

  @Column({ nullable: true })
  cancellationDatePst?: string;

  @Column({ nullable: true })
  cancellationReason?: string;

  @Column({ nullable: true })
  expiresDate?: string;

  @Column({ nullable: true })
  expiresDateMs?: string;

  @Column({ nullable: true })
  expiresDatePst?: string;

  @Column({ nullable: true })
  isInIntroOfferPeriod?: boolean;

  @Column({ nullable: true })
  isTrialPeriod?: boolean;

  @Column({ nullable: true })
  originalPurchaseDate?: string;

  @Column({ nullable: true })
  originalPurchaseDateMs?: string;

  @Column({ nullable: true })
  originalPurchaseDatePst?: string;

  @Column({ nullable: true })
  originalTransactionId?: string;

  @Column({ nullable: true })
  productId?: string;

  @Column({ nullable: true })
  promotionalOfferId?: string;

  @Column({ nullable: true })
  purchaseDate?: string;

  @Column({ nullable: true })
  purchaseDateMs?: string;

  @Column({ nullable: true })
  purchaseDatePst?: string;

  @Column({ nullable: true })
  quantity?: number;

  @Column({ nullable: true })
  webOrderLineItemId?: string;

  @Column()
  accountId!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}