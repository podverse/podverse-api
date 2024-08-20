import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';

@Entity()
export class ItemSocialInteract {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar', length: 255 })
  protocol!: string;

  @Column({ type: 'varchar', length: 255 })
  uri!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  account_id?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  account_url?: string;

  @Column({ type: 'int', nullable: true })
  priority?: number;
}