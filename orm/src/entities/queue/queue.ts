import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@orm/entities/account/account';
import { Medium } from '@orm/entities/medium';

@Entity()
export class Queue {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => Medium, medium => medium.id)
  @JoinColumn({ name: 'medium_value_id' })
  medium_value!: Medium;
}