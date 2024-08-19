import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';

@Entity()
export class AccountResetPassword {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column({ type: 'varchar', length: 36 })
  resetToken!: string;

  @Column({ type: 'timestamp' })
  resetTokenExpiresAt!: Date;
}