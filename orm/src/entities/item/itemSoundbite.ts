import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { Item } from '@orm/entities/item/item';
const shortid = require('shortid');

@Entity()
export class ItemSoundbite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  id_text!: string;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'int' })
  start_time!: number;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'varchar', nullable: true })
  title?: string | null;

  @BeforeInsert()
  generateIdText() {
    this.id_text = shortid.generate();
  }
}