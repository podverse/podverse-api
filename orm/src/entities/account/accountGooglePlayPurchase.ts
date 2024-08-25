import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@orm/entities/account/account';

@Entity()
export class AccountGooglePlayPurchase {
  @PrimaryColumn()
  transaction_id!: string;

  @Column({ type: 'int', nullable: true })
  acknowledgement_state?: number | null;

  @Column({ type: 'int', nullable: true })
  consumption_state?: number | null;

  @Column({ type: 'varchar', nullable: true })
  developer_payload?: string | null;

  @Column({ type: 'varchar', nullable: true })
  kind?: string | null;

  @Column()
  product_id!: string;

  @Column({ type: 'varchar', nullable: true })
  purchase_time_millis?: string | null;

  @Column({ type: 'int', nullable: true })
  purchase_state?: number | null;

  @Column({ type: 'varchar', unique: true })
  purchase_token!: string;

  @Column()
  account_id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}