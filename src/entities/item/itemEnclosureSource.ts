import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemEnclosure } from '@/entities/item/itemEnclosure';

@Entity()
export class ItemEnclosureSource {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemEnclosure, itemEnclosure => itemEnclosure.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_enclosure_id' })
  item_enclosure!: ItemEnclosure;

  @Column({ type: 'varchar' })
  uri!: string;

  @Column({ type: 'varchar', nullable: true })
  content_type?: string;
}
