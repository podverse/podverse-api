import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@orm/entities/item/item';
import { ChannelSeason } from '../channel/channelSeason';

@Entity()
export class ItemSeasonEpisode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', name: 'channel_season_id' })
  channel_season_id!: number;

  @ManyToOne(() => ChannelSeason, channel_season => channel_season.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_season_id' })
  channel_season!: ChannelSeason;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar', nullable: true })
  display?: string | null;

  @Column({ type: 'float' })
  episode_number!: number;
}
