import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@orm/entities/item/item';

@Entity()
export class ItemSocialInteract {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar' })
  protocol!: string;

  @Column({ type: 'varchar' })
  uri!: string;

  @Column({ type: 'varchar', nullable: true })
  account_id?: string | null;

  @Column({ type: 'varchar', nullable: true })
  account_url?: string | null;

  @Column({ type: 'int', nullable: true })
  priority?: number | null;
}