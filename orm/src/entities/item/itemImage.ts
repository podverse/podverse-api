import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@orm/entities/item/item';

@Entity()
export class ItemImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar' })
  url!: string;

  @Column({ type: 'int', nullable: true })
  image_width_size?: number;

  @Column({ type: 'boolean', default: false })
  is_resized!: boolean;
}