import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@orm/entities/account/account';

@Entity()
export class AccountAppStorePurchase {
  @PrimaryColumn()
  transaction_id!: string;

  @Column({ type: 'varchar', nullable: true })
  cancellation_date?: string | null;

  @Column({ type: 'varchar', nullable: true })
  cancellation_date_ms?: string | null;

  @Column({ type: 'varchar', nullable: true })
  cancellation_date_pst?: string | null;

  @Column({ type: 'varchar', nullable: true })
  cancellation_reason?: string | null;

  @Column({ type: 'varchar', nullable: true })
  expires_date?: string | null;

  @Column({ type: 'varchar', nullable: true })
  expires_date_ms?: string | null;

  @Column({ type: 'varchar', nullable: true })
  expires_date_pst?: string | null;

  @Column({ type: 'boolean', nullable: true })
  is_in_intro_offer_period?: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  is_trial_period?: boolean | null;

  @Column({ type: 'varchar', nullable: true })
  original_purchase_date?: string | null;

  @Column({ type: 'varchar', nullable: true })
  original_purchase_date_ms?: string | null;
  
  @Column({ type: 'varchar', nullable: true })
  original_purchase_date_pst?: string | null;
  
  @Column({ type: 'varchar', nullable: true })
  original_transaction_id?: string | null;
  
  @Column({ type: 'varchar', nullable: true })
  product_id?: string | null;
  
  @Column({ type: 'varchar', nullable: true })
  promotional_offer_id?: string | null;
  
  @Column({ type: 'varchar', nullable: true })
  purchase_date?: string | null;
  
  @Column({ type: 'varchar', nullable: true })
  purchase_date_ms?: string | null;
  
  @Column({ type: 'varchar', nullable: true })
  purchase_date_pst?: string | null;
  
  @Column({ type: 'int', nullable: true })
  quantity?: number | null;
  
  @Column({ type: 'varchar', nullable: true })
  web_order_line_item_id?: string | null;

  @Column()
  account_id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}