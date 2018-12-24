import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from 'entities'

@Entity('coingateOrder')
export class CoingateOrder {

  @PrimaryColumn('varchar')
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

  @Column({ nullable: true })
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
}
