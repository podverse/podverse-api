import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemEnclosure } from '@orm/entities/item/itemEnclosure';

@Entity()
export class ItemEnclosureIntegrity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemEnclosure, itemEnclosureSource => itemEnclosureSource.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_enclosure_id' })
  item_enclosure!: ItemEnclosure;

  @Column({ type: 'text' })
  type!: 'sri' | 'pgp-signature';

  @Column({ type: 'text' })
  value!: string;
}