import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from '~/entities'

// https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html

@Entity('appStorePurchase')
export class AppStorePurchase {

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
  purchaseTimeMillis: string

  @Column({ nullable: true })
  status: number

  @Column({ unique: true })
  transactionReceipt: string

  @ManyToOne(type => User, user => user.appStorePurchases, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
