import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';
import { SharableStatus } from '@/entities/sharableStatus';
import { MediumValue } from '@/entities/mediumValue';

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  idText!: string;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => SharableStatus, sharableStatus => sharableStatus.id)
  @JoinColumn({ name: 'sharable_status_id' })
  sharableStatus!: SharableStatus;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  isDefaultFavorites!: boolean;

  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  @Column({ type: 'int', default: 0 })
  itemCount!: number;

  @ManyToOne(() => MediumValue, mediumValue => mediumValue.id)
  @JoinColumn({ name: 'medium_value_id' })
  mediumValue!: MediumValue;
}