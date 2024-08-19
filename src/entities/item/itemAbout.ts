import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@/entities/item/item';
import { ItemItunesEpisodeType } from '@/entities/item/itemItunesEpisodeType';

@Entity()
export class ItemAbout {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'boolean', nullable: true })
  explicit?: boolean;

  @Column({ type: 'varchar', name: 'website_link_url', nullable: true })
  websiteLinkUrl?: string;

  @ManyToOne(() => ItemItunesEpisodeType, itemItunesEpisodeType => itemItunesEpisodeType.id, { nullable: true })
  @JoinColumn({ name: 'item_itunes_episode_type_id' })
  itemItunesEpisodeType?: ItemItunesEpisodeType;
}