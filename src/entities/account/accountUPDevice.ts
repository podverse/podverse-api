import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';

@Entity()
export class AccountUpDevice {
  @PrimaryColumn()
  upEndpoint!: string;

  @Column()
  upPublicKey!: string;

  @Column()
  upAuthKey!: string;

  @Column()
  accountId!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}