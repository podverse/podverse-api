import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@orm/entities/account/account';

@Entity()
export class AccountCredentials {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;
}
