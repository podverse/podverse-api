import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { Account } from '@orm/entities/account/account';
import { SharableStatus } from '@orm/entities/sharableStatus';
import { Medium } from '@orm/entities/medium';
const shortid = require('shortid');

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  id_text!: string;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => SharableStatus, sharableStatus => sharableStatus.id)
  @JoinColumn({ name: 'sharable_status_id' })
  sharable_status!: SharableStatus;

  @Column({ type: 'varchar', nullable: true })
  title?: string | null;

  @Column({ type: 'varchar', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: false })
  is_default_favorites!: boolean;

  @Column({ type: 'boolean', default: false })
  is_public!: boolean;

  @Column({ type: 'int', default: 0 })
  item_count!: number;

  @ManyToOne(() => Medium, medium => medium.id)
  @JoinColumn({ name: 'medium_id' })
  medium!: Medium;

  @BeforeInsert()
  generateIdText() {
    this.id_text = shortid.generate();
  }
}