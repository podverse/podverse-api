import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn,
  UpdateDateColumn } from 'typeorm'
import { User } from '~/entities'

// https://developers.google.com/android-publisher/api-ref/purchases/products#resource

@Entity('googlePlayPurchase')
export class GooglePlayPurchase {

  @Index()
  @PrimaryColumn('varchar')
  orderId: string

  @Column({ nullable: true })
  acknowledgementState: number

  @Column({ nullable: true })
  consumptionState: number

  @Column({ nullable: true })
  developerPayload: string

  @Column({ nullable: true })
  kind: string

  @Column()
  productId: string

  @Column({ nullable: true })
  purchaseTimeMillis: number

  @Column({ nullable: true })
  purchaseState: number

  @Column({ unique: true })
  purchaseToken: string

  @Index()
  @Column({ nullable: true })
  transactionDate: Date

  @Column({ unique: true })
  transactionReceipt: string

  @ManyToOne(type => User, user => user.googlePlayPurchases, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  @BeforeUpdate()
  beforeAll () {
    if (this.purchaseTimeMillis) {
      this.transactionDate = new Date(this.purchaseTimeMillis)
    }
  }
}
