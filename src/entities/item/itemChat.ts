import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
export class ItemChat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar' })
  server!: string;

  @Column({ type: 'varchar', nullable: true })
  protocol?: string;

  @Column({ type: 'varchar', nullable: true })
  account_id?: string;

  @Column({ type: 'varchar', nullable: true })
  space?: string;
}