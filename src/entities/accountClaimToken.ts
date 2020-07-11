import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('accountClaimToken')
export class AccountClaimToken {

  @Index()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ default: false })
  claimed: boolean

  @Column({ default: 1 })
  yearsToAdd: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

}
