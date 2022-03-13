/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsEmail, IsUUID, Validate, ValidateIf } from 'class-validator'
import { NowPlayingItem } from 'podverse-shared'
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { BitPayInvoice, MediaRef, PayPalOrder, Playlist, UserHistoryItem, UserQueueItem } from '~/entities'
import { ValidatePassword } from '~/entities/validation/password'
import { AppStorePurchase } from './appStorePurchase'
import { GooglePlayPurchase } from './googlePlayPurchase'
import { UserNowPlayingItem } from './userNowPlayingItem'
import { generateShortId } from '~/lib/utility'

@Entity('users')
export class User {
  @PrimaryColumn('varchar', {
    default: generateShortId(),
    length: 14
  })
  id: string

  @Column()
  @Generated('increment')
  int_id: number

  @Column('varchar', {
    array: true,
    default: () => 'array[]::text[]',
    select: false
  })
  addByRSSPodcastFeedUrls: string[]

  @Index()
  @IsEmail()
  @Column({
    select: false,
    unique: true
  })
  email: string

  @ValidateIf((a) => a.emailVerificationToken != null)
  @IsUUID()
  @Column({
    nullable: true,
    select: false,
    unique: true
  })
  emailVerificationToken: string

  @Column({
    nullable: true,
    select: false
  })
  emailVerificationTokenExpiration: Date

  @Column({
    default: false,
    select: false
  })
  emailVerified: boolean

  @Column({
    nullable: true,
    select: false
  })
  freeTrialExpiration: Date

  @Column({ default: false })
  isDevAdmin: boolean

  @Index()
  @Column({ default: false })
  isPublic: boolean

  @Column({
    nullable: true,
    select: false
  })
  membershipExpiration: Date

  @Index()
  @Column({ nullable: true })
  name: string

  @Validate(ValidatePassword)
  @Column({ select: false })
  password: string

  @ValidateIf((a) => a.resetPasswordToken != null)
  @IsUUID()
  @Column({
    nullable: true,
    select: false,
    unique: true
  })
  resetPasswordToken: string

  @Column({
    nullable: true,
    select: false
  })
  resetPasswordTokenExpiration: Date

  @Column('varchar', {
    array: true,
    default: () => 'array[]::text[]',
    select: false
  })
  roles: string[]

  @Column('varchar', {
    array: true,
    default: () => 'array[]::text[]',
    select: false
  })
  subscribedPlaylistIds: string[]

  @Column('varchar', {
    array: true,
    default: () => 'array[]::text[]',
    select: false
  })
  subscribedPodcastIds: string[]

  @Column('varchar', {
    array: true,
    default: () => 'array[]::text[]',
    select: false
  })
  subscribedUserIds: string[]

  @Column('simple-json', { select: false })
  historyItems: NowPlayingItem[]

  @Column('simple-json', { select: false })
  queueItems: NowPlayingItem[]

  @OneToMany((type) => AppStorePurchase, (appStorePurchase) => appStorePurchase.owner)
  appStorePurchases: AppStorePurchase[]

  @OneToMany((type) => BitPayInvoice, (bitpayInvoice) => bitpayInvoice.owner)
  bitpayInvoices: BitPayInvoice[]

  @OneToMany((type) => GooglePlayPurchase, (googlePlayPurchase) => googlePlayPurchase.owner)
  googlePlayPurchases: GooglePlayPurchase[]

  @OneToMany((type) => MediaRef, (mediaRefs) => mediaRefs.owner)
  mediaRefs: MediaRef[]

  @OneToMany((type) => PayPalOrder, (paypalOrder) => paypalOrder.owner)
  paypalOrders: PayPalOrder[]

  @OneToMany((type) => Playlist, (playlist) => playlist.owner)
  playlists: Playlist[]

  @OneToMany((type) => UserHistoryItem, (userHistoryItem) => userHistoryItem.owner)
  userHistoryItems: UserHistoryItem[]

  @OneToOne((type) => UserNowPlayingItem, (userNowPlayingItem) => userNowPlayingItem.owner)
  @JoinColumn()
  userNowPlayingItem: UserNowPlayingItem

  @OneToMany((type) => UserQueueItem, (userQueueItem) => userQueueItem.owner)
  userQueueItems: UserQueueItem[]

  @CreateDateColumn({ select: false })
  createdAt: Date

  @UpdateDateColumn({ select: false })
  updatedAt: Date

  @BeforeInsert()
  beforeInsert() {
    this.id = generateShortId()

    this.addByRSSPodcastFeedUrls = this.addByRSSPodcastFeedUrls || []
    this.subscribedPlaylistIds = this.subscribedPlaylistIds || []
    this.subscribedPodcastIds = this.subscribedPodcastIds || []
    this.subscribedUserIds = this.subscribedUserIds || []
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.addByRSSPodcastFeedUrls = this.addByRSSPodcastFeedUrls || []
    this.subscribedPlaylistIds = this.subscribedPlaylistIds || []
    this.subscribedPodcastIds = this.subscribedPodcastIds || []
    this.subscribedUserIds = this.subscribedUserIds || []
  }
}
