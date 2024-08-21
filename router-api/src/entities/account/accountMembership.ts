import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AccountMembership {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  tier!: 'trial' | 'basic';
}