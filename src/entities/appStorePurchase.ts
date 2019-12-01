import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from '~/entities'

/* tslint:disable:variable-name */

// https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html

@Entity('appStorePurchase')
export class AppStorePurchase {

  @Index()
  @PrimaryColumn('varchar')
  transactionId: string

  // START: Apple Developer responseBody.Receipt.In_app based fields
  // https://developer.apple.com/documentation/appstorereceipts/responsebody/receipt/in_app
  @Column({ nullable: true })
  cancellation_date: string

  @Column({ nullable: true })
  cancellation_date_ms: string

  @Column({ nullable: true })
  cancellation_date_pst: string

  @Column({ nullable: true })
  cancellation_reason: string

  @Column({ nullable: true })
  expires_date: string

  @Column({ nullable: true })
  expires_date_ms: string

  @Column({ nullable: true })
  expires_date_pst: string

  @Column({ nullable: true })
  is_in_intro_offer_period: boolean

  @Column({ nullable: true })
  is_trial_period: boolean

  @Column({ nullable: true })
  original_purchase_date: string

  @Column({ nullable: true })
  original_purchase_date_ms: string

  @Column({ nullable: true })
  original_purchase_date_pst: string

  @Column({ nullable: true })
  original_transaction_id: string

  @Column({ nullable: true })
  product_id: string

  @Column({ nullable: true })
  promotional_offer_id: string

  @Column({ nullable: true })
  purchase_date: string

  @Column({ nullable: true })
  purchase_date_ms: string

  @Column({ nullable: true })
  purchase_date_pst: string

  @Column({ nullable: true })
  quantity: number

  @Column({ nullable: true })
  transaction_id: string

  @Column({ nullable: true })
  web_order_line_item_id: string

  // END: Apple Developer responseBody.Receipt.In_app based fields

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
