import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  node_text!: string;

  @Column({ type: 'varchar', length: 255 })
  display_name!: string;

  @Column({ type: 'varchar', length: 255 })
  slug!: string;
}
