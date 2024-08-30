import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ItemValue } from '@orm/entities/item/itemValue';

@Entity()
export class ItemValueTimeSplit {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemValue, itemValue => itemValue.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_value_id' })
  item_value!: ItemValue;

  @Column({ type: 'int' })
  start_time!: number;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'int', default: 0 })
  remote_start_time!: number;

  @Column({ type: 'int', default: 100 })
  remote_percentage!: number;

  @BeforeInsert()
  @BeforeUpdate()
  capRemotePercentage() {
    if (this.remote_percentage > 100) {
      this.remote_percentage = 100;
    }
  }
}