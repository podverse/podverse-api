import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class LiveItemStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  status!: 'pending' | 'live' | 'ended';
}