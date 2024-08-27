import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Check } from 'typeorm';
import { Item } from '@orm/entities/item/item';

@Entity()
@Check(`(geo IS NOT NULL AND osm IS NULL) OR (geo IS NULL AND osm IS NOT NULL)`)
export class ItemLocation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar', nullable: true })
  geo?: string | null;

  @Column({ type: 'varchar', nullable: true })
  osm?: string | null;

  @Column({ type: 'varchar', nullable: true })
  name!: string | null;
}