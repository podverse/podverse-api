import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@orm/entities/account/account';
import { AccountMembership } from '@orm/entities/account/accountMembership';

@Entity()
export class AccountMembershipStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => AccountMembership, accountMembership => accountMembership.id)
  @JoinColumn({ name: 'account_membership_id' })
  account_membership!: AccountMembership;

  @Column({ type: 'timestamp', nullable: true })
  membership_expires_at?: Date;
}