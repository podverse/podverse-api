import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelSeason } from '@orm/entities/channel/channelSeason';
import { Item } from '@orm/entities/item/item';

@Entity()
export class ItemSeason {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChannelSeason, channelSeason => channelSeason.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_season_id' })
  channel_season!: ChannelSeason;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar' })
  title!: string;
}