import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  node_text!: string;

  @Column({ type: 'varchar' })
  display_name!: string;

  @Column({ type: 'varchar' })
  slug!: string;
}
