import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';

@Entity()
export class AccountAppStorePurchase {
  @PrimaryColumn()
  transaction_id!: string;

  @Column({ nullable: true })
  cancellation_date?: string;

  @Column({ nullable: true })
  cancellation_date_ms?: string;

  @Column({ nullable: true })
  cancellation_date_pst?: string;

  @Column({ nullable: true })
  cancellation_reason?: string;

  @Column({ nullable: true })
  expires_date?: string;

  @Column({ nullable: true })
  expires_date_ms?: string;

  @Column({ nullable: true })
  expires_date_pst?: string;

  @Column({ nullable: true })
  is_in_intro_offer_period?: boolean;

  @Column({ nullable: true })
  is_trial_period?: boolean;

  @Column({ nullable: true })
  original_purchase_date?: string;

  @Column({ nullable: true })
  original_purchase_date_ms?: string;

  @Column({ nullable: true })
  original_purchase_date_pst?: string;

  @Column({ nullable: true })
  original_transaction_id?: string;

  @Column({ nullable: true })
  product_id?: string;

  @Column({ nullable: true })
  promotional_offer_id?: string;

  @Column({ nullable: true })
  purchase_date?: string;

  @Column({ nullable: true })
  purchase_date_ms?: string;

  @Column({ nullable: true })
  purchase_date_pst?: string;

  @Column({ nullable: true })
  quantity?: number;

  @Column({ nullable: true })
  web_order_line_item_id?: string;

  @Column()
  account_id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}