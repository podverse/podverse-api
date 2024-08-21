import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';

@Entity()
export class AccountUpDevice {
  @PrimaryColumn()
  up_endpoint!: string;

  @Column()
  up_public_key!: string;

  @Column()
  up_auth_key!: string;

  @Column()
  account_id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}