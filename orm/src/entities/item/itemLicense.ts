import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Item } from '@orm/entities/item/item';

@Entity()
@Unique(['item'])
export class ItemLicense {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar' })
  identifier!: string;

  @Column({ type: 'varchar', nullable: true })
  url!: string | null;
}