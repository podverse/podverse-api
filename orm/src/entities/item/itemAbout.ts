import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '@orm/entities/item/item';
import { ItemItunesEpisodeType } from '@orm/entities/item/itemItunesEpisodeType';

@Entity()
export class ItemAbout {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'int', nullable: true })
  duration?: number | null;

  @Column({ type: 'boolean', nullable: true })
  explicit?: boolean | null;

  @Column({ type: 'varchar', name: 'website_link_url', nullable: true })
  website_link_url?: string | null;

  @ManyToOne(() => ItemItunesEpisodeType, itemItunesEpisodeType => itemItunesEpisodeType.id, { nullable: true })
  @JoinColumn({ name: 'item_itunes_episode_type_id' })
  item_itunes_episode_type?: ItemItunesEpisodeType | null;
}