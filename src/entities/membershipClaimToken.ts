import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AccountMembership } from '@/entities/account/accountMembership';

@Entity()
export class MembershipClaimToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: false })
  claimed!: boolean;

  @Column({ default: 1 })
  yearsToAdd!: number;

  @Column()
  accountMembershipId!: number;

  @ManyToOne(() => AccountMembership, accountMembership => accountMembership.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_membership_id' })
  accountMembership!: AccountMembership;
}