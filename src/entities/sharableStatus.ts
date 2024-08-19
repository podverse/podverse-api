import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SharableStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  status!: 'public' | 'unlisted' | 'private';
}