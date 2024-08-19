import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';
import { AccountMembership } from '@/entities/account/accountMembership';

@Entity()
export class AccountMembershipStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => AccountMembership, accountMembership => accountMembership.id)
  @JoinColumn({ name: 'account_membership_id' })
  accountMembership!: AccountMembership;

  @Column({ type: 'timestamp', nullable: true })
  membershipExpiresAt?: Date;
}