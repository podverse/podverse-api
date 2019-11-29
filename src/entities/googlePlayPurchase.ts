import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from '~/entities'

// https://developers.google.com/android-publisher/api-ref/purchases/products#resource

@Entity('googlePlayPurchase')
export class GooglePlayPurchase {

  @Index()
  @PrimaryColumn('varchar')
  transactionId: string

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
  purchaseTimeMillis: string

  @Column({ nullable: true })
  purchaseState: number

  @Column({ unique: true })
  purchaseToken: string

  @ManyToOne(type => User, user => user.googlePlayPurchases, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
