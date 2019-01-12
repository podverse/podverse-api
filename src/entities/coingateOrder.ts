import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn,
  UpdateDateColumn } from 'typeorm'
import { User } from 'entities'

const shortid = require('shortid')
const uuidv4 = require('uuid/v4')

@Entity('coingateOrder')
export class CoingateOrder {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column({ nullable: true })
  orderCreatedAt?: Date

  @Column({ nullable: true })
  paymentUrl: number

  @Column({ nullable: true })
  priceAmount: number

  @Column({ nullable: true })
  priceCurrency: string

  @Column({ nullable: true })
  receiveAmount: number

  @Column({ nullable: true })
  receiveCurrency: string

  @Column({ nullable: true })
  status: string

  @Column({ unique: true })
  token: string

  @ManyToOne(type => User, user => user.coingateOrders, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
    this.token = uuidv4()
  }
}
