/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsEmail, IsUUID, Validate, ValidateIf } from 'class-validator'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index,
  OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { BitPayInvoice, MediaRef, PayPalOrder, Playlist } from '~/entities'
import { ValidatePassword } from '~/entities/validation/password'
import { NowPlayingItem } from '~/lib/utility/nowPlayingItem'
import { AppStorePurchase } from './appStorePurchase'
import { GooglePlayPurchase } from './googlePlayPurchase'

const shortid = require('shortid')

@Entity('users')
export class User {

  @Index()
  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Index()
  @IsEmail()
  @Column({
    select: false,
    unique: true
  })
  email: string

  @ValidateIf(a => a.emailVerificationToken != null)
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
  isPublic: boolean

  @Column({
    nullable: true,
    select: false
  })
  membershipExpiration: Date

  @Column({ nullable: true })
  name: string

  @Validate(ValidatePassword)
  @Column({ select: false })
  password: string

  @ValidateIf(a => a.resetPasswordToken != null)
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

  @OneToMany(type => AppStorePurchase, appStorePurchase => appStorePurchase.owner)
  appStorePurchases: AppStorePurchase[]

  @OneToMany(type => BitPayInvoice, bitpayInvoice => bitpayInvoice.owner)
  bitpayInvoices: BitPayInvoice[]

  @OneToMany(type => GooglePlayPurchase, googlePlayPurchase => googlePlayPurchase.owner)
  googlePlayPurchases: GooglePlayPurchase[]

  @OneToMany(type => MediaRef, mediaRefs => mediaRefs.owner)
  mediaRefs: MediaRef[]

  @OneToMany(type => PayPalOrder, paypalOrder => paypalOrder.owner)
  paypalOrders: PayPalOrder[]

  @OneToMany(type => Playlist, playlist => playlist.owner)
  playlists: Playlist[]

  @CreateDateColumn({ select: false })
  createdAt: Date

  @UpdateDateColumn({ select: false })
  updatedAt: Date

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()

    this.subscribedPlaylistIds = this.subscribedPlaylistIds || []
    this.subscribedPodcastIds = this.subscribedPodcastIds || []
    this.subscribedUserIds = this.subscribedUserIds || []

    this.queueItems = (this.queueItems && Array.isArray(this.queueItems) && this.queueItems) || []
    this.historyItems = (this.historyItems && Array.isArray(this.historyItems) && this.historyItems) || []
  }

  @BeforeUpdate()
  beforeUpdate () {
    this.subscribedPlaylistIds = this.subscribedPlaylistIds || []
    this.subscribedPodcastIds = this.subscribedPodcastIds || []
    this.subscribedUserIds = this.subscribedUserIds || []

    this.queueItems = (this.queueItems && Array.isArray(this.queueItems) && this.queueItems) || []
    this.historyItems = (this.historyItems && Array.isArray(this.historyItems) && this.historyItems) || []
  }
}
