import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { SharableStatus } from '@orm/entities/sharableStatus';
const shortid = require('shortid');

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  id_text!: string;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @ManyToOne(() => SharableStatus, sharableStatus => sharableStatus.id)
  @JoinColumn({ name: 'sharable_status_id' })
  sharable_status!: SharableStatus;

  @BeforeInsert()
  generateIdText() {
    this.id_text = shortid.generate();
  }
}
