import { Entity, PrimaryGeneratedColumn, Column, Unique, Check } from 'typeorm';

export enum ChannelItunesTypeItunesTypeEnum {
  Episodic = 1,
  Serial = 2
}

export function getChannelItunesTypeItunesTypeEnumValue(input: string): ChannelItunesTypeItunesTypeEnum | undefined {
  const sanitizedInput = input
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  const mapping: { [key: string]: ChannelItunesTypeItunesTypeEnum } = {
    episodic: ChannelItunesTypeItunesTypeEnum.Episodic,
    serial: ChannelItunesTypeItunesTypeEnum.Serial,
  };

  return mapping[sanitizedInput];
}

@Entity()
@Unique(['itunes_type'])
@Check(`itunes_type IN ('episodic', 'serial')`)
export class ChannelItunesType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: ChannelItunesTypeItunesTypeEnum
  })
  itunes_type!: ChannelItunesTypeItunesTypeEnum;
}
