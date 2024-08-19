import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemEnclosure } from '@/entities/item/itemEnclosure';

@Entity()
export class ItemEnclosureSource {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemEnclosure, itemEnclosure => itemEnclosure.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_enclosure_id' })
  itemEnclosure!: ItemEnclosure;

  @Column({ type: 'varchar', length: 255 })
  uri!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contentType?: string;
}
