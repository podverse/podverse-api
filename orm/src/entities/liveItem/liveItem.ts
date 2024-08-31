import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@orm/entities/item/item';
import { LiveItemStatus, LiveItemStatusEnum } from '@orm/entities/liveItem/liveItemStatus';

@Entity()
export class LiveItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @ManyToOne(() => LiveItemStatus, liveItemStatus => liveItemStatus.id)
  @JoinColumn({ name: 'live_item_status_id' })
  live_item_status!: LiveItemStatusEnum;

  @Column({ type: 'timestamptz' })
  start_time!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  end_time?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  chat_web_url?: string | null;
}