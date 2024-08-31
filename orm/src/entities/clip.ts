import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { Account } from '@orm/entities/account/account';
import { Item } from '@orm/entities/item/item';
import { SharableStatus } from '@orm/entities/sharableStatus';
const shortid = require('shortid');

@Entity()
export class Clip {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  id_text!: string;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  start_time!: string;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  end_time?: string | null;

  @Column({ type: 'varchar', nullable: true })
  title?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => SharableStatus, sharableStatus => sharableStatus.id)
  @JoinColumn({ name: 'sharable_status_id' })
  sharable_status!: SharableStatus;

  @BeforeInsert()
  generateIdText() {
    this.id_text = shortid.generate();
  }
}