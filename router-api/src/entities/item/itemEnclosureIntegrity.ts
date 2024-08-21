import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemEnclosureSource } from '@/entities/item/itemEnclosureSource';

@Entity()
export class ItemEnclosureIntegrity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemEnclosureSource, itemEnclosureSource => itemEnclosureSource.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_enclosure_id' })
  item_enclosure_source!: ItemEnclosureSource;

  @Column({ type: 'text' })
  type!: 'sri' | 'pgp-signature';

  @Column({ type: 'text' })
  value!: string;
}