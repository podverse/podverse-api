import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
export class ItemValueTag {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar', length: 255 })
  type!: string;

  @Column({ type: 'varchar', length: 255 })
  method!: string;

  @Column({ type: 'float', nullable: true })
  suggested?: number;
}