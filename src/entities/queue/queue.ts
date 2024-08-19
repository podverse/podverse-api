import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';
import { MediumValue } from '@/entities/mediumValue';

@Entity()
export class Queue {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => MediumValue, mediumValue => mediumValue.id)
  @JoinColumn({ name: 'medium_value_id' })
  mediumValue!: MediumValue;
}