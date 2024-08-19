import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
export class ItemSoundbite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  id_text!: string;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar', length: 255 })
  url!: string;

  @Column({ type: 'int' })
  start_time!: number;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;
}