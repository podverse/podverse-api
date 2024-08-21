import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
@Unique(['item'])
export class ItemLicense {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  url!: string;
}