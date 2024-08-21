import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AccountMembership } from '@orm/entities/account/accountMembership';

@Entity()
export class MembershipClaimToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: false })
  claimed!: boolean;

  @Column({ default: 1 })
  years_to_add!: number;

  @Column()
  account_membership_id!: number;

  @ManyToOne(() => AccountMembership, accountMembership => accountMembership.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_membership_id' })
  account_membership!: AccountMembership;
}