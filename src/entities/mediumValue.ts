import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'medium_value' })
export class MediumValue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  value!: string;
}
