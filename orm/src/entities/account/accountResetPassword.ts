import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@orm/entities/account/account';

@Entity()
export class AccountResetPassword {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column({ type: 'varchar' })
  reset_token!: string;

  @Column({ type: 'timestamp' })
  reset_token_expires_at!: Date;
}