import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
export class ItemChat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar', length: 255 })
  server!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  protocol?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  space?: string;
}