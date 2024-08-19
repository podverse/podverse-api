import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SharableStatus } from '@/entities/sharableStatus';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  idText!: string;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @ManyToOne(() => SharableStatus, sharableStatus => sharableStatus.id)
  @JoinColumn({ name: 'sharable_status_id' })
  sharableStatus!: SharableStatus;
}
