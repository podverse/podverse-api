import { IsUrl, IsUUID } from 'class-validator'
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn,
  UpdateDateColumn } from 'typeorm'
import { User } from '~/entities'

@Entity('bitpayInvoices')
export class BitPayInvoice {

  @Index()
  @PrimaryColumn('varchar')
  id: string

  @Index()
  @IsUUID()
  @Column({ unique: true })
  orderId: string

  @Column({ default: 0 })
  amountPaid: number

  @Column()
  currency: string

  // false, paidPartial, paidOver, paidLate
  @Column({ default: 'false' })
  exceptionStatus: string

  @Column()
  price: number

  // new, paid, confirmed, complete, expired, invalid
  @Column({ nullable: true })
  status?: string

  @Column({ unique: true })
  token: string

  // BTC, BCH
  @Column({ nullable: true })
  transactionCurrency: string

  // high, medium, low
  @Column({ nullable: true })
  transactionSpeed: string

  @IsUrl()
  @Column()
  url: string

  @ManyToOne(type => User, user => user.bitpayInvoices, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
