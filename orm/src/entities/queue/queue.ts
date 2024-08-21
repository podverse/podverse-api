import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@orm/entities/account/account';
import { MediumValue } from '@orm/entities/mediumValue';

@Entity()
export class Queue {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => MediumValue, mediumValue => mediumValue.id)
  @JoinColumn({ name: 'medium_value_id' })
  medium_value!: MediumValue;
}