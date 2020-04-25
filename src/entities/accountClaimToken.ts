import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('accountClaimToken')
export class AccountClaimToken {

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ default: false })
  claimed: boolean

  @Column()
  email: string

  @Column({ default: 1 })
  yearsToAdd: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

}
