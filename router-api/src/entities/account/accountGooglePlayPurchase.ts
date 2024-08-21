import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';

@Entity()
export class AccountGooglePlayPurchase {
  @PrimaryColumn()
  transaction_id!: string;

  @Column({ nullable: true })
  acknowledgement_state?: number;

  @Column({ nullable: true })
  consumption_state?: number;

  @Column({ nullable: true })
  developer_payload?: string;

  @Column({ nullable: true })
  kind?: string;

  @Column()
  product_id!: string;

  @Column({ nullable: true })
  purchase_time_millis?: string;

  @Column({ nullable: true })
  purchase_state?: number;

  @Column({ unique: true })
  purchase_token!: string;

  @Column()
  account_id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}