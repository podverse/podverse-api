import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ItemValue } from '@orm/entities/item/itemValue';

@Entity()
export class ItemValueRecipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValue, itemValue => itemValue.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_id' })
  item_value!: ItemValue;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  address!: string;

  @Column({ type: 'float' })
  split!: number;

  @Column({ type: 'varchar', nullable: true })
  name?: string | null;

  @Column({ type: 'varchar', nullable: true })
  custom_key?: string | null;

  @Column({ type: 'varchar', nullable: true })
  custom_value?: string | null;

  @Column({ type: 'boolean', default: false })
  fee!: boolean;
}