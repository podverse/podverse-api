import { Entity, PrimaryGeneratedColumn, Column, Unique, Check } from 'typeorm';

export enum ItemItunesEpisodeTypeEnum {
  Full = 1,
  Trailer = 2,
  Bonus = 3
}

export function getItemItunesEpisodeTypeEnumValue(input: string): ItemItunesEpisodeTypeEnum {
  const sanitizedInput = input
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  const mapping: { [key: string]: ItemItunesEpisodeTypeEnum } = {
    full: ItemItunesEpisodeTypeEnum.Full,
    trailer: ItemItunesEpisodeTypeEnum.Trailer,
    bonus: ItemItunesEpisodeTypeEnum.Bonus
  };

  return mapping[sanitizedInput] || mapping['full'];
}

@Entity()
@Unique(['itunes_episode_type'])
@Check(`"itunes_episode_type" IN ('full', 'trailer', 'bonus')`)
export class ItemItunesEpisodeType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', name: 'itunes_episode_type' })
  itunes_episode_type!: string;
}
